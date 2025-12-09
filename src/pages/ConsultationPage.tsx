import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Components
import FloorPlanUploadSection from '../components/FloorPlanUploadSection';
import ProcessingSection from '../components/ProcessingSection';
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
    FullReportResponse,
    ProcessingStage
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

    // New state for granular processing progress
    const [processingStage, setProcessingStage] = useState<ProcessingStage>('analyzing_layout');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load saved state if user has email
    useEffect(() => {
        const loadSavedState = async () => {
            if (userData.email) {
                const savedState = await loadConsultationState(userData.email);
                if (savedState) {
                    // Return 'processing' state to 'floor-plan-upload' if getting stuck
                    // Or resume intelligently based on existing results
                    let step = savedState.currentStep;
                    if (step === 'floor-plan-analyzing' || step === 'energy-assessment') {
                        // Legacy steps mapping
                        step = 'processing';
                    }

                    setCurrentStep(step);
                    setUserData(savedState.userData);
                    setFloorPlans(savedState.floorPlans);
                    setLayoutGridResult(savedState.layoutGridResult || null);
                    setEnergySummaryResult(savedState.energySummaryResult || null);
                    setFullReportResult(savedState.fullReportResult || null);
                    setConversationId(savedState.conversationId || '');
                    setHouseType(savedState.houseType);

                    if (step === 'processing') {
                        if (savedState.layoutGridResult) {
                            setProcessingStage('analyzing_energy');
                            // Ideally trigger energy analysis if not done, but for now user might need to retry manually if interrupted
                            // Or we can auto-trigger in a useEffect. 
                            // Simplified: restart layout analysis if no result, or energy if layout exists.
                        } else {
                            setProcessingStage('analyzing_layout');
                        }
                    }
                }
            }
        };

        loadSavedState();
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

    // Helper: Execute Energy Analysis
    const executeEnergyAnalysis = async (
        curUserData: Partial<UserCompleteData>,
        curLayoutResult: LayoutGridResponse
    ) => {
        try {
            setProcessingStage('analyzing_energy');
            setError(null);

            // Calculate benming star
            const { starNo, starName } = calculateBenmingFromDate(
                curUserData.birthDate!,
                curUserData.gender as '男' | '女'
            );

            // Prepare complete user data
            const completeUserData: UserCompleteData = {
                ...curUserData,
                email: curUserData.email!,
                birthDate: curUserData.birthDate!,
                gender: curUserData.gender as '男' | '女',
                floorIndex: 1,
                houseType,
                houseGridJson: JSON.stringify(curLayoutResult),
                conversationId: '', // Always start a fresh conversation for Agent 2 (different Dify App)
                benmingStarNo: starNo,
                benmingStarName: starName,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            setUserData(completeUserData);

            // Call Agent2 (Energy Summary)
            const { result, conversationId: newConvId } = await callEnergySummary(
                completeUserData,
                JSON.stringify(curLayoutResult),
                'energy_summary'
            );

            setConversationId(newConvId);
            setEnergySummaryResult(result);

            // Transition to result
            setCurrentStep('energy-result');
        } catch (err) {
            console.error('Energy assessment error:', err);
            // DO NOT reset steps. Stay in processing but show error.
            setProcessingStage('error_energy');
            setError(t('consultation.errors.energyAssessmentError'));
        }
    };

    // Handler: Floor plan upload complete (Entry Point for the Chain)
    const handleFloorPlanUploadComplete = async (
        uploads: FloorPlanUpload[],
        selectedHouseType: HouseType,
        newUserData: Partial<UserCompleteData>
    ) => {
        // 1. Setup State
        setUserData(prev => ({ ...prev, ...newUserData }));
        setFloorPlans(uploads);
        setHouseType(selectedHouseType);

        setCurrentStep('processing');
        setProcessingStage('analyzing_layout');
        setError(null);

        try {
            // 2. Upload Files
            const uploadPromises = uploads.map(upload =>
                uploadFile(upload.file, newUserData.email!)
            );
            const uploadResults = await Promise.all(uploadPromises);

            const updatedFloorPlans = uploads.map((upload, idx) => ({
                ...upload,
                fileId: uploadResults[idx].id
            }));
            setFloorPlans(updatedFloorPlans);

            // 3. Prepare Data for Agent 1
            const completeUserData: UserCompleteData = {
                ...newUserData,
                email: newUserData.email!,
                birthDate: newUserData.birthDate!,
                gender: newUserData.gender as '男' | '女',
                floorIndex: 1,
                houseType: selectedHouseType,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            // 4. Call Agent 1
            const fileIds = uploadResults.map(r => r.id);
            const { result, conversationId: newConvId } = await callLayoutGrid(
                completeUserData,
                fileIds,
                selectedHouseType,
                i18n.language === 'zh' ? 'zh' : 'en'
            );

            setConversationId(newConvId);

            if (result.ok) {
                setLayoutGridResult(result);
                setProcessingStage('layout_success');

                // 5. Auto-trigger Agent 2 after short delay
                setTimeout(() => {
                    executeEnergyAnalysis(completeUserData, result);
                }, 1500);
            } else {
                // Agent 1 Logic failure
                setError(result.error_message_for_user || t('consultation.errors.layoutGridFailed'));
                setCurrentStep('floor-plan-upload');
            }
        } catch (err) {
            console.error('Floor plan analysis error:', err);
            setError(t('consultation.errors.analysisError'));
            setCurrentStep('floor-plan-upload');
        }
    };

    // Handler: Retry Energy Analysis (For Agent 2 failure)
    const handleRetryEnergy = () => {
        if (userData && layoutGridResult && conversationId) {
            executeEnergyAnalysis(userData, layoutGridResult);
        } else {
            // Should not happen, but fallback
            setCurrentStep('floor-plan-upload');
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

    // Handler: Retry from error (Generic)
    const handleRetry = () => {
        setError(null);
        setCurrentStep('floor-plan-upload');
        setFloorPlans([]);
        setLayoutGridResult(null);
    };

    // Handler: Back to previous step
    const handleBack = () => {
        switch (currentStep) {
            case 'processing':
                // Allow backing out of processing? Maybe confirm?
                setCurrentStep('floor-plan-upload');
                break;
            case 'energy-result':
                // Back to upload? Or warn user?
                // Given the flow, maybe back to upload is the only way to "restart"
                if (window.confirm(t('consultation.confirmRestart', 'Start over? Current analysis will be lost.'))) {
                    setCurrentStep('floor-plan-upload');
                }
                break;
            case 'payment':
                setCurrentStep('energy-result');
                break;
            default:
                break;
        }
    };

    // Progress calculation
    const getProgressWidth = () => {
        switch (currentStep) {
            case 'floor-plan-upload': return '0%';
            case 'processing':
                if (processingStage === 'analyzing_layout') return '20%';
                if (processingStage === 'layout_success') return '40%';
                if (processingStage === 'analyzing_energy') return '60%';
                return '33%';
            case 'energy-result': return '80%';
            case 'payment': return '90%';
            case 'report': return '100%';
            default: return '0%';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Progress Indicator */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Back Button */}
                    {['floor-plan-upload', 'energy-result', 'payment'].includes(currentStep) && (
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
                            <span className={`${['floor-plan-upload', 'processing'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.analysis')}
                            </span>
                            <span className={`${['energy-result', 'payment'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : currentStep === 'report' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.report')}
                            </span>
                        </div>
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{ width: getProgressWidth() }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display (Only for global/critical errors, specific processing errors handled in ProcessingSection) */}
            {error && currentStep !== 'processing' && (
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
                        initialUserData={initialUserData}
                        onComplete={handleFloorPlanUploadComplete}
                        onAnalyzing={() => { }} // No longer used, handled by new flow
                    />
                )}

                {currentStep === 'processing' && (
                    <ProcessingSection
                        currentStage={processingStage}
                        error={error}
                        onRetry={handleRetryEnergy}
                    />
                )}

                {/* Step 3: Energy Result */}
                {currentStep === 'energy-result' && energySummaryResult && (
                    <div>
                        <EnergyForecastSection
                            energyData={energySummaryResult}
                            onGenerateReport={handleProceedToPayment}
                        />
                    </div>
                )}

                {/* Step 4: Payment */}
                {currentStep === 'payment' && (
                    <PaymentSection
                        reportPrice={REPORT_PRICE}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                )}

                {/* Step 5: Report */}
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
