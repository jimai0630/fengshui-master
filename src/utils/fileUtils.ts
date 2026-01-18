/**
 * File utility functions for calculating file hashes
 */
import SparkMD5 from 'spark-md5';

/**
 * Calculate MD5 hash of a file using SparkMD5
 * @param file - The file to calculate MD5 for
 * @returns Promise<string> - The MD5 hash in hexadecimal format
 */
export async function calculateFileMD5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const spark = new SparkMD5.ArrayBuffer();
        const chunkSize = 2097152; // 2MB chunks
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        reader.onload = (e) => {
            if (e.target?.result) {
                spark.append(e.target.result as ArrayBuffer);
                currentChunk++;

                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    const md5 = spark.end();
                    resolve(md5);
                }
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file for MD5 calculation'));
        };

        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            reader.readAsArrayBuffer(file.slice(start, end));
        }

        loadNext();
    });
}

/**
 * Calculate MD5 hash for multiple files
 * @param files - Array of files to calculate MD5 for
 * @returns Promise<string> - Combined MD5 hash (sorted and joined with '|')
 */
export async function calculateFilesMD5(files: File[]): Promise<string> {
    const md5s = await Promise.all(
        files.map(file => calculateFileMD5(file))
    );
    return md5s.sort().join('|');
}
