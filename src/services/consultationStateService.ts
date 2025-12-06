import type {
    ConsultationStep,
    UserCompleteData,
    FloorPlanUpload,
    HouseType
}
    from '../types/dify';

export interface ConsultationState {
    currentStep: ConsultationStep;
    userData: Partial<UserCompleteData>;
    floorPlans: FloorPlanUpload[];
    houseType: HouseType;
    layoutGridResult?: any;
    energySummaryResult?: any;
    fullReportResult?: any;
    conversationId?: string;
    paymentCompleted?: boolean;
}

const STORAGE_KEY_PREFIX = 'consultation_state_';

export function loadConsultationState(email: string): ConsultationState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PREFIX + email);
        if (!raw) return null;
        return JSON.parse(raw) as ConsultationState;
    } catch (e) {
        console.error('Failed to load consultation state', e);
        return null;
    }
}

export function updateConsultationState(email: string, state: Partial<ConsultationState>) {
    try {
        const existing = loadConsultationState(email) || {} as ConsultationState;
        const newState = { ...existing, ...state };
        localStorage.setItem(STORAGE_KEY_PREFIX + email, JSON.stringify(newState));
    } catch (e) {
        console.error('Failed to update consultation state', e);
    }
}
