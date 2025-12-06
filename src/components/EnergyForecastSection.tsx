import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { EnergySummaryResponse } from '../types/dify';

type Props = {
    energyData: EnergySummaryResponse;
    onGenerateReport: () => void;
};

const EnergyForecastSection: React.FC<Props> = ({ energyData, onGenerateReport }) => {
    const { t } = useTranslation();
    const [processing, setProcessing] = React.useState(false);

    const handleClick = async () => {
        setProcessing(true);
        await onGenerateReport();
        setProcessing(false);
    };

    const dimensions = ['love', 'wealth', 'career', 'health', 'luck'] as const;

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t('energyForecast.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('energyForecast.subtitle')}
            </p>

            {/* Energy Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {dimensions.map((dim) => (
                    <div key={dim} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {energyData.dimension_labels[dim]}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">{t('energyForecast.before')}</span>
                            <span className="text-lg font-bold text-gray-800 dark:text-white">
                                {energyData.scores_before[dim]}
                            </span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {energyData.scores_after[dim]}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {energyData.summary_text[dim]}
                        </p>
                    </div>
                ))}
            </div>

            <button
                onClick={handleClick}
                disabled={processing}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                        {t('consultation.processing')}
                    </>
                ) : (
                    t('energyForecast.payButton')
                )}
            </button>
        </section>
    );
};

export default EnergyForecastSection;
