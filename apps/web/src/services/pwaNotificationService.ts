/**
 * PWA Push Notification Service for Warranty Alerts
 * Handles browser push notifications when app is in background
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: {
    billId?: string;
    alertType?: string;
    url?: string;
  };
}

export class PWANotificationService {
  private static instance: PWANotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.permission = Notification.permission;
  }

  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService();
    }
    return PWANotificationService.instance;
  }

  /**
   * Check if browser supports push notifications
   */
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      'PushManager' in window
    );
  }

  /**
   * Check if push notifications are currently available
   */
  isAvailable(): boolean {
    return (
      PWANotificationService.isSupported() &&
      this.permission === 'granted' &&
      'serviceWorker' in navigator
    );
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!PWANotificationService.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Initialize service worker registration
   */
  async initialize(): Promise<void> {
    if (!PWANotificationService.isSupported()) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      // Get or wait for service worker registration
      this.registration = await navigator.serviceWorker.ready;
      console.log('PWA Notification Service initialized');
    } catch (error) {
      console.error('Failed to initialize PWA notification service:', error);
      throw error;
    }
  }

  /**
   * Show local push notification
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Push notifications not available');
      return;
    }

    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-192x192.png',
        tag: payload.tag || 'warranty-alert',
        requireInteraction: payload.requireInteraction || false,
        data: payload.data,
        actions: payload.data?.billId ? [
          {
            action: 'view',
            title: 'View Bill',
            icon: '/icons/icon-192x192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ] : undefined
      } as any);
    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  }

  /**
   * Generate warranty alert notification payload
   */
  static createWarrantyNotificationPayload(
    productName: string,
    daysUntilExpiry: number,
    billId: string,
    alertType: string
  ): PushNotificationPayload {
    let title = '';
    let body = '';
    let requireInteraction = false;

    if (daysUntilExpiry < 0) {
      title = '⚠️ Warranty Expired';
      body = `${productName} warranty has expired. Consider extending or replacing.`;
      requireInteraction = true;
    } else if (daysUntilExpiry <= 1) {
      title = '🚨 Warranty Expires Soon';
      body = `${productName} warranty expires ${daysUntilExpiry === 0 ? 'today' : 'tomorrow'}!`;
      requireInteraction = true;
    } else if (daysUntilExpiry <= 7) {
      title = '⏰ Warranty Alert';
      body = `${productName} warranty expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`;
      requireInteraction = false;
    } else {
      title = '📅 Warranty Reminder';
      body = `${productName} warranty expires in ${daysUntilExpiry} days`;
      requireInteraction = false;
    }

    return {
      title,
      body,
      tag: `warranty-${billId}`,
      requireInteraction,
      data: {
        billId,
        alertType,
        url: `/bills/${billId}`
      }
    };
  }

  /**
   * Setup notification click handler
   */
  setupNotificationHandlers(): void {
    if (!PWANotificationService.isSupported()) {
      return;
    }

    // Listen for notification clicks in the service worker context
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NOTIFICATION_CLICK') {
        const { action, data } = event.data;

        if (action === 'view' && data?.url) {
          // Focus the window and navigate to bill
          window.focus();
          window.location.href = data.url;
        }
      }
    });
  }

  /**
   * Test notification (useful for debugging)
   */
  async testNotification(): Promise<void> {
    const testPayload: PushNotificationPayload = {
      title: '✅ Test Notification',
      body: 'Your warranty notification system is working correctly!',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        alertType: 'test'
      }
    };

    await this.showNotification(testPayload);
  }

  /**
   * Clear all warranty notifications
   */
  async clearWarrantyNotifications(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      const notifications = await this.registration.getNotifications({
        tag: 'warranty-alert'
      });

      notifications.forEach(notification => {
        notification.close();
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

// Export singleton instance
export const pwaNotificationService = PWANotificationService.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  pwaNotificationService.initialize().catch(console.error);
  pwaNotificationService.setupNotificationHandlers();
}