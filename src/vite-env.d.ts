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

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_VERSION: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Vite types for better compatibility
declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  function react(options?: any): any;
  export default react;
}

declare module '@tailwindcss/vite' {
  function tailwindcss(options?: any): any;
  export default tailwindcss;
}

declare module 'vite-plugin-pwa' {
  export interface VitePWAOptions {
    registerType?: 'prompt' | 'autoUpdate' | 'skipWaiting';
    includeAssets?: string[];
    manifest?: any;
    workbox?: any;
    devOptions?: any;
  }

  export function VitePWA(options?: VitePWAOptions): any;
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

// Node.js path module
declare module 'path' {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export const sep: string;
}

// Global type augmentations
declare global {
  interface Window {
    // Add any global variables if needed
  }

  const __dirname: string;
  const __filename: string;
}

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Asset imports
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
