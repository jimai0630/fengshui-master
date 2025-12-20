import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProcessingStage } from '../types/dify';
import FengShuiLoading from './FengShuiLoading';

interface ProcessingSectionProps {
    currentStage: ProcessingStage;
    error?: string | null;
    onRetry?: () => void;
}

const ProcessingSection: React.FC<ProcessingSectionProps> = ({
    currentStage,
    error,
    onRetry
}) => {
    const { t } = useTranslation();

    // Special handling/override for Energy Analysis using the new FengShuiLoading
    if (currentStage === 'analyzing_energy') {
        return <FengShuiLoading />;
    }

    // Mapping stages to UI content
    const getContent = () => {
        switch (currentStage) {
            case 'analyzing_layout':
                return {
                    icon: <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />,
                    title: t('consultation.analyzing.title', 'Analyzing Floor Plan...'),
                    message: t('consultation.analyzing.message', 'Our AI is parsing your floor plan to identify rooms and orientation.'),
                    color: 'text-amber-600'
                };
            case 'layout_success':
                return {
                    icon: <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />,
                    title: t('consultation.success.layout', 'Image Analysis Successful!'),
                    message: t('consultation.success.message', 'Structure identified. Preparing energy analysis...'),
                    color: 'text-green-600'
                };
            case 'error_energy':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-red-500" />,
                    title: t('consultation.error.title', 'Analysis Interrupted'),
                    message: error || t('consultation.error.generic', 'Something went wrong during energy analysis.'),
                    color: 'text-red-600',
                    isError: true
                };
            default:
                return {
                    icon: <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />,
                    title: 'Processing...',
                    message: 'Please wait.',
                    color: 'text-gray-600'
                };
        }
    };

    const content = getContent();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
            <div className="max-w-md w-full text-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-500">

                {/* Icon Container with Glow */}
                <div className={`mx-auto flex items-center justify-center p-6 rounded-full bg-gray-50 dark:bg-gray-700/50 mb-4 ${content.isError ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    {content.icon}
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h3 className={`text-2xl font-bold ${content.isError ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {content.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        {content.message}
                    </p>
                </div>

                {/* Progress Bar (Visual only for non-error states) */}
                {!content.isError && currentStage !== 'layout_success' && (
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 w-[200%] animate-gradient-slide"></div>
                    </div>
                )}

                {/* Retry Button for Error State */}
                {content.isError && onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-6 w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Loader2 className="w-4 h-4" />
                        {t('consultation.retry', 'Retry Analysis')}
                    </button>
                )}
            </div>

            <style>{`
                @keyframes gradient-slide {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                .animate-gradient-slide {
                    animation: gradient-slide 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ProcessingSection;
