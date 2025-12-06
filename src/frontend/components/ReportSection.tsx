import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Mail, FileText, Loader2 } from 'lucide-react';
import type { FullReportResponse } from '../types/dify';

interface ReportSectionProps {
    report: FullReportResponse;
    userEmail: string;
}

const ReportSection: React.FC<ReportSectionProps> = ({ report, userEmail }) => {
    const { t } = useTranslation();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = () => {
        if (!report.pdf_base64) {
            alert(t('report.noPdfAvailable'));
            return;
        }

        setIsDownloading(true);

        try {
            // Convert base64 to blob
            const byteCharacters = atob(report.pdf_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fengshui-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert(t('report.downloadError'));
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSendEmail = () => {
        // TODO: Implement email sending functionality
        alert(t('report.emailComingSoon'));
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full text-green-800 dark:text-green-300 font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('report.ready')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-800 dark:text-white mb-4">
                        {t('report.title')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t('report.subtitle')}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading || !report.pdf_base64}
                        className="py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('report.downloading')}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                {t('report.downloadPDF')}
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleSendEmail}
                        disabled
                        className="py-4 px-6 bg-white dark:bg-gray-800 border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-amber-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        <Mail className="w-5 h-5" />
                        {t('report.sendEmail')}
                    </button>
                </div>

                {/* Report Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <FileText className="w-8 h-8 text-amber-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {t('report.fullReport')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('report.generatedFor')} {userEmail}
                            </p>
                        </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div
                            className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(report.report_content) }}
                        />
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('report.saveNote')}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Simple markdown formatter (you can use a library like marked or react-markdown for better formatting)
function formatMarkdown(content: string): string {
    return content
        // Headers
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Line breaks
        .replace(/\n\n/g, '</p><p class="mb-4">')
        // Wrap in paragraph
        .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>');
}

export default ReportSection;
