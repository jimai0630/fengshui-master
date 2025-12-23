import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 动态导入 puppeteer，根据环境选择
let puppeteer;
let chromium;

// 检测是否在 Vercel/serverless 环境
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// 初始化 puppeteer（延迟加载）
async function getPuppeteer() {
    if (!puppeteer) {
        if (isVercel) {
            // Vercel/serverless 环境：使用 puppeteer-core + @sparticuz/chromium
            puppeteer = (await import('puppeteer-core')).default;
            chromium = (await import('@sparticuz/chromium')).default;
            
            // 配置 Chromium 选项（减少内存使用）
            chromium.setGraphicsMode(false);
        } else {
            // 本地开发环境：使用标准 puppeteer
            puppeteer = (await import('puppeteer')).default;
        }
    }
    return { puppeteer, chromium };
}

dotenv.config({ path: join(__dirname, '.env') });
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 4000;
const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY_LAYOUT = process.env.DIFY_API_KEY_LAYOUT || process.env.DIFY_API_KEY;
const DIFY_API_KEY_REPORT = process.env.DIFY_API_KEY_REPORT || process.env.DIFY_API_KEY;
const DEFAULT_USER_ID = process.env.DIFY_DEFAULT_USER || 'fengshui-user';

if (!DIFY_API_KEY_LAYOUT && !DIFY_API_KEY_REPORT) {
    console.warn('[WARN] DIFY_API_KEY_LAYOUT or DIFY_API_KEY_REPORT is not set. API requests will fail.');
}

// Initialize Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || '';
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
}) : null;

// 添加调试日志
console.log('[DEBUG] Environment check:', {
    hasStripeKey: !!STRIPE_SECRET_KEY,
    hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET,
    hasProductId: !!STRIPE_PRODUCT_ID,
    stripeKeyLength: STRIPE_SECRET_KEY?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
});

if (!stripe) {
    console.warn('[WARN] STRIPE_SECRET_KEY is not set. Payment endpoints will not work.');
}

