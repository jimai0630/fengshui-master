import type {
    ConsultationStep,
    UserCompleteData,
    FloorPlanUpload,
    HouseType
} from '../types/dify';
import {
    saveConsultationToSupabase,
    loadConsultationFromSupabase,
    updatePaymentStatus,
    generateFloorPlansHash,
    type ConsultationRecord
} from './supabaseService';

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

/**
 * Load consultation state (tries Supabase first, falls back to localStorage)
 */
export async function loadConsultationState(
    email: string,
    birthDate?: string,
    gender?: string,
    houseType?: string,
    floorPlanFileIds?: string[]
): Promise<ConsultationState | null> {
    // Try Supabase if we have all required params
    if (birthDate && gender && houseType && floorPlanFileIds && floorPlanFileIds.length > 0) {
        try {
            const hash = generateFloorPlansHash(floorPlanFileIds);
            const record = await loadConsultationFromSupabase(email, birthDate, gender, houseType, hash);

            if (record) {
                console.log('[Supabase] Loaded consultation state from cloud');
                return mapRecordToState(record);
            }
        } catch (error) {
            console.warn('[Supabase] Failed to load, falling back to localStorage:', error);
        }
    }

    // Fallback to localStorage
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PREFIX + email);
        if (!raw) return null;
        console.log('[localStorage] Loaded consultation state');
        return JSON.parse(raw) as ConsultationState;
    } catch (e) {
        console.error('Failed to load consultation state', e);
        return null;
    }
}

/**
 * Update consultation state (saves to both Supabase and localStorage)
 */
export async function updateConsultationState(email: string, state: Partial<ConsultationState>) {
    // Always save to localStorage for immediate access
    try {
        const existing = await loadLocalState(email);
        const newState = { ...existing, ...state };
        localStorage.setItem(STORAGE_KEY_PREFIX + email, JSON.stringify(newState));
    } catch (e) {
        console.error('Failed to update localStorage', e);
    }

    // Save to Supabase if we have complete data
    if (shouldSyncToSupabase(state)) {
        try {
            const record = mapStateToRecord(state);
            await saveConsultationToSupabase(record);
            console.log('[Supabase] Saved consultation state to cloud');
        } catch (error) {
            console.warn('[Supabase] Failed to save:', error);
        }
    }
}

/**
 * Update payment status in Supabase
 */
export async function markPaymentCompleted(
    email: string,
    floorPlanFileIds: string[],
    fullReportResult: any,
    reportConversationId: string
) {
    try {
        const hash = generateFloorPlansHash(floorPlanFileIds);
        await updatePaymentStatus(email, hash, fullReportResult, reportConversationId);
        console.log('[Supabase] Payment status updated');
    } catch (error) {
        console.error('[Supabase] Failed to update payment:', error);
    }
}

// Helper functions

function loadLocalState(email: string): ConsultationState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PREFIX + email);
        if (!raw) return {} as ConsultationState;
        return JSON.parse(raw) as ConsultationState;
    } catch {
        return {} as ConsultationState;
    }
}

function shouldSyncToSupabase(state: Partial<ConsultationState>): boolean {
    return !!(
        state.userData?.email &&
        state.userData?.birthDate &&
        state.userData?.gender &&
        state.houseType &&
        state.floorPlans &&
        state.floorPlans.length > 0 &&
        state.layoutGridResult &&
        state.energySummaryResult
    );
}

function mapStateToRecord(state: Partial<ConsultationState>): Omit<ConsultationRecord, 'id' | 'created_at' | 'updated_at'> {
    const fileIds = state.floorPlans?.map(fp => fp.fileId).filter(Boolean) as string[];

    return {
        email: state.userData!.email!,
        birth_date: state.userData!.birthDate!,
        gender: state.userData!.gender!,
        house_type: state.houseType!,
        floor_plans_hash: generateFloorPlansHash(fileIds),
        layout_grid_result: state.layoutGridResult,
        layout_conversation_id: state.conversationId || '',
        energy_summary_result: state.energySummaryResult,
        energy_conversation_id: state.conversationId || '',
        full_report_result: state.fullReportResult,
        report_conversation_id: state.conversationId,
        payment_completed: state.paymentCompleted || false
    };
}

function mapRecordToState(record: ConsultationRecord): ConsultationState {
    return {
        currentStep: record.payment_completed ? 'report' : 'energy-result',
        userData: {
            email: record.email,
            birthDate: record.birth_date,
            gender: record.gender as '男' | '女'
        },
        floorPlans: [], // File IDs are in hash, not stored separately
        houseType: record.house_type as HouseType,
        layoutGridResult: record.layout_grid_result,
        energySummaryResult: record.energy_summary_result,
        fullReportResult: record.full_report_result,
        conversationId: record.energy_conversation_id,
        paymentCompleted: record.payment_completed
    };
}
