import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

type Props = {
    reportPrice: number;
    onPaymentSuccess: () => void;
};

const PaymentSection: React.FC<Props> = ({ reportPrice, onPaymentSuccess }) => {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    const handlePay = async () => {
        setProcessing(true);
        // Simulate payment delay
        await new Promise((res) => setTimeout(res, 2000));
        setProcessing(false);
        onPaymentSuccess();
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t('payment.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('payment.mvpNotice')}
            </p>
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
                onClick={handlePay}
                disabled={processing}
                className="w-full px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('payment.processing')}
                    </>
                ) : (
                    t('payment.close')
                )}
            </button>
        </div>
    );
};

export default PaymentSection;