if (STRIPE_PRODUCT_ID) {
    console.log('[Stripe] Product ID configured:', STRIPE_PRODUCT_ID);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Webhook endpoint needs raw body for signature verification
// This must be before other routes that use express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// 简单的重试封装，用于临时性网络错误或 5xx
import http from 'http';
import https from 'https';

// Keep-alive agents to prevent spurios ECONNRESET
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

// 简单的重试封装，用于临时性网络错误或 5xx
async function fetchWithRetry(url, options, { retries = 2, backoffMs = 1000 } = {}) {
    let lastError;
    // Default timeout 120s for Dify calls to handle slow models
    const TIMEOUT_MS = 120000;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const agent = url.startsWith('https') ? httpsAgent : httpAgent;
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                agent
            });
            clearTimeout(timeoutId);

            if (!res.ok && res.status >= 500 && attempt < retries) {
                const waitTime = backoffMs * (attempt + 1);
                console.warn(`[fetchWithRetry] 5xx error (${res.status}), retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }
            return res;
        } catch (err) {
            clearTimeout(timeoutId);
            lastError = err;
            // 仅对常见网络错误进行重试
            const transient =
                err?.code &&
                ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'].includes(err.code);

            if (attempt < retries && transient) {
                const waitTime = backoffMs * (attempt + 1);
                console.warn(`[fetchWithRetry] Network error (${err.code}), retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

/**
 * Helper: call Dify JSON endpoint
 */
async function postJsonToDify(path, body, apiKey) {
    // Disable retries for Dify calls to prevent double-charging/double-execution
    // if the response is slow but actually processing.
    const response = await fetchWithRetry(`${DIFY_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }, { retries: 0 });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Dify API error: ${message}`);
    }

    return response.json();
}

/**
 * Helper: call Dify streaming endpoint and aggregate result
 */
async function postStreamingToDify(path, body, apiKey) {
    // Disable retries for Dify calls to prevent double-charging/double-execution
    const response = await fetchWithRetry(`${DIFY_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }, { retries: 0 });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Dify API error: ${message}`);
    }

    // Node-fetch returns a Node.js stream, not a Web Stream with getReader()
    // Use a buffered line reader to avoid losing partial lines between chunks
    const decoder = new TextDecoder();
    let buffer = '';
    let fullAnswer = '';
    let conversationId = body.conversation_id || '';
    const eventSnippets = [];
    let firstErrorPayload = null;

    try {
        for await (const chunk of response.body) {
            buffer += decoder.decode(chunk, { stream: true });

            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);

                if (!line || !line.startsWith('data:')) continue;

                const payload = line.slice(5).trim();
                if (!payload || payload === '[DONE]') continue;

                try {
                    const data = JSON.parse(payload);
                    // Collect a few snippets for debugging when answer is empty
                    if (eventSnippets.length < 5) {
                        eventSnippets.push({
                            event: data.event || 'data',
                            hasAnswer: !!data.answer,
                            hasError: !!data.error,
                            hasMessage: !!data.message,
                            answerPreview: data.answer ? data.answer.slice(0, 80) : '',
                            error: data.error,
                            message: data.message
                        });
                    }

                    if (!firstErrorPayload && (data.event === 'error' || data.error || data.message)) {
                        firstErrorPayload = data;
                    }

                    if (data.conversation_id) {
                        conversationId = data.conversation_id;
                    }
                    if (data.answer) {
                        fullAnswer += data.answer;
                    }

                    if (data.error) {
                        console.warn('[Dify Stream] Error event:', data.error);
                    }
                } catch (e) {
                    console.warn('[Dify Stream] Parse error for line:', line, e);
                }
            }
        }
    } catch (err) {
        // Handle "Premature close" and other stream errors
        const errorMessage = err?.message || String(err);
        const isPrematureClose = errorMessage.includes('Premature close') || 
                                 errorMessage.includes('ECONNRESET') ||
                                 errorMessage.includes('aborted');
        
        // If we already have some answer, return partial rather than fail hard
        if (fullAnswer && fullAnswer.trim().length > 0) {
            console.warn('[Dify Stream] Stream interrupted but partial answer captured. Returning partial.', {
                error: errorMessage,
                answerLength: fullAnswer.length,
                isPrematureClose
            });
            return { fullAnswer, conversationId, events: eventSnippets, firstErrorPayload, partial: true };
        }
        
        // If it's a premature close and we have no answer, provide more context
        if (isPrematureClose) {
            console.error('[Dify Stream] Premature close error:', {
                error: errorMessage,
                code: err?.code,
                events: eventSnippets,
                firstErrorPayload
            });
            throw new Error(`Dify stream connection closed prematurely. This may be due to network issues or Dify API timeout. ${firstErrorPayload ? `Error from Dify: ${JSON.stringify(firstErrorPayload)}` : ''}`);
        }
        
        throw err;
    }

    console.log('[Dify Stream Final] Full Answer length:', fullAnswer.length, 'Content:', fullAnswer.substring(0, 50) + '...', 'Events snippet:', eventSnippets, 'First error payload:', firstErrorPayload);

    return { fullAnswer, conversationId, events: eventSnippets, firstErrorPayload };
}

