import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Download } from 'lucide-react';
import type { FullReportResponse } from '../types/dify';

type Props = {
    report: FullReportResponse;
    userEmail: string;
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
            // Convert base64 to blob
            const byteCharacters = atob(report.pdf_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FengShui_Report_${userEmail}_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Download failed', e);
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
