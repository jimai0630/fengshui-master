import { useState } from 'react';
import { X, CreditCard, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
    const { t } = useTranslation();
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const handlePayment = async () => {
        setPaymentStatus('processing');
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentStatus('success');
        
        // Wait a bit to show success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Call success callback
        if (onPaymentSuccess) {
            onPaymentSuccess();
        }
        
        // Reset and close
        setPaymentStatus('idle');
        onClose();
    };

    const handleClose = () => {
        if (paymentStatus === 'processing') return; // Don't allow closing during processing
        setPaymentStatus('idle');
        onClose();
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
                        disabled={paymentStatus === 'processing'}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
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
                                ${t('payment.price')}
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

                    {/* Payment Methods (Placeholder) */}
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                            {t('payment.method')}
                        </h4>
                        <div className="space-y-3">
                            <button 
                                onClick={handlePayment}
                                disabled={paymentStatus === 'processing'}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.creditCard')}
                                </span>
                            </button>
                            <button 
                                onClick={handlePayment}
                                disabled={paymentStatus === 'processing'}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t('payment.email')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* MVP Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                            {t('payment.mvpNotice')}
                        </p>
                    </div>

                    {/* Payment Status */}
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

                    {paymentStatus === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200 text-center">
                                {t('payment.error')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                    <button
                        onClick={handleClose}
                        disabled={paymentStatus === 'processing'}
                        className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {t('payment.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
