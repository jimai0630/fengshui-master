// Stripe Payment Types

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';

export interface PaymentRecord {
    id?: string;
    consultation_id?: string;
    payment_intent_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    stripe_customer_id?: string;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePaymentIntentParams {
    amount: number;
    currency?: string;
    consultationId?: string;
    metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

export interface ConfirmPaymentParams {
    paymentIntentId: string;
    consultationId?: string;
}

export interface ConfirmPaymentResponse {
    status: PaymentStatus;
    paymentIntent: {
        id: string;
        amount: number;
        currency: string;
        status: PaymentStatus;
        metadata: Record<string, any>;
    };
    paymentRecord?: PaymentRecord;
}

