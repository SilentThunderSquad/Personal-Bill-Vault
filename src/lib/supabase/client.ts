import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Default anonymous client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Supabase client with the Clerk JWT in the headers.
 * This ensures that RLS policies using 'request.jwt.claims' work correctly.
 */
export function createSupabaseClient(clerkToken?: string | null) {
    if (!clerkToken) return supabase;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${clerkToken}`,
            },
        },
    });
}