async function streamChatMessages(body, apiKey) {
    const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Dify streaming error: ${message}`);
    }

    // Node-fetch returns a Node.js stream
    const decoder = new TextDecoder();
    const events = [];
    let buffer = '';

    for await (const chunk of response.body) {
        buffer += decoder.decode(chunk, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line || !line.startsWith('data:')) {
                continue;
            }

            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') {
                continue;
            }

            try {
                events.push(JSON.parse(payload));
            } catch (error) {
                console.warn('[chat] Failed to parse SSE chunk:', error);
            }
        }
    }

    return events;
}

/**
 * Generate PDF from markdown content
 */
async function generatePDFFromMarkdown(markdownContent, options = {}) {
    let browser;
    try {
        // 获取正确的 puppeteer 实例
        const { puppeteer: pptr, chromium: chrom } = await getPuppeteer();
        
        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ]
        };

        // 在 Vercel 环境中使用 @sparticuz/chromium
        if (isVercel && chrom) {
            launchOptions.executablePath = await chrom.executablePath();
            // 添加 Chromium 特定的参数
            launchOptions.args.push(...chrom.args);
            console.log('[PDF] Using @sparticuz/chromium for PDF generation');
        } else {
            console.log('[PDF] Using standard puppeteer for PDF generation');
        }

        browser = await pptr.launch(launchOptions);
        const page = await browser.newPage();

        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);

        // Create full HTML document with styling
        const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Arial', 'Microsoft YaHei', 'SimSun', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #d97706;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 2em; border-bottom: 2px solid #d97706; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.2em; }
        p { margin: 1em 0; }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        strong { color: #92400e; }
        blockquote {
            border-left: 4px solid #d97706;
            padding-left: 1em;
            margin: 1em 0;
            color: #666;
        }
        code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f3f4f6;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #d97706;
            color: white;
        }
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>
        `;

        await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            printBackground: true
        });

        return pdfBuffer;
    } catch (error) {
        console.error('[PDF Generation] Error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Upload helper using axios + multipart form-data
 */
async function uploadFileToDify(fileBuffer, { filename, contentType }, userId, apiKey) {
    if (!fileBuffer) {
        throw new Error('Missing file buffer.');
    }
    if (!apiKey) {
        throw new Error('DIFY API Key is not configured.');
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, {
        filename,
        contentType
    });
    formData.append('user', userId || DEFAULT_USER_ID);

    const headers = {
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`
    };

    try {
        const { data } = await axios.post(
            `${DIFY_BASE_URL}/files/upload`,
            formData,
            {
                headers,
                maxBodyLength: Infinity
            }
        );
        return data;
    } catch (error) {
        const apiMessage = error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message;
        throw new Error(`Dify upload failed: ${apiMessage}`);
    }
}

/**
 * Upload file endpoint
 */
app.post('/api/dify/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Missing file field.' });
        }

        const userId =
            (req.body?.user && req.body.user.toString().trim()) || DEFAULT_USER_ID;

        const data = await uploadFileToDify(
            req.file.buffer,
            {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            },
            userId,
            DIFY_API_KEY_LAYOUT
        );
        console.log('[upload] success:', {
            userId,
            filename: req.file.originalname,
            size: req.file.size,
            mime: req.file.mimetype,
            fileId: data?.id
        });
        res.json(data);
    } catch (error) {
        console.error('[upload] error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});

/**
 * Generic chat endpoint proxy
 */
app.post('/api/dify/chat', async (req, res) => {
    try {
        const {
            query,
            inputs = {},
            fileId,
            fileUrl,
            fileType = 'image',
            transferMethod,
            responseMode = 'streaming',
            conversationId = '',
            user = DEFAULT_USER_ID
        } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Missing query field.' });
        }

        const payload = {
            inputs,
            query,
            response_mode: responseMode,
            conversation_id: conversationId,
            user
        };

        const files = [];
        if (fileUrl) {
            files.push({
                type: fileType,
                transfer_method: transferMethod || 'remote_url',
                url: fileUrl
            });
        } else if (fileId) {
            files.push({
                type: fileType,
                transfer_method: transferMethod || 'local_file',
                upload_file_id: fileId
            });
        }

        if (files.length > 0) {
            payload.files = files;
        }

        if (responseMode === 'streaming') {
            const events = await streamChatMessages(payload, DIFY_API_KEY_LAYOUT);
            res.json({
                mode: 'streaming',
                events
            });
        } else {
            const data = await postJsonToDify('/chat-messages', payload, DIFY_API_KEY_LAYOUT);
            res.json({
                mode: 'blocking',
                data
            });
        }
    } catch (error) {
        console.error('[chat] error:', error);
        res.status(500).json({ error: error.message || 'Chat failed' });
    }
});

/**
 * Layout grid endpoint
 */
app.post('/api/dify/layout-grid', async (req, res) => {
    try {
        const { floorPlanFileId, floorPlanFileIds, floorPlanDesc, userData } = req.body;

        // Support both single file ID and array of IDs (take the first one)
        const targetFileId = floorPlanFileId || (floorPlanFileIds && floorPlanFileIds.length > 0 ? floorPlanFileIds[0] : null);

        console.log('[layout-grid] Request received:', {
            hasFileId: !!targetFileId,
            fileId: targetFileId,
            hasUserData: !!userData
        });

        if (!targetFileId) {
            return res.status(400).json({ error: 'Missing floor plan file ID.' });
        }

        const payload = {
            inputs: {
                mode: 'layout_grid',
                floor_index: String(userData.floorIndex || '1'),
                floor_plan_desc: floorPlanDesc || '',
                house_type: userData.houseType || 'apartment',
                language_mode: userData.languageMode || 'zh'
            },
            query: '请分析这个户型图，将其划分为九宫格，并识别每个宫位的房间。',
            response_mode: 'streaming',
            conversation_id: userData.conversationId || '',
            // 使用与上传一致的 user（通常是邮箱），确保 Dify 可以访问对应的已上传文件
            user: userData?.email || DEFAULT_USER_ID,
            files: [
                {
                    type: 'image',
                    transfer_method: 'local_file',
                    upload_file_id: targetFileId
                }
            ]
        };

        console.log('[layout-grid] Sending to Dify:', {
            user: payload.user,
            fileId: targetFileId
        });

        // Streaming mode (Agent 模式不支持 blocking)
        const { fullAnswer, conversationId, events, firstErrorPayload, partial } = await postStreamingToDify('/chat-messages', payload, DIFY_API_KEY_LAYOUT);

        if (!fullAnswer || fullAnswer.trim().length === 0) {
            const errMsg =
                firstErrorPayload?.error?.message ||
                firstErrorPayload?.message ||
                (firstErrorPayload ? JSON.stringify(firstErrorPayload) : 'Empty answer from Dify (no error payload)');

            console.error('[layout-grid] Empty answer from Dify. First error payload:', firstErrorPayload, 'Events:', events);
            return res.status(502).json({
                error: `Dify streaming returned empty answer: ${errMsg}`,
                events
            });
        }

        console.log('[layout-grid] Dify response:', {
            answerLength: fullAnswer?.length,
            conversationId,
            answer: fullAnswer
        });

        // Construct response in the format expected by frontend
        res.json({
            answer: fullAnswer,
            conversation_id: conversationId,
            partial
        });
    } catch (error) {
        console.error('[layout-grid] error:', error);
        res.status(500).json({ error: error.message || 'Layout grid failed' });
    }
});

/**
 * Energy summary endpoint
 * Handle GET requests with friendly error message
 */
app.get('/api/dify/energy-summary', (req, res) => {
    res.status(405).json({ 
        error: 'Method not allowed. This endpoint only accepts POST requests.',
        method: 'POST',
        endpoint: '/api/dify/energy-summary'
    });
});

/**
 * Energy summary endpoint
 */
app.post('/api/dify/energy-summary', async (req, res) => {
    try {
        const { userData, houseGridJson, roomPhotosDesc } = req.body;

        if (!userData?.birthDate || !houseGridJson) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const payload = {
            inputs: {
                mode: 'energy_summary',
                birth_date: userData.birthDate,
                gender: userData.gender,
                benming_star_no: userData.benmingStarNo,
                benming_star_name: userData.benmingStarName,
                house_type: userData.houseType || 'apartment',
                floor_index: String(userData.floorIndex || '1'),
                house_grid_json: houseGridJson,
                room_photos_desc: roomPhotosDesc || '',
                language_mode: userData.languageMode || 'zh'
            },
            query: '请分析我的家居风水能量，给出五个维度的评分和简短概述。',
            response_mode: 'streaming',
            conversation_id: userData.conversationId || '',
            user: userData?.email || DEFAULT_USER_ID
        };

        // Retry logic specifically for slow model responses
        let lastError;
        const MAX_RETRIES = 1; // Limit to 1 retry to avoid excessive duplicates

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[energy-summary] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

                const { fullAnswer, conversationId } = await postStreamingToDify('/chat-messages', payload, DIFY_API_KEY_REPORT);

                console.log('[energy-summary] raw dify answer:', fullAnswer);

                return res.json({
                    answer: fullAnswer,
                    conversation_id: conversationId
                });
            } catch (err) {
                lastError = err;
                const errorMessage = err?.message || String(err);
                const isConnectionError = err?.code === 'ECONNRESET' || 
                                         errorMessage.includes('Premature close') ||
                                         errorMessage.includes('aborted');

                // Retry on connection errors (connection reset or premature close)
                if (isConnectionError && attempt < MAX_RETRIES) {
                    const backoffMs = 1000 * (attempt + 1); // 1s, 2s
                    console.warn(`[energy-summary] Connection error (${errorMessage}), retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, backoffMs));
                    continue;
                }

                // Don't retry other errors or if max retries reached
                throw err;
            }
        }

        throw lastError;
    } catch (error) {
        console.error('[energy-summary] error:', error);
        res.status(500).json({ error: error.message || 'Energy summary failed' });
    }
});

