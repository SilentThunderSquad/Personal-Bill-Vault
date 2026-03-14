import type { OcrResult } from '@/types';

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const Tesseract = await import('tesseract.js');

  const result = await Tesseract.recognize(imageFile, 'eng', {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return parseOcrText(result.data.text, result.data.confidence);
}

export function parseOcrText(rawText: string, confidence: number): OcrResult {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const store_name = lines[0] || undefined;

  // Date extraction
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
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

  // Amount extraction (bottom-up)
  const amountPatterns = [
    /(?:Total|Grand Total|Amount|Net|Payable)[:\s]*[\u20B9$\u20AC\u00A3]?\s*([\d,]+\.?\d*)/i,
    /[\u20B9$\u20AC\u00A3]\s*([\d,]+\.?\d*)/,
    /Rs\.?\s*([\d,]+\.?\d*)/i,
    /INR\s*([\d,]+\.?\d*)/i,
  ];
  let amount: string | undefined;
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

  // Product name
  let product_name: string | undefined;
  const productPatterns = [/(?:Product|Item|Description|Model)[:\s]*(.+)/i];
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

  // Invoice number
  let invoice_number: string | undefined;
  const invoicePatterns = [/(?:Invoice|Bill|Receipt|Ref)\s*(?:No|Number|#)?[.:\s]*([A-Z0-9\-]+)/i];
  for (const line of lines) {
    for (const pattern of invoicePatterns) {
      const match = line.match(pattern);
      if (match) {
        invoice_number = match[1].trim();
        break;
      }
    }
    if (invoice_number) break;
  }

  return { store_name, purchase_date, product_name, amount, invoice_number, raw_text: rawText, confidence };
}
