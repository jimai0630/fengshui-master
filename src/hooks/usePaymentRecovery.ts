import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LastPaidSession {
    consultationId: string;
    email: string;
    timestamp: number;
}

/**
 * Hook to check for and restore paid sessions
 * Automatically navigates to the consultation page if a valid paid session exists
 */
export function usePaymentRecovery() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there's a recent paid session in localStorage
        const lastPaidSession = localStorage.getItem('last_paid_session');

        if (!lastPaidSession) {
            return; // No payment record
        }

        try {
            const session: LastPaidSession = JSON.parse(lastPaidSession);

            // Check if within 24 hours
            const hoursSincePayment = (Date.now() - session.timestamp) / (1000 * 60 * 60);
            if (hoursSincePayment > 24) {
                console.log('[PaymentRecovery] Payment session expired (>24 hours)');
                localStorage.removeItem('last_paid_session');
                return;
            }

            // Check if payment status is still valid
            const paymentStatus = localStorage.getItem(`payment_status_${session.consultationId}`);
            if (paymentStatus !== 'paid') {
                console.log('[PaymentRecovery] Payment status no longer valid');
                localStorage.removeItem('last_paid_session');
                return;
            }

            // Auto-navigate to ConsultationPage with restore flag
            console.log('[PaymentRecovery] Restoring paid session:', session);

            navigate('/consultation', {
                state: {
                    email: session.email,
                    consultationId: session.consultationId,
                    restore: true  // Mark as restore mode
                }
            });

        } catch (error) {
            console.error('[PaymentRecovery] Failed to parse session:', error);
            localStorage.removeItem('last_paid_session');
        }
    }, [navigate]);
}
