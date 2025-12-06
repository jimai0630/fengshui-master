// Consultation State Management Service
// Manages workflow state persistence and recovery

import type {
    UserCompleteData,
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse,
    ConsultationStep,
    FloorPlanUpload
} from '../types/dify';

export interface ConsultationState {
    email: string; // Unique identifier
    currentStep: ConsultationStep;
    userData: Partial<UserCompleteData>;
    floorPlans: FloorPlanUpload[];
    layoutGridResult?: LayoutGridResponse;
    energySummaryResult?: EnergySummaryResponse;
    fullReportResult?: FullReportResponse;
    conversationId?: string;
    lastUpdated: number;
    paymentCompleted: boolean;
}

const STORAGE_KEY_PREFIX = 'fengshui_consultation_';
const STATE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save consultation state to localStorage
 */
export function saveConsultationState(state: ConsultationState): void {
    try {
        const key = `${STORAGE_KEY_PREFIX}${state.email}`;
        const stateWithTimestamp = {
            ...state,
            lastUpdated: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(stateWithTimestamp));
    } catch (error) {
        console.error('Failed to save consultation state:', error);
    }
}

/**
 * Load consultation state from localStorage
 */
export function loadConsultationState(email: string): ConsultationState | null {
    try {
        const key = `${STORAGE_KEY_PREFIX}${email}`;
        const stored = localStorage.getItem(key);

        if (!stored) {
            return null;
        }

        const state: ConsultationState = JSON.parse(stored);

        // Check if state has expired
        const now = Date.now();
        if (now - state.lastUpdated > STATE_EXPIRY_MS) {
            clearConsultationState(email);
            return null;
        }

        return state;
    } catch (error) {
        console.error('Failed to load consultation state:', error);
        return null;
    }
}

/**
 * Clear consultation state from localStorage
 */
export function clearConsultationState(email: string): void {
    try {
        const key = `${STORAGE_KEY_PREFIX}${email}`;
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to clear consultation state:', error);
    }
}

/**
 * Update specific fields in consultation state
 */
export function updateConsultationState(
    email: string,
    updates: Partial<ConsultationState>
): void {
    const currentState = loadConsultationState(email);

    if (!currentState) {
        // Create new state if doesn't exist
        const newState: ConsultationState = {
            email,
            currentStep: 'user-info',
            userData: {},
            floorPlans: [],
            lastUpdated: Date.now(),
            paymentCompleted: false,
            ...updates
        };
        saveConsultationState(newState);
    } else {
        // Update existing state
        const updatedState: ConsultationState = {
            ...currentState,
            ...updates,
            lastUpdated: Date.now()
        };
        saveConsultationState(updatedState);
    }
}

/**
 * Check if a report already exists for the given parameters
 * (birth_date, gender, floor_plan_file_ids)
 */
export function checkReportExists(
    email: string,
    birthDate: string,
    gender: string,
    floorPlanFileIds: string[]
): boolean {
    const state = loadConsultationState(email);

    if (!state || !state.fullReportResult) {
        return false;
    }

    // Check if the parameters match
    const paramsMatch =
        state.userData.birthDate === birthDate &&
        state.userData.gender === gender &&
        state.floorPlans.length === floorPlanFileIds.length &&
        state.floorPlans.every((fp, idx) => fp.fileId === floorPlanFileIds[idx]);

    return paramsMatch;
}

/**
 * Generate idempotency key for API calls
 */
export function generateIdempotencyKey(
    email: string,
    operation: string,
    params: Record<string, unknown>
): string {
    const paramsStr = JSON.stringify(params);
    return `${email}_${operation}_${btoa(paramsStr)}`;
}

/**
 * Check if an operation has been completed (for idempotency)
 */
export function isOperationCompleted(
    email: string,
    operation: 'layout_grid' | 'energy_summary' | 'full_report'
): boolean {
    const state = loadConsultationState(email);

    if (!state) {
        return false;
    }

    switch (operation) {
        case 'layout_grid':
            return !!state.layoutGridResult?.ok;
        case 'energy_summary':
            return !!state.energySummaryResult;
        case 'full_report':
            return !!state.fullReportResult;
        default:
            return false;
    }
}
