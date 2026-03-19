import { supabase } from '@/services/supabase';
import type { ActivityLogEntry, UserActivity, ActivityType } from '@/types';

/**
 * Activity tracking service for logging user actions
 */
class ActivityTracker {
  private static instance: ActivityTracker;

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  /**
   * Log an activity for the current user
   */
  async logActivity(entry: ActivityLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: entry.type,
          activity_title: entry.title,
          activity_description: entry.description || null,
          related_entity_id: entry.entityId || null,
          related_entity_type: entry.entityType || null,
          metadata: entry.metadata || {}
        });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Fail silently - activity logging shouldn't break the app
    }
  }

  /**
   * Get recent activities for user
   */
  async getRecentActivities(limit = 10): Promise<UserActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }
}

/**
 * Helper functions for creating activity entries
 */
export const ActivityHelpers = {
  billAdded: (billId: string, productName: string): ActivityLogEntry => ({
    type: 'bill_added',
    title: 'Bill Added',
    description: `Added bill for ${productName}`,
    entityId: billId,
    entityType: 'bill',
    metadata: { product_name: productName }
  }),

  billUpdated: (billId: string, productName: string): ActivityLogEntry => ({
    type: 'bill_updated',
    title: 'Bill Updated',
    description: `Updated bill for ${productName}`,
    entityId: billId,
    entityType: 'bill',
    metadata: { product_name: productName }
  }),

  billDeleted: (productName: string): ActivityLogEntry => ({
    type: 'bill_deleted',
    title: 'Bill Deleted',
    description: `Deleted bill for ${productName}`,
    entityType: 'bill',
    metadata: { product_name: productName }
  }),

  profileUpdated: (profileId: string): ActivityLogEntry => ({
    type: 'profile_updated',
    title: 'Profile Updated',
    description: 'Updated profile information',
    entityId: profileId,
    entityType: 'profile'
  }),

  settingsUpdated: (): ActivityLogEntry => ({
    type: 'settings_updated',
    title: 'Settings Updated',
    description: 'Updated account settings'
  }),

  warrantyExpired: (billId: string, productName: string): ActivityLogEntry => ({
    type: 'warranty_expired',
    title: 'Warranty Expired',
    description: `Warranty expired for ${productName}`,
    entityId: billId,
    entityType: 'bill',
    metadata: { product_name: productName }
  })
};

/**
 * Get activity icon and color based on type
 */
export function getActivityIcon(type: ActivityType): { icon: string; color: string } {
  switch (type) {
    case 'bill_added':
      return { icon: '📄', color: 'text-emerald-500' };
    case 'bill_updated':
      return { icon: '✏️', color: 'text-blue-500' };
    case 'bill_deleted':
      return { icon: '🗑️', color: 'text-red-500' };
    case 'profile_updated':
      return { icon: '👤', color: 'text-purple-500' };
    case 'settings_updated':
      return { icon: '⚙️', color: 'text-gray-500' };
    case 'warranty_expired':
      return { icon: '⏰', color: 'text-amber-500' };
    default:
      return { icon: '📝', color: 'text-gray-500' };
  }
}

/**
 * Format activity timestamp for display
 */
export function formatActivityTime(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return activityTime.toLocaleDateString();
  }
}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance();