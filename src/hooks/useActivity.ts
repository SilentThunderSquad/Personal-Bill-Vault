import { useState, useEffect, useCallback } from 'react';
import { activityTracker, ActivityHelpers } from '@/services/activityTracker';
import type { UserActivity, ActivityLogEntry } from '@/types';

export function useActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = useCallback(async (limit = 10) => {
    setLoading(true);
    try {
      const data = await activityTracker.getRecentActivities(limit);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logActivity = useCallback(async (entry: ActivityLogEntry) => {
    try {
      await activityTracker.logActivity(entry);
      // Refresh activities after logging
      await loadActivities();
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [loadActivities]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    loading,
    loadActivities,
    logActivity,
    helpers: ActivityHelpers,
  };
}