import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Heart, Coins, Briefcase, Activity, Sparkles, Star } from 'lucide-react';
import type { EnergySummaryResponse } from '../types/dify';
import EnergyPentagonAnalysis from './EnergyPentagonAnalysis';

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

    const SummaryCard = (
        <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 dark:from-amber-900/20 dark:via-rose-900/20 dark:to-orange-900/20 rounded-3xl p-6 shadow-lg border border-amber-100 dark:border-amber-900/30 w-full max-w-4xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    大师能量寄语
                </h3>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-serif font-medium">
                    "{energyData.overall_summary || "正在接收大师的能量解读，请稍候..."}"
                </p>
            </div>
        </div>
    );

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            {/* 1. Master's Message (Top Center) */}
            {SummaryCard}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* 2. Left Column: Interactive Pentagon Analysis (Visual + Text) - 60% */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <EnergyPentagonAnalysis
                        energyData={energyData}
                        dimensions={dimensions}
                        icons={icons}
                    />

                    {/* Improvement Summary */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-center border border-amber-100 dark:border-amber-900/30">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            如果按照我们完整的风水报告来调整，将使您在新年里的能量整体提升
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-500 mx-1">
                                {(() => {
                                    const totalBefore = dimensions.reduce((acc, dim) => acc + energyData.scores_before[dim], 0);
                                    const totalAfter = dimensions.reduce((acc, dim) => acc + energyData.scores_after[dim], 0);
                                    if (totalBefore === 0) return 0;
                                    return Math.round(((totalAfter / totalBefore) - 1) * 100);
                                })()}%
                            </span>
                        </p>
                    </div>
                </div>

                {/* 3. Right Column: Unlock Report CTA - 40% */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-rose-100 dark:border-rose-900/30 flex flex-col justify-center h-full relative overflow-hidden group">

                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="text-center mb-8 relative z-10">
                            <div className="inline-block p-3 bg-amber-50 dark:bg-amber-900/30 rounded-full mb-4">
                                <Star className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                                解锁您的完整运势报告
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                基于您个人的能量与居家风水<br />
                                <span className="text-amber-600 font-medium">定制化生成专属能量调整方案</span>
                            </p>

                            <ul className="mt-6 text-left space-y-3 pl-4 border-l-2 border-amber-100 dark:border-amber-900/50">
                                <li className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                    用最小的改动来引导能量顺畅流转
                                </li>
                                <li className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    一对一量身定制，而非通用法则
                                </li>
                                <li className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    吉运增强方案，祝您万事顺遂
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleClick}
                            disabled={processing}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-lg font-bold rounded-full shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    {t('energyForecast.payButton')}
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 relative z-10">
                            一次性购买 · 永久有效
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EnergyForecastSection;

