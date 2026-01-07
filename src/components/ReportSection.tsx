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
const decodeBase64PDF = (base64String: string | null | undefined | any): Blob => {
    try {
        // 检查输入有效性
        if (!base64String) {
            throw new Error('PDF data is missing or null');
        }

        // 处理数组格式（可能来自 JSONB 序列化问题）
        if (Array.isArray(base64String)) {
            console.warn('PDF data is an array, converting to Uint8Array directly');
            const byteArray = new Uint8Array(base64String);
            
            // 验证 PDF 文件头
            if (byteArray.length < 4) {
                throw new Error(`PDF data too short (${byteArray.length} bytes)`);
            }
            
            const pdfHeader = String.fromCharCode(...byteArray.slice(0, 4));
            if (pdfHeader !== '%PDF') {
                throw new Error(`Invalid PDF header: "${pdfHeader}"`);
            }
            
            return new Blob([byteArray], { type: 'application/pdf' });
        }

        if (typeof base64String !== 'string') {
            throw new Error(`Invalid input type: expected string or array, got ${typeof base64String}`);
        }

        // 检查是否是 "null" 字符串（可能来自 JSON 序列化）
        if (base64String === 'null' || base64String === 'undefined' || base64String.trim() === '') {
            throw new Error('PDF data is null or empty');
        }

        // 检查是否是逗号分隔的数字字符串（可能来自数组的 toString()）
        // 例如: "37,80,68,70,45,49,46,52,10,37,211,235,233,225,10,4"
        if (/^\d+(\s*,\s*\d+)+$/.test(base64String.trim())) {
            console.warn('PDF data appears to be a comma-separated number string, converting...');
            try {
                const numbers = base64String.split(',').map(n => parseInt(n.trim(), 10));
                const byteArray = new Uint8Array(numbers);
                
                // 验证 PDF 文件头
                if (byteArray.length < 4) {
                    throw new Error(`PDF data too short (${byteArray.length} bytes)`);
                }
                
                const pdfHeader = String.fromCharCode(...byteArray.slice(0, 4));
                if (pdfHeader !== '%PDF') {
                    throw new Error(`Invalid PDF header: "${pdfHeader}"`);
                }
                
                console.log('Successfully converted number array to PDF', {
                    size: byteArray.length,
                    sizeKB: (byteArray.length / 1024).toFixed(2),
                    header: pdfHeader
                });
                
                return new Blob([byteArray], { type: 'application/pdf' });
            } catch (convertError) {
                throw new Error(`Failed to convert number array: ${convertError instanceof Error ? convertError.message : 'Unknown error'}`);
            }
        }

        // 移除可能的 data URL 前缀
        let cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');

        // 移除所有空白字符（空格、换行符、制表符等）
        cleanBase64 = cleanBase64.replace(/\s/g, '');

        // 检查最小长度（PDF 文件至少需要几百字节）
        if (cleanBase64.length < 100) {
            throw new Error(`PDF data too short (${cleanBase64.length} chars), likely invalid`);
        }

        // 检查并移除无效字符（在验证之前）
        const invalidChars = cleanBase64.match(/[^A-Za-z0-9+/=]/);
        if (invalidChars) {
            console.warn('Found invalid characters in base64, attempting to clean...', {
                invalidCharCount: invalidChars.length,
                sample: invalidChars.slice(0, 10).join('')
            });
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
        let byteCharacters: string;
        try {
            byteCharacters = atob(cleanBase64);
        } catch (decodeError) {
            throw new Error(`Base64 decoding failed: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`);
        }

        if (byteCharacters.length === 0) {
            throw new Error('Decoded PDF data is empty');
        }

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // 验证 PDF 文件头（前 4 个字节应该是 %PDF）
        if (byteArray.length < 4) {
            throw new Error(`PDF data too short (${byteArray.length} bytes), minimum 4 bytes required`);
        }

        const pdfHeader = new Uint8Array(byteArray.slice(0, 4));
        const pdfHeaderString = String.fromCharCode(...pdfHeader);
        
        if (pdfHeaderString !== '%PDF') {
            // 显示实际的文件头以便调试
            const headerHex = Array.from(pdfHeader)
                .map(b => b.toString(16).padStart(2, '0'))
                .join(' ');
            const headerChars = Array.from(pdfHeader)
                .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')
                .join('');
            
            console.error('Invalid PDF header:', {
                expected: '%PDF',
                actual: pdfHeaderString,
                hex: headerHex,
                chars: headerChars,
                firstBytes: Array.from(byteArray.slice(0, 20))
            });
            
            throw new Error(`Invalid PDF file: file header "${pdfHeaderString}" does not match PDF format "%PDF"`);
        }

        console.log('PDF file validated successfully', {
            size: byteArray.length,
            sizeKB: (byteArray.length / 1024).toFixed(2),
            header: pdfHeaderString
        });

        return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
        console.error('Failed to decode base64 PDF:', {
            error: error instanceof Error ? error.message : String(error),
            inputType: typeof base64String,
            inputLength: base64String?.length,
            inputPreview: base64String?.substring(0, 50)
        });
        throw new Error(`PDF 解码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
};

const ReportSection: React.FC<Props> = ({ report, userEmail, progress = 0 }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = React.useState(false);

    const handleDownload = async () => {
        if (!report.pdf_base64) {
            console.error('No PDF data available', {
                hasPdfBase64: !!report.pdf_base64,
                pdfBase64Type: typeof report.pdf_base64,
                pdfBase64Value: report.pdf_base64
            });
            alert('PDF 数据不可用，报告可能仍在生成中，请稍后重试');
            return;
        }

        setDownloading(true);
        try {
            const blob = decodeBase64PDF(report.pdf_base64);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FengShui_Report_${userEmail}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('PDF downloaded successfully');
        } catch (e) {
            console.error('Download failed', e);
            const errorMessage = e instanceof Error ? e.message : '未知错误';
            alert(`PDF 下载失败: ${errorMessage}\n\n如果问题持续存在，请联系客服。`);
        } finally {
            setDownloading(false);
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
