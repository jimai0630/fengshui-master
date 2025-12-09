import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Heart, Coins, Briefcase, Activity, Sparkles, ArrowRight, Star } from 'lucide-react';
import type { EnergySummaryResponse } from '../types/dify';
import EnergyRadarChart from './EnergyRadarChart';

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

    // Icons map with gradient colors
    const icons = {
        love: <Heart className="w-5 h-5 text-rose-500" />,
        wealth: <Coins className="w-5 h-5 text-amber-500" />,
        career: <Briefcase className="w-5 h-5 text-blue-500" />,
        health: <Activity className="w-5 h-5 text-emerald-500" />,
        luck: <Sparkles className="w-5 h-5 text-purple-500" />
    };

    // Prepare chart data
    const chartData = useMemo(() => {
        return dimensions.map(dim => ({
            subject: energyData.dimension_labels[dim],
            A: energyData.scores_before[dim],
            B: energyData.scores_after[dim],
            fullMark: 10
        }));
    }, [energyData, dimensions]);

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-amber-100 dark:from-rose-900/30 dark:to-amber-900/30 rounded-full mb-4">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">您的专属能量分析</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {t('energyForecast.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {t('energyForecast.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Chart */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-rose-50/30 dark:from-gray-800 dark:to-rose-900/10 rounded-3xl shadow-lg p-6 border border-rose-100 dark:border-rose-900/20">
                    <div className="flex flex-col items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                            5大生活维度能量分析
                        </h3>
                        <EnergyRadarChart data={chartData} />
                        <div className="mt-4 px-4 py-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl">
                            <p className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                                灰色区域代表当前状态<br />
                                橙色区域展示优化潜力
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Detailed Breakdown */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    {dimensions.map((dim) => (
                        <div
                            key={dim}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-gradient-to-br from-gray-50 to-rose-50 dark:from-gray-700 dark:to-rose-900/20 rounded-xl group-hover:scale-110 transition-transform">
                                        {icons[dim]}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                                            {energyData.dimension_labels[dim]}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                                            {energyData.summary_text[dim]}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 px-3 py-1.5 rounded-full shrink-0">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {energyData.scores_before[dim]}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-amber-500" />
                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                        {energyData.scores_after[dim]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Overall Summary & CTA */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {/* Overall Summary */}
                    {energyData.overall_summary && (
                        <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 dark:from-amber-900/20 dark:via-rose-900/20 dark:to-orange-900/20 rounded-3xl p-6 shadow-lg border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                    整体运势解读
                                </h3>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4">
                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                    {energyData.overall_summary}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex-1 flex flex-col justify-center">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full mb-3">
                                <Star className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">专业完整报告</span>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                                获取您的2026年<br />完整风水运势报告
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                包含详细分析、调整建议及吉凶方位图
                            </p>
                        </div>

                        <button
                            onClick={handleClick}
                            disabled={processing}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {t('energyForecast.payButton')}
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            一次性购买 · 永久查看
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EnergyForecastSection;
