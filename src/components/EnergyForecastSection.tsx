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

    const SummaryCard = (
        <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 dark:from-amber-900/20 dark:via-rose-900/20 dark:to-orange-900/20 rounded-3xl p-6 shadow-lg border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    大师能量寄语
                </h3>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line font-medium min-h-[80px]">
                    {energyData.overall_summary || "正在接收大师的能量解读，请稍候..."}
                </p>
            </div>
        </div>
    );

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

            {/* Mobile Only: Summary at the top */}
            <div className="lg:hidden mb-8">
                {SummaryCard}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: 5 Dimensions Analysis */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-rose-500" />
                        5大生活维度能量分析
                    </h3>

                    {dimensions.map((dim) => (
                        <div
                            key={dim}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-gray-50 to-rose-50 dark:from-gray-700 dark:to-rose-900/20 rounded-xl group-hover:scale-105 transition-transform flex-shrink-0">
                                    {icons[dim]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                            {energyData.dimension_labels[dim]}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-400">
                                                {energyData.scores_before[dim]}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-amber-500" />
                                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                                {energyData.scores_after[dim]}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {energyData.summary_text[dim]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Summary (Stimulus), Chart (Support), CTA */}
                <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">

                    {/* Overall Summary (Stimulus) - Highlighted - Desktop Only */}
                    <div className="hidden lg:block">
                        {SummaryCard}
                    </div>

                    {/* Chart (Support) - Visual reinforcement */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-4 uppercase tracking-wider">
                            能量分布图谱
                        </h4>
                        <div className="w-full flex justify-center">
                            <EnergyRadarChart data={chartData} />
                        </div>
                        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <span>调整前</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span>调整后</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-rose-100 dark:border-rose-900/30">
                        <div className="text-center mb-6">
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                解锁完整运势报告
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                包含详细分析、调整建议及吉凶方位图
                            </p>
                        </div>

                        <button
                            onClick={handleClick}
                            disabled={processing}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-lg font-bold rounded-full shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                                    {t('energyForecast.payButton')}
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            一次性购买 · 永久有效 · 30天无理由
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EnergyForecastSection;
