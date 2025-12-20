import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PaymentRecord, PaymentStatus } from '../types/stripe';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.error('[Supabase] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud sync.');
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
    floor_plans_data?: any; // JSONB field for complete floorPlans array

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
    payment_id?: string;

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
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    try {
        // 首先尝试查找现有记录
        const { data: existingData, error: selectError } = await supabase
            .from('consultations')
            .select('id')
            .eq('email', record.email)
            .eq('birth_date', record.birth_date)
            .eq('gender', record.gender)
            .eq('house_type', record.house_type)
            .eq('floor_plans_hash', record.floor_plans_hash)
            .maybeSingle();

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = not found, which is OK
            console.error('[Supabase] Error checking existing record:', selectError);
            throw selectError;
        }

        let result;
        if (existingData) {
            // 更新现有记录
            const { data, error } = await supabase
                .from('consultations')
                .update(record)
                .eq('id', existingData.id)
                .select()
                .single();

            if (error) {
                console.error('[Supabase] Update error:', error);
                console.error('[Supabase] Update record:', JSON.stringify(record, null, 2));
                throw error;
            }
            result = data;
            console.log('[Supabase] Updated existing consultation record:', existingData.id);
        } else {
            // 插入新记录
            const { data, error } = await supabase
                .from('consultations')
                .insert(record)
                .select()
                .single();

            if (error) {
                console.error('[Supabase] Insert error:', error);
                console.error('[Supabase] Insert record:', JSON.stringify(record, null, 2));
                console.error('[Supabase] Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            result = data;
            console.log('[Supabase] Inserted new consultation record:', result.id);
        }

        return result;
    } catch (error) {
        console.error('[Supabase] Failed to save consultation to Supabase:', error);
        if (error instanceof Error) {
            console.error('[Supabase] Error details:', {
                message: error.message,
                code: (error as any)?.code,
                details: (error as any)?.details,
                hint: (error as any)?.hint
            });
        }
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
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
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
 * Save payment record to Supabase
 */
export async function savePaymentRecord(
    paymentRecord: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentRecord | null> {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment save');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                consultation_id: paymentRecord.consultation_id || null,
                payment_intent_id: paymentRecord.payment_intent_id,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                status: paymentRecord.status,
                stripe_customer_id: paymentRecord.stripe_customer_id || null,
                metadata: paymentRecord.metadata || {}
            })
            .select()
            .single();

        if (error) throw error;
        return data as PaymentRecord;
    } catch (error) {
        console.error('Failed to save payment record:', error);
        throw error;
    }
}

/**
 * Get payment record by payment intent ID
 */
export async function getPaymentByIntentId(
    paymentIntentId: string
): Promise<PaymentRecord | null> {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment lookup');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_intent_id', paymentIntentId)
            .maybeSingle();

        if (error) throw error;
        return data as PaymentRecord | null;
    } catch (error) {
        console.error('Failed to get payment by intent ID:', error);
        return null;
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatusByIntentId(
    paymentIntentId: string,
    status: PaymentStatus,
    metadata?: Record<string, any>
): Promise<PaymentRecord | null> {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment update');
        return null;
    }

    try {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (metadata) {
            updateData.metadata = metadata;
        }

        const { data, error } = await supabase
            .from('payments')
            .update(updateData)
            .eq('payment_intent_id', paymentIntentId)
            .select()
            .single();

        if (error) throw error;
        return data as PaymentRecord;
    } catch (error) {
        console.error('Failed to update payment status:', error);
        throw error;
    }
}

/**
 * Link payment to consultation
 */
export async function linkPaymentToConsultation(
    paymentId: string,
    consultationId: string
): Promise<void> {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment link');
        return;
    }

    try {
        // Update payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .update({ consultation_id: consultationId })
            .eq('id', paymentId);

        if (paymentError) throw paymentError;

        // Update consultation record
        const { error: consultationError } = await supabase
            .from('consultations')
            .update({ 
                payment_id: paymentId,
                payment_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', consultationId);

        if (consultationError) throw consultationError;
    } catch (error) {
        console.error('Failed to link payment to consultation:', error);
        throw error;
    }
}

/**
 * Update payment status and full report (legacy function, updated to support payment records)
 */
export async function updatePaymentStatus(
    email: string,
    floorPlansHash: string,
    fullReportResult: any,
    reportConversationId: string,
    paymentId?: string
) {
    if (!supabase) {
        console.warn('[Supabase] Client not configured, skipping payment update');
        return null;
    }

    try {
        const updateData: any = {
            full_report_result: fullReportResult,
            report_conversation_id: reportConversationId,
            payment_completed: true,
            updated_at: new Date().toISOString()
        };

        if (paymentId) {
            updateData.payment_id = paymentId;
        }

        const { data, error } = await supabase
            .from('consultations')
            .update(updateData)
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
