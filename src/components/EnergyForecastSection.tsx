import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { callEnergySummary, callFullReport, withRetry } from '../services/difyService';
import { checkIdempotency, cacheStepResult, getUserDataCache, hashEssentialData } from '../services/userDataService';
import type { UserCompleteData, EnergySummaryResponse, FullReportResponse } from '../types/dify';

const EnergyForecastSection: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [energyData, setEnergyData] = useState<EnergySummaryResponse | null>(null);
    const [userData, setUserData] = useState<UserCompleteData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportProgress, setReportProgress] = useState('');

    useEffect(() => {
        loadEnergyData();
    }, []);

    const loadEnergyData = async () => {
        try {
            // Get user data from route state or cache
            const stateData = location.state as UserCompleteData | null;
            const cachedData = getUserDataCache();
            
            const currentUserData = stateData || cachedData?.userData;
            
            if (!currentUserData || !currentUserData.birthDate || !currentUserData.gender || !currentUserData.floorPlanFileId) {
                // No user data available, just show default data without error
                setIsLoading(false);
                return;
            }

            setUserData(currentUserData);

            // Check idempotency
            const essentialData = {
                birthDate: currentUserData.birthDate,
                gender: currentUserData.gender,
                floorPlanFileId: currentUserData.floorPlanFileId
            };

            const cachedResult = checkIdempotency(essentialData, 'step2');
            
            if (cachedResult) {
                // Use cached result
                setEnergyData(cachedResult);
                setIsLoading(false);
                return;
            }

            // Call Dify API
            const roomPhotosDesc = JSON.stringify(currentUserData.roomPhotos || []);
            const houseGridJson = currentUserData.houseGridJson || '{}';

            const { result, conversationId } = await withRetry(() =>
                callEnergySummary(currentUserData, houseGridJson, roomPhotosDesc)
            );

            // Cache the result
            cacheStepResult(essentialData, currentUserData, 'step2', result, conversationId);
            
            setEnergyData(result);
            setUserData({ ...currentUserData, conversationId });
            setIsLoading(false);
        } catch (err) {
            console.error('Energy summary error:', err);
            // Don't show error, just use default data
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!userData) return;

        // Check idempotency for step3
        const essentialData = {
            birthDate: userData.birthDate,
            gender: userData.gender,
            floorPlanFileId: userData.floorPlanFileId
        };

        const cachedReport = checkIdempotency(essentialData, 'step3');
        
        if (cachedReport) {
            // Already have report, download it
            downloadReport(cachedReport);
            return;
        }

        // Need to pay first
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        if (!userData) return;

        setShowPaymentModal(false);
        setIsGeneratingReport(true);
        setReportProgress(t('dify.generating'));

        try {
            const roomPhotosDesc = JSON.stringify(userData.roomPhotos || []);
            const houseGridJson = userData.houseGridJson || '{}';

            const { result, conversationId } = await callFullReport(
                userData,
                houseGridJson,
                roomPhotosDesc,
                (progress) => {
                    setReportProgress(progress);
                }
            );

            // Cache the result
            const essentialData = {
                birthDate: userData.birthDate,
                gender: userData.gender,
                floorPlanFileId: userData.floorPlanFileId
            };
            cacheStepResult(essentialData, userData, 'step3', result, conversationId);

            setIsGeneratingReport(false);
            
            // Download the report
            downloadReport(result);
        } catch (err) {
            console.error('Report generation error:', err);
            setError(t('dify.error.api'));
            setIsGeneratingReport(false);
        }
    };

    const downloadReport = (report: FullReportResponse) => {
        if (report.pdf_base64) {
            // Download PDF from base64
            const linkSource = `data:application/pdf;base64,${report.pdf_base64}`;
            const downloadLink = document.createElement('a');
            downloadLink.href = linkSource;
            downloadLink.download = `Feng_Shui_Report_${new Date().getTime()}.pdf`;
            downloadLink.click();
        } else {
            // Fallback: create text file with markdown content
            const blob = new Blob([report.report_content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `Feng_Shui_Report_${new Date().getTime()}.txt`;
            downloadLink.click();
            URL.revokeObjectURL(url);
        }
    };

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

    // Default data to show while loading or if there's an error
    const defaultEnergyData: EnergySummaryResponse = {
        scores_before: {
            love: 5,
            wealth: 6,
            career: 6,
            health: 4,
            luck: 5
        },
        scores_after: {
            love: 8,
            wealth: 8,
            career: 8,
            health: 7,
            luck: 8
        },
        dimension_labels: {
            love: t('reportContent.pentagon.love'),
            wealth: t('reportContent.pentagon.wealth'),
            career: t('reportContent.pentagon.career'),
            health: t('reportContent.pentagon.health'),
            luck: t('reportContent.pentagon.luck')
        },
        summary_text: {
            love: t('dify.placeholder'),
            wealth: t('dify.placeholder'),
            career: t('dify.placeholder'),
            health: t('dify.placeholder'),
            luck: t('dify.placeholder')
        }
    };

    // Use actual data if available, otherwise use default
    const displayData = energyData || defaultEnergyData;

    const beforePoints = calculatePolygonPoints(displayData.scores_before);
    const afterPoints = calculatePolygonPoints(displayData.scores_after);

    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-background-light dark:bg-background-dark" id="page4">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-gray-800 dark:text-white">{t('energyForecast.title')}</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('energyForecast.subtitle')}</p>
                    
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dify.analyzing')}</span>
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
                        <div className="p-8 sm:p-10 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">{t('reportContent.pentagon.title')}</h3>
                            <div className="relative w-full max-w-sm aspect-square">
                                <div className="pentagon">
                                    <svg viewBox="0 0 100 95.1">
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
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '-5%', left: '50%' }}>{displayData.dimension_labels.love}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '105%' }}>{displayData.dimension_labels.wealth}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '85%' }}>{displayData.dimension_labels.career}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '15%' }}>{displayData.dimension_labels.health}</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '-5%' }}>{displayData.dimension_labels.luck}</div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-6">
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportContent.pentagon.before')}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-primary mr-2"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportContent.pentagon.after')}</span>
                                </div>
                            </div>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-sm">
                                {t('reportContent.pentagon.description')}
                            </p>
                        </div>
                        <div className="p-8 sm:p-10 bg-gray-50 dark:bg-gray-800/60 lg:border-l border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Brief Interpretation</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-primary">{displayData.dimension_labels.love}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{displayData.summary_text.love}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{displayData.dimension_labels.wealth}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{displayData.summary_text.wealth}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{displayData.dimension_labels.career}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{displayData.summary_text.career}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{displayData.dimension_labels.health}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{displayData.summary_text.health}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{displayData.dimension_labels.luck}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{displayData.summary_text.luck}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="bg-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-amber-700 transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                    >
                        {isGeneratingReport ? t('dify.generating') : t('energyForecast.payButton')}
                    </button>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Choose to download or send to your email after payment.</p>
                    
                    {isGeneratingReport && (
                        <div className="mt-6 max-w-md mx-auto">
                            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reportProgress}</p>
                        </div>
                    )}
                </div>
            </div>

            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </section>
    );
};

export default EnergyForecastSection;
