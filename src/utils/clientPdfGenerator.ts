/**
 * Client-side PDF generation utility
 * Uses jsPDF + html2canvas to generate PDF in browser
 * This bypasses Vercel serverless limitations
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

/**
 * Generate PDF from markdown content on the client side
 * @param markdownContent - The markdown content to convert to PDF
 * @param filename - The output filename
 */
export async function generatePDFFromMarkdownClient(
    markdownContent: string,
    filename: string = 'FengShui_Report.pdf'
): Promise<void> {
    // Convert markdown to HTML
    const htmlContent = await marked.parse(markdownContent);

    // Create a container element
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="pdf-content" style="
            font-family: 'Arial', 'Microsoft YaHei', 'SimSun', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
        ">
            <style>
                #pdf-content h1, #pdf-content h2, #pdf-content h3, #pdf-content h4, #pdf-content h5, #pdf-content h6 {
                    color: #d97706;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                #pdf-content h1 { font-size: 24px; border-bottom: 2px solid #d97706; padding-bottom: 8px; }
                #pdf-content h2 { font-size: 20px; }
                #pdf-content h3 { font-size: 16px; }
                #pdf-content p { margin: 1em 0; }
                #pdf-content ul, #pdf-content ol { margin: 1em 0; padding-left: 2em; }
                #pdf-content li { margin: 0.5em 0; }
                #pdf-content strong { color: #92400e; }
                #pdf-content blockquote {
                    border-left: 4px solid #d97706;
                    padding-left: 1em;
                    margin: 1em 0;
                    color: #666;
                }
                #pdf-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                #pdf-content th, #pdf-content td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                #pdf-content th {
                    background-color: #d97706;
                    color: white;
                }
            </style>
            ${htmlContent}
        </div>
    `;

    // Add to document temporarily (hidden)
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    document.body.appendChild(container);

    try {
        const pdfContent = container.querySelector('#pdf-content') as HTMLElement;

        // Generate canvas from HTML, split into pages
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10; // mm
        const contentWidth = pageWidth - (margin * 2);

        // Create canvas
        const canvas = await html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Calculate how many pages we need
        const contentHeight = pageHeight - (margin * 2);
        const totalPages = Math.ceil(imgHeight / contentHeight);

        // Add content to PDF, splitting across pages
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                pdf.addPage();
            }

            const yOffset = -page * contentHeight;
            pdf.addImage(
                imgData,
                'JPEG',
                margin,
                margin + yOffset,
                imgWidth,
                imgHeight
            );
        }

        // Save the PDF
        pdf.save(filename);

        console.log('[ClientPDF] PDF generated successfully:', {
            pages: totalPages,
            filename
        });
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
}

/**
 * Generate PDF with progress callback
 */
export async function generatePDFWithProgress(
    markdownContent: string,
    filename: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    onProgress?.(10);

    // Parse markdown
    const htmlContent = await marked.parse(markdownContent);
    onProgress?.(30);

    // Create container
    const container = document.createElement('div');
    container.innerHTML = createPDFHtml(htmlContent);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    document.body.appendChild(container);

    onProgress?.(50);

    try {
        const pdfContent = container.querySelector('#pdf-content') as HTMLElement;

        // Generate canvas
        const canvas = await html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        onProgress?.(70);

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - (margin * 2);

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const totalPages = Math.ceil(imgHeight / contentHeight);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        onProgress?.(85);

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage();
            const yOffset = -page * contentHeight;
            pdf.addImage(imgData, 'JPEG', margin, margin + yOffset, imgWidth, imgHeight);
        }

        onProgress?.(95);
        pdf.save(filename);
        onProgress?.(100);

    } finally {
        document.body.removeChild(container);
    }
}

function createPDFHtml(htmlContent: string): string {
    return `
        <div id="pdf-content" style="
            font-family: 'Arial', 'Microsoft YaHei', 'SimSun', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
        ">
            <style>
                #pdf-content h1, #pdf-content h2, #pdf-content h3, #pdf-content h4 {
                    color: #d97706;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                #pdf-content h1 { font-size: 24px; border-bottom: 2px solid #d97706; padding-bottom: 8px; }
                #pdf-content h2 { font-size: 20px; }
                #pdf-content h3 { font-size: 16px; }
                #pdf-content p { margin: 1em 0; }
                #pdf-content ul, #pdf-content ol { margin: 1em 0; padding-left: 2em; }
                #pdf-content li { margin: 0.5em 0; }
                #pdf-content strong { color: #92400e; }
                #pdf-content blockquote {
                    border-left: 4px solid #d97706;
                    padding-left: 1em;
                    margin: 1em 0;
                    color: #666;
                }
                #pdf-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                #pdf-content th, #pdf-content td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                #pdf-content th {
                    background-color: #d97706;
                    color: white;
                }
            </style>
            ${htmlContent}
        </div>
    `;
}
