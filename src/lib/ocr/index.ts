import type { OcrResult } from '@/lib/types';

/**
 * OCR Service abstraction — swap provider by changing the implementation.
 * Currently uses Tesseract.js (client-side, free).
 */
export interface OcrProvider {
    extractText(imageFile: File): Promise<OcrResult>;
}

/**
 * Parse the raw OCR text and extract structured data.
 * This is a best-effort heuristic parser for common invoice/receipt formats.
 */
export function parseOcrText(rawText: string, confidence: number): OcrResult {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    // Try to extract store name (usually first non-empty line)
    const store_name = lines[0] || undefined;

    // Try to extract date (look for common date patterns)
    const datePatterns = [
        /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
        /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
        /Date[:\s]*(.+)/i,
    ];
    let purchase_date: string | undefined;
    for (const line of lines) {
        for (const pattern of datePatterns) {
            const match = line.match(pattern);
            if (match) {
                purchase_date = match[1].trim();
                break;
            }
        }
        if (purchase_date) break;
    }

    // Try to extract amount (look for currency patterns)
    const amountPatterns = [
        /(?:Total|Grand Total|Amount|Net|Payable)[:\s]*[₹$€£]?\s*([\d,]+\.?\d*)/i,
        /[₹$€£]\s*([\d,]+\.?\d*)/,
        /Rs\.?\s*([\d,]+\.?\d*)/i,
        /INR\s*([\d,]+\.?\d*)/i,
    ];
    let amount: string | undefined;
    // Scan from bottom up for total amount (likely near the end)
    for (let i = lines.length - 1; i >= 0; i--) {
        for (const pattern of amountPatterns) {
            const match = lines[i].match(pattern);
            if (match) {
                amount = match[1].replace(/,/g, '');
                break;
            }
        }
        if (amount) break;
    }

    // Try to extract product name
    const productPatterns = [
        /(?:Product|Item|Description|Model)[:\s]*(.+)/i,
    ];
    let product_name: string | undefined;
    for (const line of lines) {
        for (const pattern of productPatterns) {
            const match = line.match(pattern);
            if (match) {
                product_name = match[1].trim();
                break;
            }
        }
        if (product_name) break;
    }

    return {
        store_name,
        purchase_date,
        product_name,
        amount,
        raw_text: rawText,
        confidence,
    };
}
