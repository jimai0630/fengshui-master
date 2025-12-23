import { useState, useEffect, useRef, useCallback } from 'react';
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
import { uploadFile, callLayoutGrid, callEnergySummary } from '../services/difyService';
import {
    loadConsultationState,
    updateConsultationState
} from '../services/consultationStateService';
import { confirmPayment } from '../services/stripeService';
import { savePaymentRecord, generateFloorPlansHash, getOrCreateConsultationId } from '../services/supabaseService';
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

/**
 * 安全地解码 base64 PDF 字符串
 * 处理各种边界情况：data URL 前缀、空白字符、格式验证
 */
const decodeBase64PDF = (base64String: string): Blob => {
    try {
        if (!base64String || typeof base64String !== 'string') {
            throw new Error('Invalid input: base64String must be a non-empty string');
        }

        // 移除可能的 data URL 前缀
        let cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');

        // 移除所有空白字符（空格、换行符、制表符等）
        cleanBase64 = cleanBase64.replace(/\s/g, '');

        // 检查并移除无效字符（在验证之前）
        // 注意：逗号(44)可能是 JSON 序列化问题，需要特别处理
        const invalidChars = cleanBase64.match(/[^A-Za-z0-9+/=]/);
        if (invalidChars) {
            console.warn('Found invalid characters in base64, attempting to clean...');
            const uniqueInvalidChars = Array.from(new Set(invalidChars));
            console.warn('Invalid characters:', uniqueInvalidChars.map(c => `'${c}' (${c.charCodeAt(0)})`).join(', '));
            console.warn('First invalid char code:', invalidChars[0].charCodeAt(0));

            // 记录清理前的位置，以便调试
            const beforeLength = cleanBase64.length;
            const beforePreview = cleanBase64.substring(0, 100);

            // 移除所有无效字符（包括逗号、引号等）
            cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

            console.warn(`Removed ${beforeLength - cleanBase64.length} invalid characters`);
            console.warn('Before cleaning preview:', beforePreview);
            console.warn('After cleaning preview:', cleanBase64.substring(0, 100));

            // 如果清理后长度变化很大，可能有问题
            if (beforeLength - cleanBase64.length > beforeLength * 0.1) {
                console.error(`Warning: Removed more than 10% of characters (${beforeLength - cleanBase64.length}/${beforeLength})`);
            }
        }

        // 验证 base64 格式（只包含 A-Z, a-z, 0-9, +, /, =）
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            // 如果验证仍然失败，输出详细调试信息
            console.error('Base64 validation failed after cleaning');
            console.error('Clean base64 length:', cleanBase64.length);
            console.error('Clean base64 first 200 chars:', cleanBase64.substring(0, 200));
            console.error('Clean base64 last 200 chars:', cleanBase64.substring(Math.max(0, cleanBase64.length - 200)));

            // 尝试显示字符码
            const firstInvalid = cleanBase64.match(/[^A-Za-z0-9+/=]/);
            if (firstInvalid) {
                console.error('First invalid char after cleaning:', firstInvalid[0], 'code:', firstInvalid[0].charCodeAt(0));
            }

            throw new Error('Invalid base64 format: contains invalid characters after cleaning');
        }

        // 验证长度
        if (cleanBase64.length === 0) {
            throw new Error('Empty base64 string after cleaning');
        }

        // 检查长度是否为 4 的倍数（base64 要求）
        if (cleanBase64.length % 4 !== 0) {
            console.warn(`Base64 length (${cleanBase64.length}) is not a multiple of 4, attempting to pad...`);
            // 尝试添加填充
            const padding = 4 - (cleanBase64.length % 4);
            cleanBase64 += '='.repeat(padding);
            console.warn(`Added ${padding} padding characters`);
        }

        // 解码 base64
        let byteCharacters: string;
        try {
            byteCharacters = atob(cleanBase64);
        } catch (atobError) {
            console.error('atob failed:', atobError);
            console.error('Clean base64 length:', cleanBase64.length);
            console.error('Clean base64 first 200 chars:', cleanBase64.substring(0, 200));
            throw atobError;
        }

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // 验证 PDF 文件头（PDF 文件应该以 %PDF 开头）
        const pdfHeader = new Uint8Array(byteArray.slice(0, 4));
        const pdfHeaderString = String.fromCharCode(...pdfHeader);
        if (pdfHeaderString !== '%PDF') {
            console.error('Invalid PDF file header:', pdfHeaderString);
            console.error('Expected: %PDF');
            console.error('First 100 bytes:', Array.from(byteArray.slice(0, 100)).map(b => b.toString(16).padStart(2, '0')).join(' '));
            throw new Error('Invalid PDF file: file header does not match PDF format');
        }

        console.log('PDF file validated successfully, size:', byteArray.length, 'bytes');

        return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
        console.error('Failed to decode base64 PDF:', error);
        console.error('Original base64 string length:', base64String?.length);
        console.error('Original base64 string type:', typeof base64String);
        console.error('Original base64 string preview (first 200):', base64String?.substring(0, 200));
        console.error('Original base64 string preview (last 200):', base64String?.substring(Math.max(0, (base64String?.length || 0) - 200)));

        // 显示字符码以帮助调试
        if (base64String && base64String.length > 0) {
            const first50Chars = base64String.substring(0, 50);
            const charCodes = first50Chars.split('').map((c, i) => {
                const code = c.charCodeAt(0);
                return `${i}: '${c}' (${code})`;
            }).join(', ');
            console.error('First 50 chars with codes:', charCodes);
        }

        throw new Error(`PDF 解码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
};

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

    // Ref to prevent double execution of energy analysis
    const isExecutingEnergyAnalysis = useRef(false);

    // State for async report polling and progress
    const [reportPollingInterval, setReportPollingInterval] = useState<number | null>(null);
    const [reportProgress, setReportProgress] = useState(0);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load saved state if user has email
    useEffect(() => {
        const loadSavedState = async () => {
            // Check for reset flag from homepage navigation
            const shouldReset = (location.state as any)?.reset;

            if (shouldReset) {
                console.log('Resetting consultation state due to fresh navigation');
                // Don't load saved state when user explicitly wants to start fresh
                return;
            }

            if (userData.email && userData.birthDate && userData.gender && houseType && floorPlans.length > 0) {
                // Only load state if we have all required parameters
                const floorPlanFileIds = floorPlans.map(fp => fp.fileId).filter(Boolean) as string[];

                if (floorPlanFileIds.length > 0) {
                    try {
                        const savedState = await loadConsultationState(
                            userData.email,
                            userData.birthDate,
                            userData.gender,
                            houseType,
                            floorPlanFileIds
                        );

                        if (savedState) {
                            // Don't auto-load saved state if user is starting a fresh analysis
                            // Check if we have initial user data which indicates a fresh start from homepage
                            const isFreshStart = initialUserData && Object.keys(initialUserData).length > 0;

                            // If user is starting fresh, don't restore old state
                            if (isFreshStart) {
                                console.log('Fresh start detected, skipping state restoration');
                                return;
                            }

                            // Only restore state if we're not explicitly on floor-plan-upload (which means user is starting fresh)
                            // Or if it's a page refresh and we should restore progress
                            if (currentStep === 'floor-plan-upload' && !isFreshStart) {
                                // This might be a page refresh, but we should still check if user wants to continue
                                // For now, don't auto-restore if on initial step
                                console.log('On initial step, not restoring state to allow fresh start');
                                return;
                            }

                            // Validate savedState has required fields before using
                            if (!savedState.currentStep || !savedState.userData || !savedState.floorPlans || !savedState.houseType) {
                                console.warn('Invalid saved state, skipping restoration');
                                return;
                            }

                            // Return 'processing' state to 'floor-plan-upload' if getting stuck
                            // Or resume intelligently based on existing results
                            let step = savedState.currentStep;
                            if (step === 'floor-plan-analyzing' || step === 'energy-assessment') {
                                // Legacy steps mapping
                                step = 'processing';
                            }

                            // Only restore to report if there's actually a report and payment was completed
                            // Otherwise, start from the beginning
                            if (step === 'report' && (!savedState.fullReportResult || !savedState.paymentCompleted)) {
                                console.log('Report step detected but no report data, resetting to floor-plan-upload');
                                step = 'floor-plan-upload';
                            }

                            setCurrentStep(step);
                            setUserData(savedState.userData || {});
                            setFloorPlans(Array.isArray(savedState.floorPlans) ? savedState.floorPlans : []);
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
                    } catch (error) {
                        // Handle Supabase errors gracefully
                        console.error('Failed to load consultation state from Supabase:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                        // Only show error if it's a configuration issue, not if it's just "no data found"
                        if (errorMessage.includes('not configured') || errorMessage.includes('Supabase')) {
                            setError(t('consultation.errors.supabaseNotConfigured', 'Supabase is not configured. Please contact support.'));
                        }
                        // For other errors (network issues, etc.), silently fail and let user start fresh
                    }
                }
            }
        };

        loadSavedState();
    }, [userData.email, userData.birthDate, userData.gender, houseType, floorPlans, location.state, currentStep, initialUserData, t]);

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
            }).catch((error) => {
                // Handle Supabase save errors gracefully
                console.error('Failed to save consultation state to Supabase:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                // Only show error if it's a critical issue (configuration), not for temporary network issues
                if (errorMessage.includes('not configured')) {
                    setError(t('consultation.errors.supabaseNotConfigured', 'Supabase is not configured. Your progress may not be saved.'));
                }
                // For other errors, log but don't interrupt user flow
            });
        }
    }, [currentStep, userData, floorPlans, layoutGridResult, energySummaryResult, fullReportResult, conversationId, t]);

    // Check if user data is complete
    const hasRequiredUserData = userData.email && userData.birthDate && userData.gender;

    // Redirect to home if no user data
    useEffect(() => {
        if (!hasRequiredUserData && currentStep !== 'floor-plan-upload') {
            navigate('/');
        }
    }, [hasRequiredUserData, currentStep, navigate]);

    // Helper: Execute Energy Analysis
    const executeEnergyAnalysis = useCallback(async (
        curUserData: Partial<UserCompleteData>,
        curLayoutResult: LayoutGridResponse
    ) => {
        // Prevent double execution
        if (isExecutingEnergyAnalysis.current) {
            console.warn('[ConsultationPage] Energy analysis already in progress, skipping duplicate call');
            return;
        }

        isExecutingEnergyAnalysis.current = true;
        console.log('[ConsultationPage] Starting energy analysis...');

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
        } finally {
            isExecutingEnergyAnalysis.current = false;
        }
    }, [houseType, i18n.language, t]);

    // Handler: Floor plan upload complete (Entry Point for the Chain)
    const handleFloorPlanUploadComplete = async (
        uploads: FloorPlanUpload[],
        selectedHouseType: HouseType,
        newUserData: Partial<UserCompleteData>
    ) => {
        // 1. Setup State - Reset any previous report state when starting new analysis
        setUserData(prev => ({ ...prev, ...newUserData }));
        setFloorPlans(uploads);
        setHouseType(selectedHouseType);
        setFullReportResult(null); // Clear any previous report
        setEnergySummaryResult(null); // Clear previous energy result
        setLayoutGridResult(null); // Clear previous layout result

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
                // Energy analysis will be triggered by useEffect below
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

    // Auto-trigger Energy Analysis when layout analysis succeeds
    // This useEffect ensures it only runs once even with React Strict Mode
    useEffect(() => {
        if (
            layoutGridResult?.ok &&
            processingStage === 'layout_success' &&
            !energySummaryResult // Prevent re-running if already done
        ) {
            const timer = setTimeout(() => {
                console.log('[ConsultationPage] Auto-triggering energy analysis...');
                // Ensure we use the latest userData
                executeEnergyAnalysis(userData, layoutGridResult);
            }, 800); // Reduced delay for better UX

            return () => clearTimeout(timer);
        }
    }, [layoutGridResult, processingStage, energySummaryResult, userData, executeEnergyAnalysis]);

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

    // Handler: Payment success (ASYNC VERSION)
    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setError(null);

        try {
            setIsLoading(true);

            // 1. Confirm payment on backend
            const paymentResponse = await confirmPayment({
                paymentIntentId,
                consultationId: undefined,
            });

            // 2. Save payment record
            if (paymentResponse.paymentIntent) {
                const floorPlanFileIds = floorPlans.map(fp => fp.fileId).filter(Boolean) as string[];
                const floorPlansHash = generateFloorPlansHash(floorPlanFileIds);

                await savePaymentRecord({
                    payment_intent_id: paymentIntentId,
                    amount: paymentResponse.paymentIntent.amount,
                    currency: paymentResponse.paymentIntent.currency,
                    status: paymentResponse.paymentIntent.status as any,
                    metadata: {
                        email: userData.email || '',
                        floor_plans_hash: floorPlansHash,
                    },
                });
            }

            // 3. Get consultation ID
            const floorPlanFileIds = floorPlans.map(fp => fp.fileId).filter(Boolean) as string[];
            const consultationId = await getOrCreateConsultationId(
                userData.email!,
                userData.birthDate!,
                userData.gender!,
                houseType,
                floorPlanFileIds
            );

            // Save consultation ID to userData and localStorage for recovery
            setUserData(prev => ({ ...prev, consultationId }));
            localStorage.setItem(`consultation_id_${userData.email}`, consultationId);

            // 4. Start async report generation
            await fetch('/api/dify/full-report-async', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userData: userData as UserCompleteData,
                    houseGridJson: JSON.stringify(layoutGridResult),
                    consultationId
                })
            });

            console.log('[Payment] Async report generation started');

            // 5. Move to report page with processing state
            setCurrentStep('report');
            setFullReportResult({
                report_content: '',
                pdf_base64: undefined,
                conversation_id: '',
                status: 'processing'
            } as FullReportResponse);

            // 6. Start polling for completion
            startReportPolling(consultationId);

        } catch (err) {
            console.error('Payment processing error:', err);
            setError(t('consultation.errors.paymentProcessingError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Polling function with progress simulation
    const startReportPolling = useCallback((consultationId: string) => {
        let attempts = 0;
        const maxAttempts = 120; // 10 minutes (5s interval)
        const startTime = Date.now();

        // Simulate progress (0-90% during generation, 90-100% when completed)
        const progressInterval = setInterval(() => {
            setReportProgress(prev => {
                if (prev < 90) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const progress = Math.min(90, (elapsed / 60) * 90); // 60s estimate
                    return Math.floor(progress);
                }
                return prev;
            });
        }, 1000);

        const interval = setInterval(async () => {
            attempts++;

            try {
                const response = await fetch(`/api/dify/report-status/${consultationId}`);
                const data = await response.json();

                if (data.status === 'completed') {
                    clearInterval(interval);
                    clearInterval(progressInterval);
                    setReportPollingInterval(null);
                    setReportProgress(100);
                    setFullReportResult(data.report);

                    // Auto-download PDF if available
                    if (data.report?.pdf_base64) {
                        setTimeout(() => {
                            try {
                                const blob = decodeBase64PDF(data.report.pdf_base64);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `FengShui_Report_${userData.email || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                                console.log('[Polling] PDF downloaded successfully');
                            } catch (pdfError) {
                                console.error('[Polling] PDF download failed:', pdfError);
                            }
                        }, 500);
                    }
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    clearInterval(progressInterval);
                    setReportPollingInterval(null);
                    setError(data.error || t('consultation.errors.reportGenerationError'));
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    clearInterval(progressInterval);
                    setReportPollingInterval(null);
                    setError(t('consultation.errors.reportTimeout'));
                }

            } catch (err) {
                console.error('[Polling] Error:', err);
                // Continue polling on error
            }
        }, 5000); // Poll every 5 seconds

        setReportPollingInterval(interval as unknown as number);
    }, [userData.email, t]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (reportPollingInterval) {
                clearInterval(reportPollingInterval);
            }
        };
    }, [reportPollingInterval]);

    // Recovery mechanism: Check for in-progress reports on mount
    useEffect(() => {
        const recoverReportState = async () => {
            const consultationId = (userData as any).consultationId ||
                localStorage.getItem(`consultation_id_${userData.email}`);

            if (!consultationId || currentStep !== 'report') return;

            try {
                const response = await fetch(`/api/dify/report-status/${consultationId}`);
                const data = await response.json();

                if (data.status === 'processing') {
                    console.log('[Recovery] Resuming report generation polling');
                    setFullReportResult({
                        report_content: '',
                        pdf_base64: undefined,
                        conversation_id: '',
                        status: 'processing'
                    } as FullReportResponse);
                    startReportPolling(consultationId);

                } else if (data.status === 'completed') {
                    console.log('[Recovery] Loading completed report');
                    setReportProgress(100);
                    setFullReportResult(data.report);
                }
            } catch (err) {
                console.error('[Recovery] Failed:', err);
            }
        };

        recoverReportState();
    }, []); // Run once on mount


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
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
            {/* Starfield Background */}
            <div className="absolute inset-0 opacity-60">
                <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-[30%] left-[45%] w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[40%] left-[70%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-[50%] left-[25%] w-0.5 h-0.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-purple-100 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-[70%] left-[40%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                <div className="absolute top-[80%] left-[60%] w-1 h-1 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '1.8s' }}></div>
                <div className="absolute top-[15%] left-[90%] w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                <div className="absolute top-[85%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
                <div className="absolute top-[25%] left-[55%] w-0.5 h-0.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute top-[45%] left-[5%] w-1 h-1 bg-purple-100 rounded-full animate-pulse" style={{ animationDelay: '1.7s' }}></div>
                <div className="absolute top-[65%] left-[95%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2.2s' }}></div>
                <div className="absolute top-[75%] left-[30%] w-1 h-1 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute top-[35%] left-[75%] w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '1.4s' }}></div>
            </div>

            {/* Nebula Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Content Wrapper */}
            <div className="relative z-10">
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
                            progress={reportProgress}
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
        </div>
    );
};

export default ConsultationPage;
