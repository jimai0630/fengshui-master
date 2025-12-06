import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Components
import FloorPlanUploadSection from '../components/FloorPlanUploadSection';
import EnergyAssessmentButton from '../components/EnergyAssessmentButton';
import EnergyForecastSection from '../components/EnergyForecastSection';
import PaymentSection from '../components/PaymentSection';
import ReportSection from '../components/ReportSection';

// Services
import { uploadFile, callLayoutGrid, callEnergySummary, callFullReport } from '../services/difyService';
import {
    loadConsultationState,
    updateConsultationState
} from '../services/consultationStateService';
import { calculateBenmingFromDate } from '../utils/benmingCalculator';

// Types
import type {
    ConsultationStep,
    FloorPlanUpload,
    HouseType,
    UserCompleteData,
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse
} from '../types/dify';

const REPORT_PRICE = 29; // Fixed price for report

const ConsultationPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Get user data from location state (from homepage)
    const initialUserData = location.state as Partial<UserCompleteData> | undefined;

    // State management
    const [currentStep, setCurrentStep] = useState<ConsultationStep>('floor-plan-upload');
    const [userData, setUserData] = useState<Partial<UserCompleteData>>(initialUserData || {});
    const [floorPlans, setFloorPlans] = useState<FloorPlanUpload[]>([]);
    const [houseType, setHouseType] = useState<HouseType>('apartment');
    const [layoutGridResult, setLayoutGridResult] = useState<LayoutGridResponse | null>(null);
    const [energySummaryResult, setEnergySummaryResult] = useState<EnergySummaryResponse | null>(null);
    const [fullReportResult, setFullReportResult] = useState<FullReportResponse | null>(null);
    const [conversationId, setConversationId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load saved state if user has email
    useEffect(() => {
        if (userData.email) {
            const savedState = loadConsultationState(userData.email);
            if (savedState) {
                // Restore state
                setCurrentStep(savedState.currentStep);
                setUserData(savedState.userData);
                setFloorPlans(savedState.floorPlans);
                setLayoutGridResult(savedState.layoutGridResult || null);
                setEnergySummaryResult(savedState.energySummaryResult || null);
                setFullReportResult(savedState.fullReportResult || null);
                setConversationId(savedState.conversationId || '');
            }
        }
    }, [userData.email]);

    // Save state whenever it changes
    useEffect(() => {
        if (userData.email) {
            updateConsultationState(userData.email, {
                currentStep,
                userData,
                floorPlans,
                layoutGridResult: layoutGridResult || undefined,
                energySummaryResult: energySummaryResult || undefined,
                fullReportResult: fullReportResult || undefined,
                conversationId,
                paymentCompleted: currentStep === 'report'
            });
        }
    }, [currentStep, userData, floorPlans, layoutGridResult, energySummaryResult, fullReportResult, conversationId]);

    // Check if user data is complete
    const hasRequiredUserData = userData.email && userData.birthDate && userData.gender;

    // Redirect to home if no user data
    useEffect(() => {
        if (!hasRequiredUserData && currentStep !== 'floor-plan-upload') {
            navigate('/');
        }
    }, [hasRequiredUserData, currentStep, navigate]);

    // Handler: Floor plan upload complete
    const handleFloorPlanUploadComplete = async (
        uploads: FloorPlanUpload[],
        selectedHouseType: HouseType,
        newUserData: Partial<UserCompleteData>
    ) => {
        // Merge new user data
        setUserData(prev => ({ ...prev, ...newUserData }));
        setFloorPlans(uploads);
        setHouseType(selectedHouseType);
        setCurrentStep('floor-plan-analyzing');
        setError(null);

        try {
            setIsLoading(true);

            // Upload all floor plan files to Dify
            const uploadPromises = uploads.map(upload =>
                uploadFile(upload.file, newUserData.email!)
            );
            const uploadResults = await Promise.all(uploadPromises);

            // Update floor plans with file IDs
            const updatedFloorPlans = uploads.map((upload, idx) => ({
                ...upload,
                fileId: uploadResults[idx].id
            }));
            setFloorPlans(updatedFloorPlans);

            // Prepare user data for Agent1
            const completeUserData: UserCompleteData = {
                ...newUserData,
                email: newUserData.email!,
                birthDate: newUserData.birthDate!,
                gender: newUserData.gender as '男' | '女',
                floorIndex: 1,
                houseType: selectedHouseType,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            // Call Agent1 (Layout Grid)
            const fileIds = uploadResults.map(r => r.id);
            const { result, conversationId: newConvId } = await callLayoutGrid(
                completeUserData,
                fileIds,
                selectedHouseType,
                i18n.language === 'zh' ? 'zh' : 'en'
            );

            setConversationId(newConvId);

            // Check if Agent1 succeeded
            if (result.ok) {
                setLayoutGridResult(result);
                setCurrentStep('floor-plan-result');
            } else {
                // Agent1 failed
                setError(result.error_message_for_user || t('consultation.errors.layoutGridFailed'));
                setCurrentStep('floor-plan-upload');
            }
        } catch (err) {
            console.error('Floor plan analysis error:', err);
            setError(t('consultation.errors.analysisError'));
            setCurrentStep('floor-plan-upload');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler: Start energy assessment
    const handleStartEnergyAssessment = async () => {
        setCurrentStep('energy-assessment');
        setError(null);

        try {
            setIsLoading(true);

            // Calculate benming star
            const { starNo, starName } = calculateBenmingFromDate(
                userData.birthDate!,
                userData.gender as '男' | '女'
            );

            // Prepare complete user data
            const completeUserData: UserCompleteData = {
                ...userData,
                email: userData.email!,
                birthDate: userData.birthDate!,
                gender: userData.gender as '男' | '女',
                floorIndex: 1,
                houseType,
                houseGridJson: JSON.stringify(layoutGridResult),
                conversationId,
                benmingStarNo: starNo,
                benmingStarName: starName,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            setUserData(completeUserData);

            // Call Agent2 (Energy Summary)
            const { result, conversationId: newConvId } = await callEnergySummary(
                completeUserData,
                JSON.stringify(layoutGridResult),
                'energy_summary'
            );

            setConversationId(newConvId);
            setEnergySummaryResult(result);
            setCurrentStep('energy-result');
        } catch (err) {
            console.error('Energy assessment error:', err);
            setError(t('consultation.errors.energyAssessmentError'));
            setCurrentStep('floor-plan-result');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler: Proceed to payment
    const handleProceedToPayment = () => {
        setCurrentStep('payment');
    };

    // Handler: Payment success
    const handlePaymentSuccess = async () => {
        setError(null);

        try {
            setIsLoading(true);

            // Call Agent2 (Full Report)
            const { result } = await callFullReport(
                userData as UserCompleteData,
                JSON.stringify(layoutGridResult),
                (progress) => console.log('Report generation progress:', progress)
            );

            setFullReportResult(result);
            setCurrentStep('report');
        } catch (err) {
            console.error('Report generation error:', err);
            setError(t('consultation.errors.reportGenerationError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handler: Payment error
    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // Handler: Retry from error
    const handleRetry = () => {
        setError(null);
        setCurrentStep('floor-plan-upload');
        setFloorPlans([]);
        setLayoutGridResult(null);
    };

    // Handler: Back to previous step
    const handleBack = () => {
        switch (currentStep) {
            case 'floor-plan-result':
                setCurrentStep('floor-plan-upload');
                break;
            case 'energy-result':
                setCurrentStep('floor-plan-result');
                break;
            case 'payment':
                setCurrentStep('energy-result');
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Progress Indicator */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Back Button */}
                    {currentStep !== 'floor-plan-upload' && currentStep !== 'floor-plan-analyzing' && currentStep !== 'energy-assessment' && currentStep !== 'report' && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('consultation.back')}</span>
                        </button>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                            <span className={`${['floor-plan-upload', 'floor-plan-analyzing'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : ['floor-plan-result', 'energy-assessment', 'energy-result', 'payment', 'report'].includes(currentStep) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.upload')}
                            </span>
                            <span className={`${['floor-plan-result', 'energy-assessment'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : ['energy-result', 'payment', 'report'].includes(currentStep) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.analysis')}
                            </span>
                            <span className={`${['energy-result', 'payment'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : currentStep === 'report' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.report')}
                            </span>
                        </div>
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{
                                    width: currentStep === 'floor-plan-upload' || currentStep === 'floor-plan-analyzing' ? '0%'
                                        : currentStep === 'floor-plan-result' || currentStep === 'energy-assessment' ? '33.33%'
                                            : currentStep === 'energy-result' || currentStep === 'payment' ? '66.66%'
                                                : currentStep === 'report' ? '100%' : '0%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                                {t('consultation.retry')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="pb-20">
                {/* Step 1: Floor Plan Upload */}
                {currentStep === 'floor-plan-upload' && (
                    <FloorPlanUploadSection
                        onComplete={handleFloorPlanUploadComplete}
                        onAnalyzing={() => setCurrentStep('floor-plan-analyzing')}
                    />
                )}

                {/* Step 2: Analyzing */}
                {currentStep === 'floor-plan-analyzing' && (
                    <div className="py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-16 h-16 mx-auto text-amber-600 animate-spin mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {t('consultation.analyzing.title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('consultation.analyzing.message')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 3: Floor Plan Result + Energy Assessment Button */}
                {currentStep === 'floor-plan-result' && layoutGridResult && (
                    <EnergyAssessmentButton
                        onClick={handleStartEnergyAssessment}
                        loading={false}
                    />
                )}

                {/* Step 4: Energy Assessment Loading */}
                {currentStep === 'energy-assessment' && (
                    <div className="py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-16 h-16 mx-auto text-amber-600 animate-spin mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {t('consultation.energyAssessment.title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('consultation.energyAssessment.message')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 5: Energy Result */}
                {currentStep === 'energy-result' && energySummaryResult && (
                    <div>
                        <EnergyForecastSection
                            energyData={energySummaryResult}
                            onGenerateReport={handleProceedToPayment}
                        />
                    </div>
                )}

                {/* Step 6: Payment */}
                {currentStep === 'payment' && (
                    <PaymentSection
                        reportPrice={REPORT_PRICE}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                    />
                )}

                {/* Step 7: Report */}
                {currentStep === 'report' && fullReportResult && (
                    <ReportSection
                        report={fullReportResult}
                        userEmail={userData.email!}
                    />
                )}
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl">
                        <Loader2 className="w-12 h-12 mx-auto text-amber-600 animate-spin mb-4" />
                        <p className="text-gray-800 dark:text-white font-medium">
                            {t('consultation.processing')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationPage;