/**
 * Full report endpoint
 * Handle GET requests with friendly error message
 */
app.get('/api/dify/full-report', (req, res) => {
    res.status(405).json({ 
        error: 'Method not allowed. This endpoint only accepts POST requests.',
        method: 'POST',
        endpoint: '/api/dify/full-report'
    });
});

/**
 * Full report endpoint
 */
app.post('/api/dify/full-report', async (req, res) => {
    try {
        const { userData, houseGridJson, roomPhotosDesc } = req.body;

        if (!userData?.birthDate || !houseGridJson) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const payload = {
            inputs: {
                mode: 'full_report',
                birth_date: userData.birthDate,
                gender: userData.gender,
                benming_star_no: userData.benmingStarNo,
                benming_star_name: userData.benmingStarName,
                house_type: userData.houseType || 'apartment',
                floor_index: String(userData.floorIndex || '1'),
                house_grid_json: houseGridJson,
                room_photos_desc: roomPhotosDesc || '',
                language_mode: userData.languageMode || 'zh',
                user_expectation: userData.email ? `用户邮箱: ${userData.email}` : ''
            },
            query: '请生成我的2026年完整风水报告。',
            response_mode: 'streaming',
            conversation_id: userData.conversationId || '',
            user: userData?.email || DEFAULT_USER_ID
        };

        const { fullAnswer, conversationId, partial } = await postStreamingToDify('/chat-messages', payload, DIFY_API_KEY_REPORT);

        // Ensure Dify data is completely received before processing PDF
        if (partial) {
            console.warn('[full-report] Dify response is partial, PDF generation may be incomplete');
        }

        // Validate that we have content before proceeding
        if (!fullAnswer || fullAnswer.trim().length === 0) {
            console.error('[full-report] Empty answer from Dify, cannot generate PDF');
            return res.json({
                conversation_id: conversationId,
                report_content: fullAnswer || '',
                pdf_base64: undefined
            });
        }

        console.log('[full-report] Dify answer received, length:', fullAnswer.length);
        console.log('[full-report] Dify answer preview (first 200 chars):', fullAnswer.substring(0, 200));

        // Try to extract PDF from Dify response
        let pdfBase64 = undefined;
        // Use multiline regex to match base64 that may contain newlines
        const pdfMatch = fullAnswer.match(/data:application\/pdf;base64,([A-Za-z0-9+/=\s]+)/);
        if (pdfMatch) {
            // Remove whitespace (newlines, spaces) from base64 string
            pdfBase64 = pdfMatch[1].replace(/\s/g, '');
            // Also remove any invalid characters (commas, quotes, etc.)
            pdfBase64 = pdfBase64.replace(/[^A-Za-z0-9+/=]/g, '');
            console.log('[full-report] Extracted PDF from Dify response, length:', pdfBase64.length);
        } else {
            // If Dify didn't return PDF, generate it from markdown content
            // Wait a bit to ensure all data is processed
            console.log('[full-report] No PDF in Dify response, generating from markdown...');
            console.log('[full-report] Markdown content length:', fullAnswer.length);
            
            // Output full content for testing before PDF generation
            console.log('='.repeat(80));
            console.log('[full-report] FULL MARKDOWN CONTENT (for testing):');
            console.log('='.repeat(80));
            console.log(fullAnswer);
            console.log('='.repeat(80));
            console.log('[full-report] End of markdown content');
            console.log('='.repeat(80));
            
            try {
                console.log('[full-report] Calling generatePDFFromMarkdown...');
                const pdfResult = await generatePDFFromMarkdown(fullAnswer);
                
                // Handle different return types from puppeteer
                let pdfBuffer;
                if (Buffer.isBuffer(pdfResult)) {
                    pdfBuffer = pdfResult;
                } else if (pdfResult instanceof Uint8Array) {
                    pdfBuffer = Buffer.from(pdfResult);
                } else if (typeof pdfResult === 'string') {
                    // If it's already base64, use it directly
                    pdfBase64 = pdfResult;
                    console.log('[full-report] PDF result is already base64 string');
                } else {
                    console.error('[full-report] Unexpected PDF result type:', typeof pdfResult, pdfResult);
                    throw new Error(`PDF generation returned unexpected type: ${typeof pdfResult}`);
                }
                
                // Only process if we got a buffer
                if (pdfBuffer) {
                    // Validate PDF buffer before encoding
                    if (!Buffer.isBuffer(pdfBuffer)) {
                        throw new Error('PDF buffer is not a Buffer instance after conversion');
                    }
                    
                    console.log('[full-report] PDF buffer size:', pdfBuffer.length, 'bytes');
                    const pdfHeaderFromBuffer = pdfBuffer.slice(0, 4).toString('ascii');
                    console.log('[full-report] PDF buffer header:', pdfHeaderFromBuffer);
                    
                    if (pdfHeaderFromBuffer !== '%PDF') {
                        console.error('[full-report] Invalid PDF buffer header:', pdfHeaderFromBuffer);
                        console.error('[full-report] First 20 bytes (hex):', pdfBuffer.slice(0, 20).toString('hex'));
                        throw new Error('Generated PDF buffer does not have valid PDF header');
                    }
                    
                    // Convert to base64
                    pdfBase64 = pdfBuffer.toString('base64');
                    console.log('[full-report] Base64 encoding completed, length:', pdfBase64.length);
                    console.log('[full-report] Base64 preview (first 50 chars):', pdfBase64.substring(0, 50));
                    
                    // Validate base64 contains expected characters
                    const base64Chars = pdfBase64.match(/[^A-Za-z0-9+/=]/g);
                    if (base64Chars) {
                        console.warn('[full-report] Found unexpected characters in base64:', Array.from(new Set(base64Chars)).join(', '));
                        // Remove invalid characters
                        pdfBase64 = pdfBase64.replace(/[^A-Za-z0-9+/=]/g, '');
                        console.log('[full-report] Cleaned base64, new length:', pdfBase64.length);
                    }
                    
                    console.log('[full-report] PDF generated successfully, final base64 length:', pdfBase64.length);
                }
            } catch (pdfError) {
                console.error('[full-report] PDF generation failed:', pdfError);
                console.error('[full-report] PDF generation error stack:', pdfError.stack);
                // Continue without PDF - frontend can still display the markdown
            }
        }

        // Validate PDF base64 before sending (if present)
        if (pdfBase64) {
            // Check if base64 length is valid (should be multiple of 4, or with padding)
            if (pdfBase64.length === 0) {
                console.warn('[full-report] PDF base64 is empty, setting to undefined');
                pdfBase64 = undefined;
            } else {
                // Log first few characters for debugging
                console.log('[full-report] PDF base64 preview (first 50 chars):', pdfBase64.substring(0, 50));
                console.log('[full-report] PDF base64 length:', pdfBase64.length);
                
                // Validate that decoded PDF has correct header
                try {
                    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
                    const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
                    if (pdfHeader === '%PDF') {
                        console.log('[full-report] PDF file header validated successfully:', pdfHeader);
                        console.log('[full-report] PDF file size:', pdfBuffer.length, 'bytes');
                    } else {
                        console.error('[full-report] Invalid PDF file header:', pdfHeader);
                        console.error('[full-report] Expected: %PDF');
                        console.error('[full-report] First 20 bytes (hex):', pdfBuffer.slice(0, 20).toString('hex'));
                        // Don't send invalid PDF
                        pdfBase64 = undefined;
                    }
                } catch (validationError) {
                    console.error('[full-report] Failed to validate PDF base64:', validationError);
                    // Don't send invalid PDF
                    pdfBase64 = undefined;
                }
            }
        }

        res.json({
            conversation_id: conversationId,
            report_content: fullAnswer,
            pdf_base64: pdfBase64
        });
    } catch (error) {
        console.error('[full-report] error:', error);
        res.status(500).json({ error: error.message || 'Full report failed' });
    }
});

