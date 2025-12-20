import { loadStripe } from '@stripe/stripe-js';
import type {
    CreatePaymentIntentParams,
    PaymentIntentResponse,
    ConfirmPaymentParams,
    ConfirmPaymentResponse
} from '../types/stripe';

// Get Stripe type from loadStripe return type
type StripeInstance = Awaited<ReturnType<typeof loadStripe>>;

let stripePromise: Promise<StripeInstance> | null = null;

/**
 * Get or initialize Stripe instance
 */
export const getStripe = (): Promise<StripeInstance> => {
    if (!stripePromise) {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.warn('[Stripe] Publishable key not found. Payment will not work.');
            return Promise.resolve(null);
        }
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};

/**
 * Create a payment intent on the backend
 */
export async function createPaymentIntent(
    params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
    const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create payment intent' }));
        throw new Error(error.error || 'Failed to create payment intent');
    }

    return response.json();
}

/**
 * Confirm payment status on the backend
 */
export async function confirmPayment(
    params: ConfirmPaymentParams
): Promise<ConfirmPaymentResponse> {
    const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to confirm payment' }));
        throw new Error(error.error || 'Failed to confirm payment');
    }

    return response.json();
}

