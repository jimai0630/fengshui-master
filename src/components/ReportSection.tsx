import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import type { FullReportResponse } from '../types/dify';

type Props = {
    report: FullReportResponse;
    userEmail: string;
    progress?: number; // 0-100
};

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
        const invalidChars = cleanBase64.match(/[^A-Za-z0-9+/=]/);
        if (invalidChars) {
            console.warn('Found invalid characters in base64, attempting to clean...');
            cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');
        }

        // 验证 base64 格式
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            throw new Error('Invalid base64 format: contains invalid characters after cleaning');
        }

        // 检查长度是否为 4 的倍数（base64 要求）
        if (cleanBase64.length % 4 !== 0) {
            const padding = 4 - (cleanBase64.length % 4);
            cleanBase64 += '='.repeat(padding);
        }

        // 解码 base64
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // 验证 PDF 文件头
        const pdfHeader = new Uint8Array(byteArray.slice(0, 4));
        const pdfHeaderString = String.fromCharCode(...pdfHeader);
        if (pdfHeaderString !== '%PDF') {
            throw new Error('Invalid PDF file: file header does not match PDF format');
        }

        console.log('PDF file validated successfully, size:', byteArray.length, 'bytes');

        return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
        console.error('Failed to decode base64 PDF:', error);
        throw new Error(`PDF 解码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
};

const ReportSection: React.FC<Props> = ({ report, userEmail, progress = 0 }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = React.useState(false);

    const handleDownload = async () => {
        if (!report.pdf_base64) {
            console.error('No PDF data available');
            return;
        }

        setDownloading(true);
        try {
            const blob = decodeBase64PDF(report.pdf_base64);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FengShui_Report_${userEmail}_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Download failed', e);
            alert('PDF 下载失败，请稍后重试');
        }
        setDownloading(false);
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

                {/* Download Button (Enabled) */}
                {report.pdf_base64 && (
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('consultation.processing')}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                {t('consultation.report.downloadNow')}
                            </>
                        )}
                    </button>
                )}

                {/* Report Preview */}
                <div className="prose dark:prose-invert max-w-none">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">
                            {t('consultation.report.preview')}
                        </h3>
                        <div
                            className="text-sm text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto"
                            dangerouslySetInnerHTML={{
                                __html: report.report_content.substring(0, 1000) + '...'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSection;
