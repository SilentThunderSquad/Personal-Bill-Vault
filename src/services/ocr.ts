import type { OcrResult } from '@/types';

export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file, onProgress);
  } else if (file.type.startsWith('image/')) {
    return extractTextFromImage(file, onProgress);
  } else {
    throw new Error('Unsupported file type');
  }
}

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

export async function extractTextFromPDF(
  pdfFile: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const pdfjs = await import('pdfjs-dist');

  // Set worker source
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    // Limit to first 5 pages for performance
    const pagesToProcess = Math.min(totalPages, 5);

    for (let i = 1; i <= pagesToProcess; i++) {
      if (onProgress) {
        onProgress(Math.round((i / pagesToProcess) * 100));
      }

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => (item as any).str || '')
        .filter(str => str.length > 0)
        .join(' ');

      fullText += pageText + '\n';
    }

    // Since PDF text extraction is digital, confidence is high
    const confidence = 95;

    return parseOcrText(fullText.trim(), confidence);
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export function parseOcrText(rawText: string, confidence: number): OcrResult {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const store_name = lines[0] || undefined;

  // Vendor name extraction (look for vendor/company patterns)
  let vendor_name: string | undefined;
  const vendorPatterns = [
    /(?:Vendor|Company|Supplier|From)[:\s]*(.+)/i,
    /(?:Billed by|Sold by)[:\s]*(.+)/i,
    /(?:Merchant|Retailer)[:\s]*(.+)/i,
  ];
  for (const line of lines) {
    for (const pattern of vendorPatterns) {
      const match = line.match(pattern);
      if (match) {
        vendor_name = match[1].trim();
        break;
      }
    }
    if (vendor_name) break;
  }

  // If no specific vendor pattern found, use store_name
  if (!vendor_name && store_name) {
    vendor_name = store_name;
  }

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
  const invoicePatterns = [/(?:Invoice|Receipt|Ref)\s*(?:No|Number|#)?[.:\s]*([A-Z0-9\-]+)/i];
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

  // Bill number (separate from invoice number)
  let bill_number: string | undefined;
  const billPatterns = [
    /(?:Bill|Transaction|Order)\s*(?:No|Number|#)?[.:\s]*([A-Z0-9\-]+)/i,
    /(?:TXN|TRN|ORD)\s*(?:No|Number|#)?[.:\s]*([A-Z0-9\-]+)/i,
    /#\s*([A-Z0-9\-]{4,})/i,
  ];
  for (const line of lines) {
    for (const pattern of billPatterns) {
      const match = line.match(pattern);
      if (match && match[1] !== invoice_number) { // Ensure it's different from invoice number
        bill_number = match[1].trim();
        break;
      }
    }
    if (bill_number) break;
  }

  return {
    store_name,
    vendor_name,
    purchase_date,
    product_name,
    amount,
    invoice_number,
    bill_number,
    raw_text: rawText,
    confidence
  };
}
