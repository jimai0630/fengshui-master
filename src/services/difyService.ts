// Dify API Service

import type {
    DifyFileUploadRequest,
    DifyFileUploadResponse,
    DifyChatRequest,
    DifyChatResponse,
    DifyStreamChunk,
    UserCompleteData,
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse
} from '../types/dify';

const DIFY_BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY || '';

// 默认用户ID（可以根据实际情况修改）
const DEFAULT_USER_ID = 'fengshui-user';

/**
 * 上传文件到Dify
 */
export async function uploadFile(file: File): Promise<DifyFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', DEFAULT_USER_ID);

    const response = await fetch(`${DIFY_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`File upload failed: ${error}`);
    }

    const data = await response.json();
    
    // Dify返回的file_id在不同字段中，需要适配
    return {
        id: data.file_id || data.id,
        name: data.name || file.name,
        size: data.size || file.size,
        extension: data.extension || file.name.split('.').pop() || '',
        mime_type: data.mime_type || file.type,
        created_by: data.created_by || DEFAULT_USER_ID,
        created_at: data.created_at || Date.now()
    };
}

/**
 * 调用Dify Chat API（Blocking模式）
 */
export async function callDifyBlocking(request: DifyChatRequest): Promise<DifyChatResponse> {
    const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...request,
            response_mode: 'blocking'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Dify API call failed: ${error}`);
    }

    return await response.json();
}

/**
 * 调用Dify Chat API（Streaming模式）
 */
export async function callDifyStreaming(
    request: DifyChatRequest,
    onChunk: (chunk: DifyStreamChunk) => void,
    onComplete: (fullAnswer: string) => void,
    onError: (error: Error) => void
): Promise<void> {
    try {
        const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...request,
                response_mode: 'streaming'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Dify API call failed: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let fullAnswer = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.slice(6);
                        if (jsonStr.trim() === '') continue;
                        
                        const data: DifyStreamChunk = JSON.parse(jsonStr);
                        
                        if (data.answer) {
                            fullAnswer += data.answer;
                        }
                        
                        onChunk(data);
                        
                        if (data.event === 'message_end') {
                            onComplete(fullAnswer);
                            return;
                        }
                    } catch (e) {
                        console.warn('Failed to parse SSE chunk:', e);
                    }
                }
            }
        }

        onComplete(fullAnswer);
    } catch (error) {
        onError(error as Error);
    }
}

/**
 * Step 1: 调用layout_grid模式
 */
export async function callLayoutGrid(
    userData: UserCompleteData,
    floorPlanFileId: string,
    floorPlanDesc: string
): Promise<{ result: LayoutGridResponse; conversationId: string }> {
    const request: DifyChatRequest = {
        inputs: {
            mode: 'layout_grid',
            floor_index: userData.floorIndex,
            floor_plan_desc: floorPlanDesc,
            house_type: userData.houseType || 'apartment',
            language_mode: userData.languageMode || 'zh'
        },
        query: '请分析这个户型图，将其划分为九宫格，并识别每个宫位的房间。',
        response_mode: 'blocking',
        conversation_id: userData.conversationId || '',
        user: DEFAULT_USER_ID,
        files: [
            {
                type: 'image',
                transfer_method: 'local_file',
                upload_file_id: floorPlanFileId
            }
        ]
    };

    const response = await callDifyBlocking(request);
    
    // 解析返回的JSON
    let result: LayoutGridResponse;
    try {
        // Dify可能在answer中返回JSON字符串
        result = JSON.parse(response.answer || '{}');
    } catch (e) {
        throw new Error('Failed to parse layout grid response');
    }

    return {
        result,
        conversationId: response.conversation_id
    };
}

/**
 * Step 2: 调用energy_summary模式
 */
export async function callEnergySummary(
    userData: UserCompleteData,
    houseGridJson: string,
    roomPhotosDesc: string
): Promise<{ result: EnergySummaryResponse; conversationId: string }> {
    const request: DifyChatRequest = {
        inputs: {
            mode: 'energy_summary',
            birth_date: userData.birthDate,
            gender: userData.gender,
            benming_star_no: userData.benmingStarNo,
            benming_star_name: userData.benmingStarName,
            house_type: userData.houseType || 'apartment',
            floor_index: userData.floorIndex,
            house_grid_json: houseGridJson,
            room_photos_desc: roomPhotosDesc,
            language_mode: userData.languageMode || 'zh'
        },
        query: '请分析我的家居风水能量，给出五个维度的评分和简短概述。',
        response_mode: 'blocking',
        conversation_id: userData.conversationId || '',
        user: DEFAULT_USER_ID
    };

    const response = await callDifyBlocking(request);
    
    // 解析返回的JSON
    let result: EnergySummaryResponse;
    try {
        // 提取JSON部分（可能包含在其他文本中）
        const answerText = response.answer || '';
        const jsonMatch = answerText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('No JSON found in response');
        }
    } catch (e) {
        console.error('Failed to parse energy summary response:', e);
        throw new Error('Failed to parse energy summary response');
    }

    return {
        result,
        conversationId: response.conversation_id
    };
}

/**
 * Step 3: 调用full_report模式
 */
export async function callFullReport(
    userData: UserCompleteData,
    houseGridJson: string,
    roomPhotosDesc: string,
    onProgress?: (progress: string) => void
): Promise<{ result: FullReportResponse; conversationId: string }> {
    return new Promise((resolve, reject) => {
        const request: DifyChatRequest = {
            inputs: {
                mode: 'full_report',
                birth_date: userData.birthDate,
                gender: userData.gender,
                benming_star_no: userData.benmingStarNo,
                benming_star_name: userData.benmingStarName,
                house_type: userData.houseType || 'apartment',
                floor_index: userData.floorIndex,
                house_grid_json: houseGridJson,
                room_photos_desc: roomPhotosDesc,
                language_mode: userData.languageMode || 'zh',
                user_expectation: userData.email ? `用户邮箱: ${userData.email}` : ''
            },
            query: '请生成我的2026年完整风水报告。',
            response_mode: 'streaming',
            conversation_id: userData.conversationId || '',
            user: DEFAULT_USER_ID
        };

        let fullContent = '';
        let conversationId = '';

        callDifyStreaming(
            request,
            (chunk) => {
                if (chunk.conversation_id) {
                    conversationId = chunk.conversation_id;
                }
                if (chunk.answer && onProgress) {
                    onProgress(chunk.answer);
                }
            },
            (fullAnswer) => {
                fullContent = fullAnswer;
                
                // 尝试提取PDF base64（如果有）
                let pdfBase64: string | undefined;
                const pdfMatch = fullContent.match(/data:application\/pdf;base64,([A-Za-z0-9+/=]+)/);
                if (pdfMatch) {
                    pdfBase64 = pdfMatch[1];
                }

                resolve({
                    result: {
                        report_content: fullContent,
                        pdf_base64: pdfBase64
                    },
                    conversationId: conversationId
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}

/**
 * 重试包装器
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
    
    throw lastError!;
}

