import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('[Supabase] Not configured. Using localStorage only. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud sync.');
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Database Types
export interface ConsultationRecord {
    id?: string;
    email: string;
    birth_date: string;
    gender: string;
    house_type: string;
    floor_plans_hash: string; // MD5 hash of floor plan file IDs

    // Agent 1 Results
    layout_grid_result: any;
    layout_conversation_id: string;

    // Agent 2 Results
    energy_summary_result: any;
    energy_conversation_id: string;

    // Full Report (after payment)
    full_report_result?: any;
    report_conversation_id?: string;
    payment_completed: boolean;

    // Metadata
    created_at?: string;
    updated_at?: string;
}

/**
 * Generate a unique hash for floor plans to detect changes
 */
export function generateFloorPlansHash(fileIds: string[]): string {
    return fileIds.sort().join('|');
}

/**
 * Save consultation state to Supabase
 */
export async function saveConsultationToSupabase(record: Omit<ConsultationRecord, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping save');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('consultations')
            .upsert(record, {
                onConflict: 'email,birth_date,gender,house_type,floor_plans_hash'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to save consultation to Supabase:', error);
        throw error;
    }
}

/**
 * Load consultation state from Supabase
 */
export async function loadConsultationFromSupabase(
    email: string,
    birthDate: string,
    gender: string,
    houseType: string,
    floorPlansHash: string
): Promise<ConsultationRecord | null> {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping load');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('email', email)
            .eq('birth_date', birthDate)
            .eq('gender', gender)
            .eq('house_type', houseType)
            .eq('floor_plans_hash', floorPlansHash)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to load consultation from Supabase:', error);
        return null;
    }
}

/**
 * Update payment status and full report
 */
export async function updatePaymentStatus(
    email: string,
    floorPlansHash: string,
    fullReportResult: any,
    reportConversationId: string
) {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment update');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('consultations')
            .update({
                full_report_result: fullReportResult,
                report_conversation_id: reportConversationId,
                payment_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .eq('floor_plans_hash', floorPlansHash)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to update payment status:', error);
        throw error;
    }
}
