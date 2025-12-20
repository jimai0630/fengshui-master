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

/**
 * Load consultation state from Supabase
 * Requires all parameters to be provided
 * Throws error if Supabase is not configured or if load fails
 */
export async function loadConsultationState(
    email: string,
    birthDate: string,
    gender: string,
    houseType: string,
    floorPlanFileIds: string[]
): Promise<ConsultationState | null> {
    if (!birthDate || !gender || !houseType || !floorPlanFileIds || floorPlanFileIds.length === 0) {
        throw new Error('All parameters are required to load consultation state: birthDate, gender, houseType, and floorPlanFileIds');
    }

    try {
        const hash = generateFloorPlansHash(floorPlanFileIds);
        const record = await loadConsultationFromSupabase(email, birthDate, gender, houseType, hash);

        if (record) {
            console.log('[Supabase] Loaded consultation state from cloud');
            return mapRecordToState(record);
        }

        return null;
    } catch (error) {
        console.error('[Supabase] Failed to load consultation state:', error);
        throw error;
    }
}

/**
 * Update consultation state (saves to Supabase only)
 * Only saves when data is complete (as determined by shouldSyncToSupabase)
 * Throws error if Supabase is not configured or if save fails
 */
export async function updateConsultationState(email: string, state: Partial<ConsultationState>) {
    // Save to Supabase if we have complete data
    if (shouldSyncToSupabase(state)) {
        try {
            const record = mapStateToRecord(state);
            await saveConsultationToSupabase(record);
            console.log('[Supabase] Saved consultation state to cloud');
        } catch (error) {
            console.error('[Supabase] Failed to save consultation state:', error);
            throw error;
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
        floor_plans_data: state.floorPlans || [],
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
    // Determine current step based on available data
    let currentStep: ConsultationStep = 'floor-plan-upload';
    if (record.payment_completed && record.full_report_result) {
        currentStep = 'report';
    } else if (record.energy_summary_result) {
        currentStep = 'energy-result';
    } else if (record.layout_grid_result) {
        currentStep = 'processing';
    }

    return {
        currentStep,
        userData: {
            email: record.email,
            birthDate: record.birth_date,
            gender: record.gender as '男' | '女'
        },
        floorPlans: record.floor_plans_data || [], // Restore from floor_plans_data, fallback to empty array
        houseType: record.house_type as HouseType,
        layoutGridResult: record.layout_grid_result,
        energySummaryResult: record.energy_summary_result,
        fullReportResult: record.full_report_result,
        conversationId: record.energy_conversation_id || record.layout_conversation_id,
        paymentCompleted: record.payment_completed
    };
}
