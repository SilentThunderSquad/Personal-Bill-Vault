import Tesseract from 'tesseract.js';
import type { OcrResult } from '@/lib/types';
import { parseOcrText } from './index';

/**
 * Tesseract.js OCR provider — runs entirely client-side with no API key.
 */
export async function extractWithTesseract(
    imageFile: File,
    onProgress?: (progress: number) => void
): Promise<OcrResult> {
    try {
        const result = await Tesseract.recognize(imageFile, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text' && onProgress) {
                    onProgress(Math.round(m.progress * 100));
                }
            },
        });

        const rawText = result.data.text;
        const confidence = result.data.confidence;

        return parseOcrText(rawText, confidence);
    } catch (error) {
        console.error('OCR Error:', error);
        return {
            raw_text: '',
            confidence: 0,
        };
    }
}
