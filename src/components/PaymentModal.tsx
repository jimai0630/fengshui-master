import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, confirmPayment } from '../services/stripeService';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess?: (paymentIntentId: string) => void;
    amount?: number;
    consultationId?: string;
}

const PaymentForm: React.FC<{ 
    clientSecret: string;
    paymentIntentId: string;
    consultationId?: string;
    onSuccess: (paymentIntentId: string) => void; 
    onClose: () => void;
}> = ({ clientSecret, paymentIntentId, consultationId, onSuccess, onClose }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setPaymentStatus('processing');
        setErrorMessage('');

        try {
            // Submit payment form
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setPaymentStatus('error');
                setErrorMessage(submitError.message || t('payment.error'));
                return;
            }

            // Confirm payment
            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: window.location.origin,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                setPaymentStatus('error');
                setErrorMessage(confirmError.message || t('payment.error'));
            } else {
                // Payment succeeded
                // Confirm payment on backend
                try {
                    await confirmPayment({
                        paymentIntentId,
                        consultationId,
                    });
                } catch (error) {
                    console.error('Failed to confirm payment on backend:', error);
                    // Continue anyway as payment was successful on Stripe side
                }

                setPaymentStatus('success');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                onSuccess(paymentIntentId);
                onClose();
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            setPaymentStatus('error');
            setErrorMessage(error.message || t('payment.error'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement 
                options={{
                    layout: 'tabs',
                }}
            />
            
            {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                        {errorMessage}
                    </p>
                </div>
            )}

            {paymentStatus === 'processing' && (
                <div className="flex items-center justify-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t('payment.processing')}
                    </p>
                </div>
            )}

            {paymentStatus === 'success' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
                        {t('payment.success')}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || paymentStatus === 'processing' || !clientSecret}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {paymentStatus === 'processing' 
                    ? t('payment.processing') 
                    : t('payment.close')}
            </button>
        </form>
    );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    onPaymentSuccess,
    amount = 29.99,
    consultationId
}) => {
    const { t } = useTranslation();
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize Stripe and create payment intent when modal opens
    useEffect(() => {
        if (isOpen && amount > 0) {
            setIsLoading(true);
            setError(null);
            
            const initializePayment = async () => {
                try {
                    // Get Stripe instance
                    const stripe = await getStripe();
                    if (!stripe) {
                        throw new Error('Stripe not configured');
                    }
                    setStripePromise(Promise.resolve(stripe));

                    // Create payment intent
                    const { clientSecret, paymentIntentId } = await createPaymentIntent({
                        amount,
                        currency: 'usd',
                        consultationId,
                        metadata: {
                            source: 'fengshui_report',
                        },
                    });
                    
                    setClientSecret(clientSecret);
                    setPaymentIntentId(paymentIntentId);
                } catch (error: any) {
                    console.error('Failed to initialize payment:', error);
                    setError(error.message || t('payment.error'));
                } finally {
                    setIsLoading(false);
                }
            };

            initializePayment();
        } else if (!isOpen) {
            // Reset state when modal closes
            setClientSecret(null);
            setPaymentIntentId(null);
            setStripePromise(null);
            setError(null);
        }
    }, [isOpen, amount, consultationId, t]);

    const handleClose = () => {
        onClose();
    };

    const handlePaymentSuccess = (paymentIntentId: string) => {
        if (onPaymentSuccess) {
            onPaymentSuccess(paymentIntentId);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-bold font-display text-gray-800 dark:text-white">
                        {t('payment.title')}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {t('payment.package')}
                            </p>
                            <div className="text-4xl font-bold text-primary mb-2">
                                ${amount.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('payment.oneTime')}
                            </p>
                        </div>
                    </div>

                    {/* What's Included */}
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                            {t('payment.included')}
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{t('payment.feature1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{t('payment.feature2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{t('payment.feature3')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{t('payment.feature4')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center gap-3 p-4">
                            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('payment.processing')}
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200 text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Stripe Payment Form */}
                    {stripePromise && clientSecret && paymentIntentId && !isLoading && !error && (
                        <Elements 
                            stripe={stripePromise} 
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                },
                            }}
                        >
                            <PaymentForm 
                                clientSecret={clientSecret}
                                paymentIntentId={paymentIntentId}
                                consultationId={consultationId}
                                onSuccess={handlePaymentSuccess}
                                onClose={handleClose}
                            />
                        </Elements>
                    )}

                    {!stripePromise && !isLoading && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                                {t('payment.error')} - Stripe not configured
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
