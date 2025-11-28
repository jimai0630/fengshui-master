// Dify API Types

export interface DifyFileUploadRequest {
    file: File;
    user: string;
}

export interface DifyFileUploadResponse {
    id: string;
    name: string;
    size: number;
    extension: string;
    mime_type: string;
    created_by: string;
    created_at: number;
}

export interface DifyFileReference {
    type: 'image' | 'document';
    transfer_method: 'remote_url' | 'local_file';
    url?: string;
    upload_file_id?: string;
}

export interface DifyChatRequest {
    inputs: Record<string, any>;
    query: string;
    response_mode: 'streaming' | 'blocking';
    conversation_id?: string;
    user: string;
    files?: DifyFileReference[];
}

export interface DifyChatResponse {
    event: string;
    conversation_id: string;
    message_id: string;
    created_at: number;
    task_id: string;
    answer?: string;
    metadata?: {
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
}

export interface DifyStreamChunk {
    event: 'message' | 'agent_message' | 'message_end' | 'error' | 'ping';
    conversation_id?: string;
    message_id?: string;
    answer?: string;
    created_at?: number;
    metadata?: any;
}

// User Data Types
export interface UserEssentialData {
    birthDate: string;
    gender: '男' | '女';
    floorPlanFileId: string;
}

export interface UserCompleteData extends UserEssentialData {
    name?: string;
    email?: string;
    floorIndex: number;
    floorPlanDesc?: string;
    houseType?: string;
    houseGridJson?: string;
    roomPhotos?: RoomPhotoData[];
    conversationId?: string;
    benmingStarNo?: number;
    benmingStarName?: string;
    languageMode?: 'zh' | 'en' | 'mix';
}

export interface RoomPhotoData {
    roomId: string;
    roomName: string;
    fileId: string;
    palace?: string;
}

// API Response Types
export interface LayoutGridResponse {
    floor_index: number;
    houses: Array<{
        palace: string;
        palace_cn: string;
        main_room_name: string;
        secondary_room_name?: string;
        room_cross_info?: string;
        notes?: string;
    }>;
}

export interface EnergySummaryResponse {
    scores_before: {
        love: number;
        wealth: number;
        career: number;
        health: number;
        luck: number;
    };
    scores_after: {
        love: number;
        wealth: number;
        career: number;
        health: number;
        luck: number;
    };
    dimension_labels: {
        love: string;
        wealth: string;
        career: string;
        health: string;
        luck: string;
    };
    summary_text: {
        love: string;
        wealth: string;
        career: string;
        health: string;
        luck: string;
    };
}

export interface FullReportResponse {
    report_content: string; // Markdown content
    pdf_base64?: string; // Base64 encoded PDF
}

// Cache Types
export interface CachedResult {
    hash: string;
    timestamp: number;
    data: any;
    conversationId?: string;
}

export interface UserDataCache {
    essentialHash: string;
    userData: UserCompleteData;
    step1Result?: LayoutGridResponse;
    step2Result?: EnergySummaryResponse;
    step3Result?: FullReportResponse;
    conversationId?: string;
    lastUpdated: number;
}

