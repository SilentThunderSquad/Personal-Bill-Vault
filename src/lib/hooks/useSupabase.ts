'use client';

import { useSession } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

/**
 * Custom hook to get an authenticated Supabase client using Clerk JWT.
 */
export function useSupabase() {
    const { session } = useSession();

    return useMemo(() => {
        return {
            getClient: async () => {
                if (!session) return createSupabaseClient(null);
                try {
                    const token = await session.getToken({ template: 'supabase' });
                    return createSupabaseClient(token);
                } catch (e) {
                    console.error('Failed to get Supabase token:', e);
                    return createSupabaseClient(null);
                }
            }
        };
    }, [session]);
}
