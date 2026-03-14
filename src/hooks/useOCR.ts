import { useState } from 'react';
import { extractTextFromImage } from '@/services/ocr';
import type { OcrResult } from '@/types';

export function useOCR() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File) => {
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const ocrResult = await extractTextFromImage(file, setProgress);
      setResult(ocrResult);
      return ocrResult;
    } catch {
      setError('OCR processing failed. Please enter details manually.');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setProcessing(false);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return { processing, progress, result, error, processImage, reset };
}
