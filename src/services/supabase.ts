import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '⚠️ Missing Supabase environment variables!\n' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
      'In Vercel: Settings → Environment Variables'
    );
    // Return a mock client that throws helpful errors
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({
              data: { user: null, session: null },
              error: { message: 'Supabase not configured. Please add environment variables in Vercel dashboard.', status: 500 }
            }),
            signUp: () => Promise.resolve({
              data: { user: null, session: null },
              error: { message: 'Supabase not configured. Please add environment variables in Vercel dashboard.', status: 500 }
            }),
            signOut: () => Promise.resolve({ error: null }),
            resetPasswordForEmail: () => Promise.resolve({
              data: {},
              error: { message: 'Supabase not configured. Please add environment variables in Vercel dashboard.', status: 500 }
            }),
          };
        }
        if (prop === 'from' || prop === 'storage') {
          return () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
            insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
            delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
          });
        }
        return () => {};
      }
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
