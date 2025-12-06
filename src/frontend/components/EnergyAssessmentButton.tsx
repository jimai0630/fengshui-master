import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';

interface EnergyAssessmentButtonProps {
    onClick: () => void;
    loading?: boolean;
}

const EnergyAssessmentButton: React.FC<EnergyAssessmentButtonProps> = ({ onClick, loading = false }) => {
    const { t } = useTranslation();

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-2xl mx-auto text-center">
                {/* Success Message */}
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full text-green-800 dark:text-green-300 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('energyAssessment.success')}
                    </div>
                </div>

                {/* Main Button */}
                <button
                    onClick={onClick}
                    disabled={loading}
                    className="group relative w-full max-w-md mx-auto py-6 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Pulse Animation */}
                    {!loading && (
                        <div className="absolute inset-0 animate-pulse-slow">
                            <div className="absolute inset-0 bg-white opacity-20 rounded-2xl animate-ping-slow"></div>
                        </div>
                    )}

                    {/* Button Content */}
                    <span className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {t('energyAssessment.analyzing')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6 animate-pulse" />
                                {t('energyAssessment.button')}
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </>
                        )}
                    </span>

                    {/* Shimmer Effect */}
                    {!loading && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    )}
                </button>

                {/* Subtitle */}
                <p className="mt-6 text-gray-600 dark:text-gray-400 text-sm animate-fade-in">
                    {t('energyAssessment.subtitle')}
                </p>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                @keyframes ping-slow {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .animate-ping-slow {
                    animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default EnergyAssessmentButton;
