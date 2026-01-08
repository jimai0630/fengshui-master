import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import type { FullReportResponse } from '../types/dify';
import { generatePDFWithProgress } from '../utils/clientPdfGenerator';

type Props = {
    report: FullReportResponse;
    userEmail: string;
    progress?: number; // 0-100
};

const ReportSection: React.FC<Props> = ({ report, userEmail, progress = 0 }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = React.useState(false);
    const [pdfProgress, setPdfProgress] = React.useState(0);

    // Client-side PDF generation (works on Vercel free tier)
    const handleDownload = async () => {
        if (!report.report_content) {
            alert('报告内容不可用，请稍后重试');
            return;
        }

        setDownloading(true);
        setPdfProgress(0);

        try {
            const filename = `FengShui_Report_${userEmail}_${new Date().toISOString().split('T')[0]}.pdf`;

            await generatePDFWithProgress(
                report.report_content,
                filename,
                (prog) => setPdfProgress(prog)
            );

            console.log('[ReportSection] PDF generated and downloaded successfully');
        } catch (e) {
            console.error('[ReportSection] Client PDF generation failed:', e);
            const errorMessage = e instanceof Error ? e.message : '未知错误';
            alert(`PDF 生成失败: ${errorMessage}\n\n请刷新页面后重试。`);
        } finally {
            setDownloading(false);
            setPdfProgress(0);
        }
    };

    // Show processing state with progress bar
    if (!report.report_content || report.status === 'processing') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('consultation.report.generating')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('consultation.report.generatingDescription')}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('consultation.report.progress')}
                            </span>
                            <span className="text-sm font-bold text-amber-600">
                                {progress}%
                            </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Animated shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                                {t('consultation.report.paymentConfirmed')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            {progress < 100 ? (
                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                            <span className="text-gray-700 dark:text-gray-300">
                                {t('consultation.report.analyzingData')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 flex-shrink-0 ${progress < 100 ? 'text-gray-400' : 'text-green-500'}`}>
                                {progress < 100 ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                            </div>
                            <span className={`${progress < 100 ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                {t('consultation.report.generatingPDF')}
                            </span>
                        </div>
                    </div>

                    {/* Download Button (Disabled) */}
                    <button
                        disabled
                        className="w-full py-4 px-6 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        {t('consultation.report.downloadPending')}
                    </button>

                    {/* Important Notice */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                                    {t('consultation.report.importantNotice')}
                                </p>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• {t('consultation.report.doNotRefresh')}</li>
                                    <li>• {t('consultation.report.estimatedTime')}</li>
                                    <li>• {t('consultation.report.autoDownload')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Info */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('consultation.report.refreshRecovery')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show completed report with enabled download button
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('consultation.report.completed')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('consultation.report.completedDescription')}
                    </p>
                </div>

                {/* Download Button (Enabled) - Uses client-side PDF generation */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {pdfProgress > 0 ? `生成PDF中... ${pdfProgress}%` : t('consultation.processing')}
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            {t('consultation.report.downloadNow')}
                        </>
                    )}
                </button>

                {/* Report Preview */}
                <div className="prose dark:prose-invert max-w-none">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">
                            {t('consultation.report.preview')}
                        </h3>
                        <div
                            className="text-sm text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto whitespace-pre-wrap"
                        >
                            {report.report_content.substring(0, 2000)}
                            {report.report_content.length > 2000 && '...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSection;
