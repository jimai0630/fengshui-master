import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PaymentModal from './PaymentModal';

type Props = {
    reportPrice: number;
    onPaymentSuccess: (paymentIntentId: string) => void;
    consultationId?: string;
};

const PaymentSection: React.FC<Props> = ({ reportPrice, onPaymentSuccess, consultationId }) => {
    const { t } = useTranslation();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handlePaymentSuccess = (paymentIntentId: string) => {
        setShowPaymentModal(false);
        onPaymentSuccess(paymentIntentId);
    };

    return (
        <>
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {t('payment.title')}
                </h2>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <span className="text-lg font-medium text-gray-800 dark:text-white">
                            {t('payment.package')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t('payment.oneTime')}
                        </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${reportPrice}
                    </span>
                </div>
                <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                    {t('payment.close')}
                </button>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                amount={reportPrice}
                consultationId={consultationId}
            />
        </>
    );
};

export default PaymentSection;
