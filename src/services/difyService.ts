// Dify API Service

import type {
    DifyFileUploadResponse,
    UserCompleteData,
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse,
    DifyChatRequest,
    DifyChatResponse
} from '../types/dify';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '/api';

/**
 * 上传文件到后端，由后端代理到Dify
 * @param file 需要上传的文件
 * @param userId 用于标识终端用户的ID（传给Dify的user字段）
 */
export async function uploadFile(
    file: File,
    userId?: string
): Promise<DifyFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
        formData.append('user', userId);
    }

    const response = await fetch(`${BACKEND_BASE_URL}/dify/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`File upload failed: ${error}`);
    }

    return await response.json();
}

/**
 * 调用通用 chat-messages 接口
 */
export async function chatWithDify(
    payload: DifyChatRequest
): Promise<DifyChatResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/dify/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            responseMode: 'streaming',
            ...payload
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Chat request failed: ${error}`);
    }

    return await response.json();
}

/**
 * Step 1: 调用 Agent1 - layout_grid 模式
 * 支持多楼层平面图上传
 */
export async function callLayoutGrid(
    userData: UserCompleteData,
    floorPlanFileIds: string[], // 支持多个文件ID
    houseType: string,
    languageMode: 'zh' | 'en' | 'mix' = 'zh'
): Promise<{ result: LayoutGridResponse; conversationId: string }> {
    const response = await fetch(`${BACKEND_BASE_URL}/dify/layout-grid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userData,
            floorPlanFileIds,
            houseType,
            languageMode
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Layout grid failed: ${error}`);
    }

    const resultData = await response.json();

    // 解析返回的JSON
    let result: LayoutGridResponse;
    try {
        // Dify可能在answer中返回JSON字符串，可能包含markdown代码块
        const answerText = resultData.answer || '{}';

        // 提取第一个{到最后一个}之间的内容
        const firstBrace = answerText.indexOf('{');
        const lastBrace = answerText.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
            console.error('[callLayoutGrid] No valid JSON found in answer:', answerText.substring(0, 200));
            throw new Error('No JSON object found in response');
        }

        const jsonString = answerText.substring(firstBrace, lastBrace + 1);
        console.log('[callLayoutGrid] Extracted JSON string (first 300 chars):', jsonString.substring(0, 300));

        result = JSON.parse(jsonString);

        // 验证必需字段
        if (typeof result.ok === 'undefined') {
            throw new Error('Invalid response format: missing "ok" field');
        }
    } catch (error) {
        console.error('Failed to parse layout grid response:', error);
        throw new Error('Failed to parse layout grid response');
    }

    return {
        result,
        conversationId: resultData.conversation_id
    };
}

/**
 * Step 2: 调用energy_summary模式
 */
export async function callEnergySummary(
    userData: UserCompleteData,
    houseGridJson: string,
    mode: 'energy_summary' | 'full_report' = 'energy_summary'
): Promise<{ result: EnergySummaryResponse; conversationId: string }> {
    const response = await fetch(`${BACKEND_BASE_URL}/dify/energy-summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userData,
            houseGridJson,
            mode
        })
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Energy summary failed with status ${response.status}`;
        
        if (contentType && contentType.includes('application/json')) {
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If JSON parsing fails, try text
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
        } else {
            // If response is HTML (like Cloudflare error page), backend might not be running
            const errorText = await response.text();
            if (errorText.includes('html') || errorText.includes('<!DOCTYPE')) {
                errorMessage = `Backend server may not be running. Please ensure the backend server is running on port 4000. Status: ${response.status}`;
            } else {
                errorMessage = errorText || errorMessage;
            }
        }
        
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const resultData = await response.json();
    console.log('[Dify] Raw Energy Summary Response:', resultData); // Debug log

    // 解析返回的JSON
    let result: EnergySummaryResponse;
    try {
        const answerText = resultData.answer || '';
        console.log('[Dify] Answer Text Length:', answerText.length);

        // 1. 寻找 JSON 的起始和结束位置
        const firstBrace = answerText.indexOf('{');
        const lastBrace = answerText.lastIndexOf('}');

        // 如果找到了可能的 JSON 对象
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = answerText.substring(firstBrace, lastBrace + 1);

            try {
                result = JSON.parse(jsonString);

                // 2. 提取 JSON 之外的文本作为 summary
                const preText = answerText.substring(0, firstBrace).replace(/```json\s*|```/g, '').trim();
                const postText = answerText.substring(lastBrace + 1).replace(/```/g, '').trim();
                const combinedSummary = [preText, postText].filter(Boolean).join('\n\n').trim();

                if (combinedSummary && combinedSummary.length > 5) {
                    result.overall_summary = combinedSummary;
                    console.log('[Dify] Extracted overall_summary from text:', combinedSummary.substring(0, 50) + '...');
                } else if (result.overall_summary) {
                    console.log('[Dify] Using JSON provided overall_summary');
                } else {
                    console.warn('[Dify] No overall_summary found in JSON or text');
                }
            } catch (e) {
                console.warn('[Dify] Found braces but failed to parse JSON', e);
                throw new Error('JSON parsing failed inside response');
            }
        } else {
            console.warn('[Dify] No JSON braces found in energy summary response');
            throw new Error('No JSON found in response');
        }
    } catch (error) {
        console.error('Failed to parse energy summary response:', error);
        throw new Error('Failed to parse energy summary response');
    }

    return {
        result,
        conversationId: resultData.conversation_id
    };
}

/**
 * Step 3: 调用 Agent2 - full_report 模式
 */
export async function callFullReport(
    userData: UserCompleteData,
    houseGridJson: string,
    onProgress?: (progress: string) => void
): Promise<{ result: FullReportResponse; conversationId: string }> {
    onProgress?.('Generating your personalized report...');

    const response = await fetch(`${BACKEND_BASE_URL}/dify/full-report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userData,
            houseGridJson,
            mode: 'full_report'
        })
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Full report failed with status ${response.status}`;
        
        if (contentType && contentType.includes('application/json')) {
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If JSON parsing fails, try text
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
        } else {
            // If response is HTML (like Cloudflare error page), backend might not be running
            const errorText = await response.text();
            if (errorText.includes('html') || errorText.includes('<!DOCTYPE')) {
                errorMessage = `Backend server may not be running. Please ensure the backend server is running on port 4000. Status: ${response.status}`;
            } else {
                errorMessage = errorText || errorMessage;
            }
        }
        
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const resultData = await response.json();

    return {
        result: {
            report_content: resultData.answer || resultData.report_content || '',
            pdf_base64: resultData.pdf_base64
        },
        conversationId: resultData.conversation_id
    };
}

/**
 * Retry helper function
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 1.5);
    }
}
