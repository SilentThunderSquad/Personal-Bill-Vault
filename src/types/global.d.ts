// Global type declarations for TypeScript

declare module 'recharts' {
  import { ReactElement } from 'react';

  export interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: any;
      payload: any;
      dataKey: string;
      color: string;
    }>;
    label?: string;
  }

  export interface LegendProps {
    payload?: Array<{
      value: string;
      color: string;
      type?: string;
    }>;
  }

  export const PieChart: React.ComponentType<any>;
  export const Pie: React.ComponentType<any>;
  export const Cell: React.ComponentType<any>;
  export const ResponsiveContainer: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const LineChart: React.ComponentType<any>;
  export const Line: React.ComponentType<any>;
  export const XAxis: React.ComponentType<any>;
  export const YAxis: React.ComponentType<any>;
  export const CartesianGrid: React.ComponentType<any>;
}

declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;

  interface PDFPageProxy {
    getTextContent(): Promise<{
      items: Array<{
        str: string;
        transform: number[];
        width: number;
        height: number;
      }>;
    }>;
  }

  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export function getDocument(data: ArrayBuffer | Uint8Array): {
    promise: Promise<PDFDocumentProxy>;
  };
}

declare module 'tesseract.js' {
  interface LoggerMessage {
    status: string;
    progress: number;
  }

  interface RecognizeOptions {
    logger?: (m: LoggerMessage) => void;
  }

  interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
    };
  }

  export function recognize(
    image: File | string | HTMLImageElement | HTMLCanvasElement,
    language: string,
    options?: RecognizeOptions
  ): Promise<RecognizeResult>;
}

// Extend Window interface for any global variables
declare global {
  interface Window {
    // Add any global variables if needed
  }

  // Fix for Node.js process in browser environment
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

export {};