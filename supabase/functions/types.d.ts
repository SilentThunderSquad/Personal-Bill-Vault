/// <reference types="https://deno.land/x/deno@v1.37.0/types.d.ts" />

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export {};