/**
 * Stripe Payment Endpoints
 */

/**
 * Create payment intent endpoint
 */
app.post('/api/stripe/create-payment-intent', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ error: 'Stripe is not configured' });
        }

        const { amount, currency = 'usd', consultationId, metadata = {}, useProduct = false } = req.body;

        let finalAmount = amount;
        let finalCurrency = currency.toLowerCase();

        // If using product ID, fetch price from Stripe product
        if (useProduct && STRIPE_PRODUCT_ID) {
            try {
                const product = await stripe.products.retrieve(STRIPE_PRODUCT_ID);
                const prices = await stripe.prices.list({
                    product: STRIPE_PRODUCT_ID,
                    active: true,
                    limit: 1,
                });

                if (prices.data.length > 0) {
                    const price = prices.data[0];
                    finalAmount = price.unit_amount ? price.unit_amount / 100 : amount; // Convert from cents
                    finalCurrency = price.currency;
                    console.log('[stripe] Using product price:', { amount: finalAmount, currency: finalCurrency });
                }
            } catch (error) {
                console.warn('[stripe] Failed to fetch product price, using provided amount:', error.message);
            }
        }

        if (!finalAmount || finalAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create payment intent (amount in cents)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalAmount * 100), // Convert to cents
            currency: finalCurrency,
            metadata: {
                ...metadata,
                consultation_id: consultationId || '',
                product_id: STRIPE_PRODUCT_ID || '',
                created_at: new Date().toISOString(),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log('[stripe] Payment intent created:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('[stripe] create-payment-intent error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create payment intent',
        });
    }
});

