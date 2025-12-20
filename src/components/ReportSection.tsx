import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Download } from 'lucide-react';
import type { FullReportResponse } from '../types/dify';

type Props = {
    report: FullReportResponse;
    userEmail: string;
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

const ReportSection: React.FC<Props> = ({ report, userEmail }) => {
    const { t } = useTranslation();
    const [downloading, setDownloading] = React.useState(false);

    const handleDownload = async () => {
        if (!report.pdf_base64) {
            console.error('No PDF data available');
            return;
        }

        setDownloading(true);
        try {
            // Convert base64 to blob using helper function
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

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t('consultation.reportReady')}
            </h2>

            {/* Markdown Content Preview */}
            <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: report.report_content }} />
            </div>

            {/* Download Button */}
            {report.pdf_base64 && (
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('consultation.processing')}
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            {t('consultation.downloadReport')}
                        </>
                    )}
                </button>
            )}
        </section>
    );
};

export default ReportSection;
