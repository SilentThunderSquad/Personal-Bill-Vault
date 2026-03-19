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

// Comprehensive Vite ecosystem type declarations
declare module 'vite' {
  import { InlineConfig, UserConfig } from 'vite/types';

  export interface ViteDevServer {
    listen: (port?: number) => Promise<any>;
    close: () => Promise<void>;
  }

  export interface Plugin {
    name: string;
    [key: string]: any;
  }

  export function defineConfig(config: UserConfig | (() => UserConfig) | (() => Promise<UserConfig>)): UserConfig;
  export function createServer(config?: InlineConfig): Promise<ViteDevServer>;
  export function build(config?: InlineConfig): Promise<void>;
  export function preview(config?: InlineConfig): Promise<ViteDevServer>;

  // Re-export common types for compatibility
  export interface UserConfig {
    base?: string;
    mode?: string;
    define?: Record<string, any>;
    plugins?: Plugin[];
    resolve?: {
      alias?: Record<string, string> | Array<{ find: string | RegExp; replacement: string }>;
      dedupe?: string[];
      conditions?: string[];
      mainFields?: string[];
      extensions?: string[];
    };
    build?: {
      target?: string | string[];
      outDir?: string;
      assetsDir?: string;
      assetsInlineLimit?: number;
      cssCodeSplit?: boolean;
      sourcemap?: boolean | 'inline' | 'hidden';
      rollupOptions?: any;
      chunkSizeWarningLimit?: number;
      minify?: boolean | 'terser' | 'esbuild';
    };
    server?: {
      host?: string | boolean;
      port?: number;
      strictPort?: boolean;
      https?: boolean;
      open?: boolean | string;
      proxy?: Record<string, string | any>;
      cors?: boolean | any;
    };
    preview?: {
      host?: string | boolean;
      port?: number;
      strictPort?: boolean;
      https?: boolean;
      open?: boolean | string;
      proxy?: Record<string, string | any>;
      cors?: boolean | any;
    };
    [key: string]: any;
  }
}

declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite';

  export interface ReactOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    jsxImportSource?: string;
    jsxRuntime?: 'classic' | 'automatic';
    babel?: {
      configFile?: string | boolean;
      babelrc?: boolean;
      plugins?: any[];
      presets?: any[];
      parserOpts?: any;
      generatorOpts?: any;
    };
    fastRefresh?: boolean;
  }

  function react(options?: ReactOptions): Plugin;
  export default react;
  export { react };
}

declare module '@tailwindcss/vite' {
  import type { Plugin } from 'vite';

  export interface TailwindViteOptions {
    config?: string | {
      theme?: any;
      plugins?: any[];
      content?: string[];
      darkMode?: 'media' | 'class' | ['class', string];
      [key: string]: any;
    };
    autoprefixer?: boolean | {
      overrideBrowserslist?: string[];
      grid?: boolean | 'autoplace' | 'no-autoplace';
      [key: string]: any;
    };
  }

  function tailwindcss(options?: TailwindViteOptions): Plugin;
  export default tailwindcss;
  export { tailwindcss };
}

declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';

  export interface VitePWAOptions {
    registerType?: 'prompt' | 'autoUpdate' | 'skipWaiting';
    includeAssets?: string[];
    manifest?: {
      id?: string;
      name?: string;
      short_name?: string;
      description?: string;
      theme_color?: string;
      background_color?: string;
      display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
      orientation?: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary';
      scope?: string;
      start_url?: string;
      icons?: Array<{
        src: string;
        sizes: string;
        type: string;
        purpose?: 'any' | 'maskable' | 'monochrome';
      }>;
      categories?: string[];
      shortcuts?: Array<{
        name: string;
        short_name?: string;
        description?: string;
        url: string;
        icons?: Array<{
          src: string;
          sizes: string;
        }>;
      }>;
      [key: string]: any;
    };
    workbox?: {
      globPatterns?: string[];
      navigateFallback?: string;
      navigateFallbackDenylist?: RegExp[];
      skipWaiting?: boolean;
      clientsClaim?: boolean;
      runtimeCaching?: Array<{
        urlPattern: RegExp | string;
        handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';
        options?: {
          cacheName?: string;
          networkTimeoutSeconds?: number;
          expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
          };
          cacheableResponse?: {
            statuses: number[];
          };
        };
      }>;
      cleanupOutdatedCaches?: boolean;
      [key: string]: any;
    };
    devOptions?: {
      enabled?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export function VitePWA(options?: VitePWAOptions): Plugin;
  export { VitePWAOptions };
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