/**
 * Confirm payment endpoint
 */
app.post('/api/stripe/confirm-payment', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ error: 'Stripe is not configured' });
        }

        const { paymentIntentId, consultationId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Missing paymentIntentId' });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Import Supabase functions (we'll need to create a way to call them from backend)
        // For now, we'll return the payment status and let the frontend handle database updates
        // In production, you should update the database here

        res.json({
            status: paymentIntent.status,
            paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert back to dollars
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata,
            },
        });
    } catch (error) {
        console.error('[stripe] confirm-payment error:', error);
        res.status(500).json({
            error: error.message || 'Failed to confirm payment',
        });
    }
});

/**
 * Stripe Webhook endpoint
 * Handles asynchronous payment status updates from Stripe
 */
app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        console.warn('[stripe] Webhook endpoint called but Stripe is not configured');
        return res.status(503).send('Stripe webhook not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('[stripe] Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                {
                    const paymentIntent = event.data.object;
                    console.log('[stripe] PaymentIntent succeeded:', paymentIntent.id);

                    // Here you would update your database
                    // For now, we'll just log it
                    // In production, you should:
                    // 1. Find the payment record by payment_intent_id
                    // 2. Update its status to 'succeeded'
                    // 3. Update the associated consultation record
                    // 4. Ensure idempotency (check if already processed)

                    // Example database update (pseudo-code):
                    // await updatePaymentStatusByIntentId(
                    //     paymentIntent.id,
                    //     'succeeded',
                    //     { stripe_event_id: event.id }
                    // );
                }
                break;

            case 'payment_intent.payment_failed':
                {
                    const paymentIntent = event.data.object;
                    console.log('[stripe] PaymentIntent failed:', paymentIntent.id);

                    // Update payment status to failed
                    // await updatePaymentStatusByIntentId(
                    //     paymentIntent.id,
                    //     'failed',
                    //     { 
                    //         stripe_event_id: event.id,
                    //         failure_reason: paymentIntent.last_payment_error?.message 
                    //     }
                    // );
                }
                break;

            case 'payment_intent.canceled':
                {
                    const paymentIntent = event.data.object;
                    console.log('[stripe] PaymentIntent canceled:', paymentIntent.id);

                    // Update payment status to canceled
                    // await updatePaymentStatusByIntentId(
                    //     paymentIntent.id,
                    //     'canceled',
                    //     { stripe_event_id: event.id }
                    // );
                }
                break;

            default:
                console.log(`[stripe] Unhandled event type: ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
    } catch (error) {
        console.error('[stripe] Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

/**
 * Async Report Generation Endpoints
 */

// Initialize Supabase client (lazy load)
let supabaseClient = null;
async function getSupabaseClient() {
    if (!supabaseClient) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing');
        }
        
        supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
}

/**
 * Background report generation function
 */
async function processReportGeneration(userData, houseGridJson, consultationId) {
    const supabase = await getSupabaseClient();
    
    try {
        // Check if report is already being processed or completed (idempotency)
        const { data: existing } = await supabase
            .from('consultations')
            .select('report_status, full_report_result')
            .eq('id', consultationId)
            .single();
        
        if (existing?.report_status === 'processing') {
            console.log('[async-report] Report already processing, skipping duplicate job');
            return;
        }
        
        if (existing?.report_status === 'completed') {
            console.log('[async-report] Report already completed');
            return;
        }
        
        // Update status to processing
        await supabase
            .from('consultations')
            .update({
                report_status: 'processing',
                report_started_at: new Date().toISOString()
            })
            .eq('id', consultationId);
        
        console.log('[async-report] Starting report generation for:', userData.email);
        
        // Call Dify for full report
        const payload = {
            inputs: {
                mode: 'full_report',
                birth_date: userData.birthDate,
                gender: userData.gender,
                benming_star_no: userData.benmingStarNo,
                benming_star_name: userData.benmingStarName,
                house_type: userData.houseType || 'apartment',
                floor_index: String(userData.floorIndex || '1'),
                house_grid_json: houseGridJson,
                language_mode: userData.languageMode || 'zh'
            },
            query: '请生成我的2026年完整风水报告。',
            response_mode: 'streaming',
            user: userData.email
        };
        
        const { fullAnswer, conversationId } = await postStreamingToDify(
            '/chat-messages', 
            payload, 
            DIFY_API_KEY_REPORT
        );
        
        console.log('[async-report] Dify response received, generating PDF...');
        
        // Generate PDF
        let pdfBase64 = null;
        try {
            const pdfBuffer = await generatePDFFromMarkdown(fullAnswer);
            pdfBase64 = pdfBuffer.toString('base64');
            console.log('[async-report] PDF generated successfully');
        } catch (pdfError) {
            console.error('[async-report] PDF generation failed:', pdfError);
            // Continue without PDF - user can still see markdown
        }
        
        // Save completed report to Supabase
        await supabase
            .from('consultations')
            .update({
                report_status: 'completed',
                report_completed_at: new Date().toISOString(),
                full_report_result: {
                    report_content: fullAnswer,
                    pdf_base64: pdfBase64,
                    conversation_id: conversationId
                },
                report_conversation_id: conversationId,
                payment_completed: true
            })
            .eq('id', consultationId);
            
        console.log('[async-report] Report generation completed for:', userData.email);
        
    } catch (error) {
        console.error('[async-report] Report generation failed:', error);
        
        // Update status to failed
        try {
            await supabase
                .from('consultations')
                .update({
                    report_status: 'failed',
                    report_error: error.message,
                    report_completed_at: new Date().toISOString()
                })
                .eq('id', consultationId);
        } catch (updateError) {
            console.error('[async-report] Failed to update error status:', updateError);
        }
    }
}

/**
 * Start async report generation
 */
app.post('/api/dify/full-report-async', async (req, res) => {
    try {
        const { userData, houseGridJson, consultationId } = req.body;
        
        // Validate required fields
        if (!userData?.email || !userData?.birthDate || !houseGridJson) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (!consultationId) {
            return res.status(400).json({ error: 'Missing consultationId' });
        }
        
        console.log('[async-report] Starting async report generation for:', userData.email);
        
        // Immediately return job started response
        res.json({
            status: 'processing',
            message: 'Report generation started',
            consultationId
        });
        
        // Process in background (don't await)
        processReportGeneration(userData, houseGridJson, consultationId)
            .catch(err => {
                console.error('[async-report] Background job failed:', err);
            });
            
    } catch (error) {
        console.error('[async-report] Error starting job:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check report status
 */
app.get('/api/dify/report-status/:consultationId', async (req, res) => {
    try {
        const { consultationId } = req.params;
        
        const supabase = await getSupabaseClient();
        
        const { data, error } = await supabase
            .from('consultations')
            .select('report_status, report_error, full_report_result, report_completed_at')
            .eq('id', consultationId)
            .single();
            
        if (error) {
            console.error('[report-status] Supabase error:', error);
            throw error;
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Consultation not found' });
        }
        
        res.json({
            status: data.report_status,
            error: data.report_error,
            report: data.full_report_result,
            completedAt: data.report_completed_at
        });
        
    } catch (error) {
        console.error('[report-status] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate PDF from markdown content endpoint
 */
app.post('/api/pdf/generate', async (req, res) => {
    try {
        const { markdownContent, filename } = req.body;

        if (!markdownContent) {
            return res.status(400).json({ error: 'Missing markdownContent' });
        }

        console.log('[pdf] Generating PDF from markdown...');
        const pdfBuffer = await generatePDFFromMarkdown(markdownContent);
        const pdfBase64 = pdfBuffer.toString('base64');

        res.json({
            pdf_base64: pdfBase64,
            filename: filename || `FengShui_Report_${new Date().toISOString().split('T')[0]}.pdf`
        });
    } catch (error) {
        console.error('[pdf] generate error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate PDF' });
    }
});

/**
 * Download PDF endpoint
 */
app.get('/api/pdf/download', async (req, res) => {
    try {
        const { base64, filename } = req.query;

        if (!base64) {
            return res.status(400).json({ error: 'Missing base64 parameter' });
        }

        // Decode base64 to buffer
        const pdfBuffer = Buffer.from(base64, 'base64');

        // Set headers for PDF download
        const downloadFilename = filename || `FengShui_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error('[pdf] download error:', error);
        res.status(500).json({ error: error.message || 'Failed to download PDF' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Dify proxy server running on port ${PORT}`);
    });
}

export default app;
