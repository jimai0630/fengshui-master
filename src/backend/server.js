import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
        // If we already have some answer, return partial rather than fail hard
        if (fullAnswer && fullAnswer.trim().length > 0) {
            console.warn('[Dify Stream] Stream interrupted but partial answer captured. Returning partial.', err);
            return { fullAnswer, conversationId, events: eventSnippets, firstErrorPayload, partial: true };
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
                floor_index: userData.floorIndex,
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

                // Only retry on connection reset (server closed connection while waiting)
                if (err?.code === 'ECONNRESET' && attempt < MAX_RETRIES) {
                    const backoffMs = 1000 * (attempt + 1); // 1s, 2s
                    console.warn(`[energy-summary] Connection reset, retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
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
                floor_index: userData.floorIndex,
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

        const { fullAnswer, conversationId } = await postStreamingToDify('/chat-messages', payload, DIFY_API_KEY_REPORT);

        const pdfMatch = fullAnswer.match(/data:application\/pdf;base64,([A-Za-z0-9+/=]+)/);
        const pdfBase64 = pdfMatch ? pdfMatch[1] : undefined;

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

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Dify proxy server running on port ${PORT}`);
    });
}

export default app;
