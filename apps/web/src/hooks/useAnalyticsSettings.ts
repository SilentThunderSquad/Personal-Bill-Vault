import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

export function useAnalyticsSettings() {
  const { user } = useAuth();
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('notification_settings')
        .select('analytics_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Analytics settings error:', error.message);
        // Default to enabled if no settings found or column doesn't exist
        setAnalyticsEnabled(true);
      } else {
        const enabled = data?.analytics_enabled ?? true;
        console.log('Analytics enabled from DB:', enabled);
        setAnalyticsEnabled(enabled);
      }

      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  return { analyticsEnabled, loading };
}