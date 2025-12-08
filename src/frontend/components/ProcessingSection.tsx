
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';

interface ProcessingSectionProps {
    currentStage: 'analyzing_layout' | 'layout_success' | 'analyzing_energy';
}

const ProcessingSection: React.FC<ProcessingSectionProps> = ({ currentStage }) => {
    const { t } = useTranslation();

    const getMessage = () => {
        switch (currentStage) {
            case 'analyzing_layout':
                return t('consultation.analyzing.title', 'Analyzing Floor Plan...');
            case 'layout_success':
                return t('consultation.analyzing.success', 'Structure Recognized!');
            case 'analyzing_energy':
                return t('consultation.energyAssessment.title', 'Calculating Energy Flow...');
            default:
                return '';
        }
    };

    const getSubMessage = () => {
        switch (currentStage) {
            case 'analyzing_layout':
                return t('consultation.analyzing.message', 'Our AI is identifying room structures and orientations.');
            case 'layout_success':
                return t('consultation.analyzing.successDesc', 'Floor plan successfully parsed.');
            case 'analyzing_energy':
                return t('consultation.energyAssessment.message', 'Evaluating the interaction between your birth chart and the house energy.');
            default:
                return '';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {currentStage === 'analyzing_layout' && (
                        <motion.div
                            key="layout"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="absolute inset-0 border-4 border-amber-200 dark:border-amber-900 rounded-full"></div>
                            <div className="absolute inset-0 border-t-4 border-amber-600 dark:border-amber-400 rounded-full animate-spin"></div>
                            <Loader2 className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-pulse" />
                        </motion.div>
                    )}

                    {currentStage === 'layout_success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full"
                        >
                            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                        </motion.div>
                    )}

                    {currentStage === 'analyzing_energy' && (
                        <motion.div
                            key="energy"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border-r-4 border-purple-600 dark:border-purple-400 rounded-full animate-spin"></div>
                            <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-bounce" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                key={currentStage} // Re-animate text on change
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center max-w-md"
            >
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">
                    {getMessage()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {getSubMessage()}
                </p>
            </motion.div>
        </div>
    );
};

export default ProcessingSection;
