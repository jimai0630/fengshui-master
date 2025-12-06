import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import type { EnergySummaryResponse } from '../types/dify';

interface EnergyForecastSectionProps {
    energyData: EnergySummaryResponse;
    onGenerateReport: () => void;
}

const EnergyForecastSection: React.FC<EnergyForecastSectionProps> = ({
    energyData,
    onGenerateReport
}) => {
    const { t } = useTranslation();

    // Calculate polygon points for radar chart
    const calculatePolygonPoints = (scores: Record<string, number>) => {
        const dimensions = ['love', 'wealth', 'career', 'health', 'luck'];
        const center = { x: 50, y: 47.55 }; // Center of pentagon
        const maxRadius = 40; // Maximum radius for score 10

        const points = dimensions.map((dim, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180); // Start from top, 72 degrees apart
            const score = scores[dim] || 0;
            const radius = (score / 10) * maxRadius;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            return `${x},${y}`;
        });

        return points.join(' ');
    };

    const beforePoints = calculatePolygonPoints(energyData.scores_before);
    const afterPoints = calculatePolygonPoints(energyData.scores_after);

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-slide-down">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-gray-800 dark:text-white">
                        {t('energyForecast.title')}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        {t('energyForecast.subtitle')}
                    </p>
                </div>

                {/* Energy Chart and Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
                        {/* Pentagon Chart */}
                        <div className="p-8 sm:p-10 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">
                                {t('reportContent.pentagon.title')}
                            </h3>
                            <div className="relative w-full max-w-sm aspect-square">
                                <div className="pentagon">
                                    <svg viewBox="0 0 100 95.1">
                                        {/* Grid lines */}
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,0 100,34.55 80.9,95.1 19.1,95.1 0,34.55" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,19.02 80.9,43.77 72.72,76.08 27.28,76.08 19.1,43.77" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="#F3F4F6" points="50,38.04 61.8,53 64.54,57.06 35.46,57.06 38.2,53" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="19.1" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="80.9" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="100" y1="34.55" y2="34.55"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="80.9" y1="34.55" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="100" x2="19.1" y1="34.55" y2="95.1"></line>

                                        {/* Before adjustment */}
                                        <polygon fill="rgba(156, 163, 175, 0.3)" points={beforePoints} stroke="#9CA3AF" strokeWidth="1.5"></polygon>

                                        {/* After adjustment */}
                                        <polygon fill="rgba(217, 119, 6, 0.3)" points={afterPoints} stroke="#D97706" strokeWidth="2"></polygon>
                                    </svg>

                                    {/* Labels */}
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '-5%', left: '50%' }}>
                                        {energyData.dimension_labels.love}
                                    </div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '105%' }}>
                                        {energyData.dimension_labels.wealth}
                                    </div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '85%' }}>
                                        {energyData.dimension_labels.career}
                                    </div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '15%' }}>
                                        {energyData.dimension_labels.health}
                                    </div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '-5%' }}>
                                        {energyData.dimension_labels.luck}
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-6 flex justify-center space-x-6">
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('reportContent.pentagon.before')}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-amber-600 mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('reportContent.pentagon.after')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Text */}
                        <div className="p-8 sm:p-10 bg-gray-50 dark:bg-gray-900/60 lg:border-l border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Brief Interpretation
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                                        {energyData.dimension_labels.love}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {energyData.summary_text.love}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                                        {energyData.dimension_labels.wealth}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {energyData.summary_text.wealth}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                                        {energyData.dimension_labels.career}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {energyData.summary_text.career}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                                        {energyData.dimension_labels.health}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {energyData.summary_text.health}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                                        {energyData.dimension_labels.luck}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {energyData.summary_text.luck}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Report Button */}
                <div className="text-center">
                    <button
                        onClick={onGenerateReport}
                        className="py-4 px-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                    >
                        <FileText className="w-6 h-6" />
                        {t('energyForecast.generateReport')}
                    </button>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        {t('energyForecast.reportNote')}
                    </p>
                </div>
            </div>

            {/* Slide Down Animation */}
            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-down {
                    animation: slide-down 0.6s ease-out;
                }

                .pentagon {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .pentagon-label {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    white-space: nowrap;
                    color: #374151;
                }

                .dark .pentagon-label {
                    color: #D1D5DB;
                }
            `}</style>
        </section>
    );
};

export default EnergyForecastSection;
