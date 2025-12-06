import type {
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse,
    UserCompleteData
} from '../types/dify';

const DIFY_BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || '';
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY || '';

/**
 * Upload a file to Dify and return the file ID.
 */
export async function uploadFile(file: File, userEmail: string): Promise<{ id: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('user', userEmail);

    const response = await fetch(`${DIFY_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${DIFY_API_KEY}`,
        },
        body: form,
    });
    if (!response.ok) {
        throw new Error('File upload failed');
    }
    return response.json();
}

/**
 * Call the layout grid analysis agent (Agent 1).
 */
export async function callLayoutGrid(
    userData: UserCompleteData,
    fileIds: string[],
    houseType: string,
    language: string
): Promise<{ result: LayoutGridResponse; conversationId: string }> {
    const payload = {
        inputs: {
            ...userData,
            file_ids: fileIds,
            house_type: houseType,
            language,
        },
    };
    const response = await fetch(`${DIFY_BASE_URL}/agents/layout_grid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DIFY_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { result: data as LayoutGridResponse, conversationId: data.conversation_id || '' };
}

/**
 * Call the energy summary agent (Agent 2).
 */
export async function callEnergySummary(
    userData: UserCompleteData,
    layoutGridJson: string,
    task: string
): Promise<{ result: EnergySummaryResponse; conversationId: string }> {
    const payload = {
        inputs: {
            ...userData,
            layout_grid: layoutGridJson,
            task,
        },
    };
    const response = await fetch(`${DIFY_BASE_URL}/agents/energy_summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DIFY_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { result: data as EnergySummaryResponse, conversationId: data.conversation_id || '' };
}

/**
 * Call the full report generation agent (Agent 3).
 */
export async function callFullReport(
    userData: UserCompleteData,
    layoutGridJson: string,
    _onProgress?: (progress: number) => void
): Promise<{ result: FullReportResponse }> {
    const payload = {
        inputs: {
            ...userData,
            layout_grid: layoutGridJson,
        },
    };
    const response = await fetch(`${DIFY_BASE_URL}/agents/full_report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DIFY_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });
    // Simple implementation: no streaming progress handling
    const data = await response.json();
    return { result: data as FullReportResponse };
}

/**
 * Retry utility function for API calls
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> {
    let lastError: Error | undefined;
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
    throw lastError || new Error('Max retries exceeded');
}
