/// <reference types="vite/client" />

// PWA virtual module types
declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

// Chart library type declarations for Vercel compatibility
declare module 'recharts' {
  import type { ComponentProps, ReactElement } from 'react';

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

  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Cell: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
}

// PDF.js type declarations
declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;

  export interface TextItem {
    str: string;
    transform: number[];
    width: number;
    height: number;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFSource {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(data: ArrayBuffer | Uint8Array | string): PDFSource;
}

// Tesseract.js type declarations
declare module 'tesseract.js' {
  export interface LoggerMessage {
    status: string;
    progress: number;
  }

  export interface RecognizeOptions {
    logger?: (m: LoggerMessage) => void;
  }

  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
    };
  }

  export function recognize(
    image: File | string | HTMLImageElement | HTMLCanvasElement | ImageData,
    language: string,
    options?: RecognizeOptions
  ): Promise<RecognizeResult>;
}

// Global type augmentations
declare global {
  interface Window {
    // Add any global variables if needed
  }
}
