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
        // Dify可能在answer中返回JSON字符串
        const answerText = resultData.answer || '{}';
        result = JSON.parse(answerText);

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
        const error = await response.text();
        throw new Error(`Energy summary failed: ${error}`);
    }

    const resultData = await response.json();

    // 解析返回的JSON
    let result: EnergySummaryResponse;
    try {
        // 提取JSON部分（可能包含在其他文本中）
        const answerText = resultData.answer || '';
        const jsonMatch = answerText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
        } else {
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
        const error = await response.text();
        throw new Error(`Full report failed: ${error}`);
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


