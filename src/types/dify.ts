// Dify API Types

export interface DifyFileUploadResponse {
    id: string;
    name: string;
    size: number;
    extension: string;
    mime_type: string;
    created_by: string;
    created_at: number;
    source_url?: string;
}

// User Data Types
export interface UserEssentialData {
    birthDate: string;
    gender: '男' | '女';
    floorPlanFileId?: string; // Optional in new workflow
}

export interface UserCompleteData extends UserEssentialData {
    name?: string;
    email: string; // Required for user identification
    floorIndex: number;
    floorPlanDesc?: string;
    houseType?: HouseType;
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
    ok: boolean;
    error_code: string;
    error_message_for_user: string;
    floor_index: number | null;
    house_type: string | null;
    houses: Array<{
        palace: string;
        palace_cn: string;
        main_room_name: string;
        secondary_room_name?: string;
        room_cross_info?: string;
        notes?: string;
    }>;
}

// House Type
export type HouseType = 'apartment' | 'condo' | 'villa' | 'loft' | 'other';

// Floor Plan Upload
export interface FloorPlanUpload {
    floorIndex: number;
    file: File;
    fileId?: string;
    preview?: string;
}

// Consultation Workflow Steps
export type ConsultationStep =
    | 'user-info'
    | 'floor-plan-upload'
    | 'floor-plan-analyzing'
    | 'floor-plan-result'
    | 'energy-assessment'
    | 'energy-result'
    | 'payment'
    | 'report';

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

export type DifyResponseMode = 'blocking' | 'streaming';

export interface DifyChatStreamingEvent {
    event: string;
    answer?: string;
    conversation_id?: string;
    message_id?: string;
    metadata?: Record<string, unknown>;
    task_id?: string;
    audio?: string;
    [key: string]: unknown;
}

export interface DifyChatResponse {
    mode: DifyResponseMode;
    data?: {
        answer?: string;
        conversation_id?: string;
        metadata?: Record<string, unknown>;
        [key: string]: unknown;
    };
    events?: DifyChatStreamingEvent[];
}

export interface DifyChatRequest {
    query: string;
    inputs?: Record<string, unknown>;
    fileId?: string;
    fileUrl?: string;
    fileType?: string;
    transferMethod?: 'remote_url' | 'local_file';
    responseMode?: DifyResponseMode;
    conversationId?: string;
    user?: string;
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
