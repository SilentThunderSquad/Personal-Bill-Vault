import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WarrantyNotificationService } from '@/services/warrantyNotificationService';
import { pwaNotificationService, PWANotificationService } from '@/services/pwaNotificationService';
import type { WarrantyAlert } from '@/services/warrantyNotificationService';

interface UseWarrantyNotificationsReturn {
  alerts: WarrantyAlert[];
  summary: {
    expiredCount: number;
    criticalCount: number;
    warningCount: number;
    upcomingCount: number;
  };
  loading: boolean;
  error: string | null;
  checkWarranties: () => Promise<void>;
  processNotifications: () => Promise<{
    alertsProcessed: number;
    notificationsCreated: number;
  }>;
  requestPushPermission: () => Promise<NotificationPermission>;
  sendTestNotification: () => Promise<void>;
  canUsePushNotifications: boolean;
}

export function useWarrantyNotifications(): UseWarrantyNotificationsReturn {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<WarrantyAlert[]>([]);
  const [summary, setSummary] = useState({
    expiredCount: 0,
    criticalCount: 0,
    warningCount: 0,
    upcomingCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canUsePushNotifications, setCanUsePushNotifications] = useState(false);

  // Check if PWA notifications are available
  useEffect(() => {
    setCanUsePushNotifications(pwaNotificationService.isAvailable());
  }, []);

  const checkWarranties = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setSummary({
        expiredCount: 0,
        criticalCount: 0,
        warningCount: 0,
        upcomingCount: 0
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get warranty alerts
      const warrantyAlerts = await WarrantyNotificationService.checkWarrantyExpiries(user.id);
      setAlerts(warrantyAlerts);

      // Get summary
      const warrantySummary = await WarrantyNotificationService.getWarrantySummary(user.id);
      setSummary(warrantySummary);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check warranties';
      setError(errorMessage);
      console.error('Error checking warranties:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const processNotifications = useCallback(async (): Promise<{
    alertsProcessed: number;
    notificationsCreated: number;
  }> => {
    if (!user) {
      return { alertsProcessed: 0, notificationsCreated: 0 };
    }

    try {
      const result = await WarrantyNotificationService.processWarrantyAlerts(user.id);

      // Send PWA notifications for critical alerts if permission granted
      if (canUsePushNotifications) {
        const criticalAlerts = alerts.filter(alert =>
          alert.urgencyLevel === 'critical' && alert.daysUntilExpiry <= 1
        );

        for (const alert of criticalAlerts) {
          const payload = PWANotificationService.createWarrantyNotificationPayload(
            alert.bill.product_name || 'Product',
            alert.daysUntilExpiry,
            alert.bill.id,
            alert.alertType
          );

          await pwaNotificationService.showNotification(payload);
        }
      }

      return result;
    } catch (err) {
      console.error('Error processing notifications:', err);
      return { alertsProcessed: 0, notificationsCreated: 0 };
    }
  }, [user, alerts, canUsePushNotifications]);

  const requestPushPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const permission = await pwaNotificationService.requestPermission();
      setCanUsePushNotifications(permission === 'granted');
      return permission;
    } catch (err) {
      console.error('Error requesting push permission:', err);
      return 'denied';
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      if (!canUsePushNotifications) {
        throw new Error('Push notifications not available');
      }
      await pwaNotificationService.testNotification();
    } catch (err) {
      console.error('Error sending test notification:', err);
      throw err;
    }
  }, [canUsePushNotifications]);

  // Auto-check warranties when user changes
  useEffect(() => {
    checkWarranties();
  }, [checkWarranties]);

  // Set up periodic warranty checking (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(checkWarranties, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkWarranties]);

  return {
    alerts,
    summary,
    loading,
    error,
    checkWarranties,
    processNotifications,
    requestPushPermission,
    sendTestNotification,
    canUsePushNotifications
  };
}