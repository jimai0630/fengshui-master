import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Components
import FloorPlanUploadSection from '../components/FloorPlanUploadSection';
import EnergyForecastSection from '../components/EnergyForecastSection';
import PaymentSection from '../components/PaymentSection';
import ReportSection from '../components/ReportSection';
import ProcessingSection from '../components/ProcessingSection';

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
    const [error, setError] = useState<string | null>(null);

    // Processing sub-state for the UI
    const [processingStage, setProcessingStage] = useState<'analyzing_layout' | 'layout_success' | 'analyzing_energy' | null>(null);

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

    // Handler: Floor plan upload complete -> Start Chain
    const handleFloorPlanUploadComplete = async (
        uploads: FloorPlanUpload[],
        selectedHouseType: HouseType,
        newUserData: Partial<UserCompleteData>
    ) => {
        // 1. Update initial state
        setUserData(prev => ({ ...prev, ...newUserData }));
        setFloorPlans(uploads);
        setHouseType(selectedHouseType);

        // Transition to processing state
        setCurrentStep('floor-plan-analyzing');
        setProcessingStage('analyzing_layout');
        setError(null);

        try {
            // --- Step 1: Upload & Layout Analysis ---

            // Upload files
            const uploadPromises = uploads.map(upload =>
                uploadFile(upload.file, newUserData.email!)
            );
            const uploadResults = await Promise.all(uploadPromises);

            // Update local state with file IDs
            const updatedFloorPlans = uploads.map((upload, idx) => ({
                ...upload,
                fileId: uploadResults[idx].id
            }));
            setFloorPlans(updatedFloorPlans);

            // Prepare base user data
            const baseUserData: UserCompleteData = {
                ...newUserData,
                email: newUserData.email!,
                birthDate: newUserData.birthDate!,
                gender: newUserData.gender as '男' | '女',
                floorIndex: 1,
                houseType: selectedHouseType,
                languageMode: i18n.language === 'zh' ? 'zh' : 'en'
            };

            // Call to Agent 1 (Layout)
            const fileIds = uploadResults.map(r => r.id);
            const { result: layoutResult, conversationId: layoutConvId } = await callLayoutGrid(
                baseUserData,
                fileIds,
                selectedHouseType,
                i18n.language === 'zh' ? 'zh' : 'en'
            );

            if (!layoutResult.ok) {
                // Layout Analysis Failed
                throw new Error(layoutResult.error_message_for_user || t('consultation.errors.layoutGridFailed'));
            }

            setLayoutGridResult(layoutResult);
            setConversationId(layoutConvId);

            // --- Step 2: Transition & Success UI ---
            setProcessingStage('layout_success');

            // Wait 1.5s to show success state to user
            await new Promise(resolve => setTimeout(resolve, 1500));

            setProcessingStage('analyzing_energy');

            // --- Step 3: Energy Analysis ---

            // Calculate Benming Star
            const { starNo, starName } = calculateBenmingFromDate(
                baseUserData.birthDate,
                baseUserData.gender
            );

            // Complete user data for Agent 2
            const completeUserData: UserCompleteData = {
                ...baseUserData,
                houseGridJson: JSON.stringify(layoutResult),
                conversationId: layoutConvId,
                benmingStarNo: starNo,
                benmingStarName: starName
            };
            setUserData(completeUserData);

            // Call Agent 2 (Energy Summary)
            const { result: energyResult, conversationId: energyConvId } = await callEnergySummary(
                completeUserData,
                JSON.stringify(layoutResult),
                'energy_summary'
            );

            setConversationId(energyConvId);
            setEnergySummaryResult(energyResult);

            // --- Step 4: Show Results ---
            setProcessingStage(null);
            setCurrentStep('energy-result');

        } catch (err: any) {
            console.error('Consultation flow error:', err);

            // If error occurs, go back to upload and show error
            setError(err.message || t('consultation.errors.analysisError'));
            setCurrentStep('floor-plan-upload');
            setProcessingStage(null);
        }
    };

    // Handler: Proceed to payment
    const handleProceedToPayment = () => {
        setCurrentStep('payment');
    };

    // Handler: Payment success
    const handlePaymentSuccess = async () => {
        setError(null);
        // Note: For payment processing, we might also want to use a unified loader, 
        // but keeping existing local loading state for simplicity unless requested
        try {
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
        }
    };

    // Handler: Payment error
    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // Handler: Retry from error (UI button)
    const handleRetry = () => {
        setError(null);
        setCurrentStep('floor-plan-upload');
        setFloorPlans([]);
        setLayoutGridResult(null);
    };

    // Handler: Back to previous step
    const handleBack = () => {
        // Prevent back during heavy processing
        if (processingStage) return;

        switch (currentStep) {
            // Note: 'floor-plan-analyzing' is automatic, so we don't handle back from it usually
            case 'energy-result':
                // Creating a "back" from results might mean re-uploading, 
                // or we could just warn them they lose progress.
                if (window.confirm(t('consultation.confirmBackStartOver'))) {
                    setCurrentStep('floor-plan-upload');
                    setFloorPlans([]);
                    setLayoutGridResult(null);
                    setEnergySummaryResult(null);
                }
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
                    {['energy-result', 'payment', 'report'].includes(currentStep) && (
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
                            {/* Merged Analysis Step */}
                            <span className={`${['floor-plan-result', 'energy-assessment', 'energy-result'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : ['payment', 'report'].includes(currentStep) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.analysis')}
                            </span>
                            <span className={`${['payment'].includes(currentStep) ? 'text-amber-600 dark:text-amber-400' : currentStep === 'report' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {t('consultation.steps.report')}
                            </span>
                        </div>
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{
                                    width: currentStep === 'floor-plan-upload' ? '10%'
                                        : currentStep === 'floor-plan-analyzing' ? '40%'
                                            : currentStep === 'energy-result' ? '70%' // Analysis Complete
                                                : currentStep === 'payment' ? '85%'
                                                    : currentStep === 'report' ? '100%' : '0%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && currentStep === 'floor-plan-upload' && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-slide-down">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            <div className="text-xs text-red-600/80 mt-1">Please ensure your floor plan image is clear and contains visible room boundaries.</div>
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
                        // We handle the loading state locally via the 'processing' step, 
                        // effectively 'onAnalyzing' triggers the state change in the parent
                        onAnalyzing={() => { }}
                        isProcessing={false} // We don't use the child's processing state since we have a dedicated page
                    />
                )}

                {/* Unified Processing Step (Layout + Energy) */}
                {currentStep === 'floor-plan-analyzing' && processingStage && (
                    <ProcessingSection currentStage={processingStage} />
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
                        onPaymentError={handlePaymentError}
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

            {/* Global Loader for payment/report generation if needed, 
                or we can reuse ProcessingSection if we want to expand it later */}
            {/* Note: currentStep 'report' generation usually happens inside PaymentSection or separate overlay.
                 If we want to show generic loading for other non-flow parts: */}
            {(!processingStage && currentStep !== 'floor-plan-analyzing') &&
                // Check if we are in a 'sub-loading' state like payment processing? 
                // For now simpler to keep component-level loaders for payment.
                null}
        </div>
    );
};

export default ConsultationPage;
