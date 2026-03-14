import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Bill Vault] Missing Supabase environment variables!\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard.\n' +
    'Then REDEPLOY the project (Vite bakes env vars at build time).'
  );
}

// Always create a real client. If URL/key are empty, the SDK will fail
// with a clear network error that we translate via getFriendlyAuthError.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Translates raw Supabase error messages into user-friendly messages.
 */
export function getFriendlyAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed') || lower.includes('fetch')) {
    if (!isSupabaseConfigured) {
      return 'App is not configured yet. Environment variables are missing. Please contact the developer.';
    }
    return 'Cannot reach the server. Your Supabase project may be paused (free tier pauses after inactivity). Go to supabase.com/dashboard, restore your project, and try again.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }

  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (lower.includes('signup is disabled')) {
    return 'Signups are disabled. Go to Supabase dashboard > Authentication > Providers > Email and enable signups.';
  }

  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  return message;
}
