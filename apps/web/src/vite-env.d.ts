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
  export interface UserConfig {
    base?: string;
    mode?: string;
    define?: Record<string, any>;
    plugins?: any[];
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
    [key: string]: any;
  }

  export function defineConfig(config: UserConfig | (() => UserConfig) | (() => Promise<UserConfig>)): UserConfig;
  export function createServer(config?: any): Promise<any>;
  export function build(config?: any): Promise<void>;
}

declare module '@vitejs/plugin-react' {
  export interface ReactOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    jsxImportSource?: string;
    jsxRuntime?: 'classic' | 'automatic';
    babel?: any;
    fastRefresh?: boolean;
  }

  function react(options?: ReactOptions): any;
  export default react;
  export { react };
}

declare module '@tailwindcss/vite' {
  export interface TailwindViteOptions {
    config?: string | any;
    autoprefixer?: boolean | any;
  }

  function tailwindcss(options?: TailwindViteOptions): any;
  export default tailwindcss;
  export { tailwindcss };
}

declare module 'vite-plugin-pwa' {
  export interface VitePWAOptions {
    registerType?: 'prompt' | 'autoUpdate' | 'skipWaiting';
    includeAssets?: string[];
    manifest?: any;
    workbox?: any;
    devOptions?: any;
    [key: string]: any;
  }

  export function VitePWA(options?: VitePWAOptions): any;
  export { VitePWAOptions };
}
