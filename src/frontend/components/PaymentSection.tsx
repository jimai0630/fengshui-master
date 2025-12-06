import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';

interface PaymentSectionProps {
    reportPrice: number;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
    reportPrice,
    onPaymentSuccess
}) => {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleMockPayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            // Mock success (you can add logic for random failures for testing)
            setPaymentSuccess(true);
            setIsProcessing(false);

            // Call success callback after animation
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500);
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-md mx-auto text-center">
                    <div className="animate-bounce-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {t('payment.success.title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('payment.success.message')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-800 dark:text-white mb-4">
                        {t('payment.title')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t('payment.subtitle')}
                    </p>
                </div>

                {/* Payment Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                    {/* Price Display */}
                    <div className="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {t('payment.reportPrice')}
                        </p>
                        <div className="text-5xl font-bold text-gray-800 dark:text-white">
                            ${reportPrice}
                            <span className="text-2xl text-gray-500 dark:text-gray-400">.00</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('payment.oneTimePayment')}
                        </p>
                    </div>

                    {/* What's Included */}
                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                            {t('payment.included.title')}
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.included.item1')}
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.included.item2')}
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.included.item3')}
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.included.item4')}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Mock Payment Notice */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>{t('payment.demo.title')}:</strong> {t('payment.demo.message')}
                        </p>
                    </div>

                    {/* Payment Button */}
                    <button
                        onClick={handleMockPayment}
                        disabled={isProcessing}
                        className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {t('payment.processing')}
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-6 h-6" />
                                {t('payment.payNow')}
                            </>
                        )}
                    </button>

                    {/* Security Notice */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span>{t('payment.securePayment')}</span>
                    </div>
                </div>

                {/* Money-Back Guarantee */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('payment.guarantee')}
                    </p>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes bounce-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PaymentSection;
