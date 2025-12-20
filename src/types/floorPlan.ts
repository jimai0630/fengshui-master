// TypeScript types for floor plan analysis

export interface Room {
    id: string;
    name: string;
    confidence: number;
    photo?: File | null;
}

export interface FloorPlanAnalysisRequest {
    image: File | string;
}

export interface FloorPlanAnalysisResponse {
    success: boolean;
    hasCompass: boolean;
    imageQuality: 'good' | 'poor' | 'unrecognizable';
    rooms: Array<{
        id: string;
        name: string;
        confidence: number;
    }>;
    errorMessage?: string;
}

export type UploadStep = 'upload' | 'analyzing' | 'rooms' | 'complete';
