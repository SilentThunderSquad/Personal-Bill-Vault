/**
 * Background Warranty Monitoring Service
 * Handles automatic warranty checking and notification creation
 */

import { WarrantyNotificationService } from './warrantyNotificationService';
import { pwaNotificationService, PWANotificationService } from './pwaNotificationService';

export interface BackgroundSyncOptions {
  userId: string;
  force?: boolean;
  silent?: boolean;
}

export interface BackgroundSyncResult {
  success: boolean;
  alertsChecked: number;
  notificationsCreated: number;
  notificationsSent: number;
  error?: string;
  timestamp: string;
}

export class WarrantyBackgroundService {
  private static instance: WarrantyBackgroundService;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private lastCheck: Date | null = null;

  // Default check interval: every 2 hours (in milliseconds)
  private readonly CHECK_INTERVAL = 2 * 60 * 60 * 1000;

  // Minimum time between checks: 30 minutes
  private readonly MIN_CHECK_INTERVAL = 30 * 60 * 1000;

  private constructor() {}

  static getInstance(): WarrantyBackgroundService {
    if (!WarrantyBackgroundService.instance) {
      WarrantyBackgroundService.instance = new WarrantyBackgroundService();
    }
    return WarrantyBackgroundService.instance;
  }

  /**
   * Start automatic warranty checking service
   */
  start(userId: string): void {
    if (this.isRunning) {
      console.log('Warranty background service is already running');
      return;
    }

    console.log('Starting warranty background service');
    this.isRunning = true;

    // Initial check after a short delay
    setTimeout(() => {
      this.performCheck({ userId, silent: true });
    }, 5000); // 5 seconds after start

    // Set up recurring checks
    this.intervalId = window.setInterval(() => {
      this.performCheck({ userId, silent: true });
    }, this.CHECK_INTERVAL);

    // Register for background sync if available
    this.registerBackgroundSync();
  }

  /**
   * Stop the background service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping warranty background service');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if service is currently running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get last check timestamp
   */
  getLastCheckTime(): Date | null {
    return this.lastCheck;
  }

  /**
   * Perform warranty check and notification processing
   */
  async performCheck(options: BackgroundSyncOptions): Promise<BackgroundSyncResult> {
    const { userId, force = false, silent = false } = options;
    const startTime = new Date();

    try {
      // Check if we should skip this check
      if (!force && this.shouldSkipCheck()) {
        return {
          success: true,
          alertsChecked: 0,
          notificationsCreated: 0,
          notificationsSent: 0,
          timestamp: startTime.toISOString(),
          error: 'Skipped - too soon since last check'
        };
      }

      if (!silent) {
        console.log('🔍 Running warranty background check...');
      }

      // Get warranty alerts
      const alerts = await WarrantyNotificationService.checkWarrantyExpiries(userId);

      // Process notifications (create in database)
      const processResult = await WarrantyNotificationService.processWarrantyAlerts(userId);

      let notificationsSent = 0;

      // Send PWA notifications for critical alerts only
      if (pwaNotificationService.isAvailable()) {
        const criticalAlerts = alerts.filter(alert =>
          alert.urgencyLevel === 'critical' &&
          alert.daysUntilExpiry <= 1
        );

        for (const alert of criticalAlerts) {
          try {
            const payload = PWANotificationService.createWarrantyNotificationPayload(
              alert.bill.product_name || 'Product',
              alert.daysUntilExpiry,
              alert.bill.id,
              alert.alertType
            );

            await pwaNotificationService.showNotification(payload);
            notificationsSent++;
          } catch (error) {
            console.error('Failed to send PWA notification:', error);
          }
        }
      }

      this.lastCheck = startTime;

      // Store last check in localStorage
      try {
        localStorage.setItem('warranty_last_check', startTime.toISOString());
        localStorage.setItem('warranty_last_result', JSON.stringify({
          alertsChecked: alerts.length,
          notificationsCreated: processResult.notificationsCreated,
          notificationsSent
        }));
      } catch (error) {
        // Ignore localStorage errors
      }

      if (!silent) {
        console.log('✅ Warranty check completed:', {
          alertsChecked: alerts.length,
          notificationsCreated: processResult.notificationsCreated,
          notificationsSent
        });
      }

      return {
        success: true,
        alertsChecked: alerts.length,
        notificationsCreated: processResult.notificationsCreated,
        notificationsSent,
        timestamp: startTime.toISOString()
      };

    } catch (error) {
      console.error('❌ Warranty background check failed:', error);

      return {
        success: false,
        alertsChecked: 0,
        notificationsCreated: 0,
        notificationsSent: 0,
        timestamp: startTime.toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if we should skip this check (to avoid too frequent checks)
   */
  private shouldSkipCheck(): boolean {
    if (!this.lastCheck) {
      return false;
    }

    const timeSinceLastCheck = Date.now() - this.lastCheck.getTime();
    return timeSinceLastCheck < this.MIN_CHECK_INTERVAL;
  }

  /**
   * Register for background sync if available
   */
  private async registerBackgroundSync(): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('warranty-check');
        console.log('✅ Background sync registered for warranty checking');
      }
    } catch (error) {
      console.log('Background sync not available or failed to register:', error);
    }
  }

  /**
   * Force an immediate check
   */
  async forceCheck(userId: string): Promise<BackgroundSyncResult> {
    return this.performCheck({ userId, force: true, silent: false });
  }

  /**
   * Get service status and statistics
   */
  getServiceStatus(): {
    isRunning: boolean;
    lastCheck: string | null;
    nextCheck: string | null;
    intervalMinutes: number;
  } {
    let nextCheck: string | null = null;

    if (this.isRunning && this.lastCheck) {
      const nextCheckTime = new Date(this.lastCheck.getTime() + this.CHECK_INTERVAL);
      nextCheck = nextCheckTime.toISOString();
    }

    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck?.toISOString() || null,
      nextCheck,
      intervalMinutes: this.CHECK_INTERVAL / (60 * 1000)
    };
  }

  /**
   * Get last check result from localStorage
   */
  getLastCheckResult(): {
    timestamp: string | null;
    result: any;
  } {
    try {
      const timestamp = localStorage.getItem('warranty_last_check');
      const result = localStorage.getItem('warranty_last_result');

      return {
        timestamp,
        result: result ? JSON.parse(result) : null
      };
    } catch (error) {
      return {
        timestamp: null,
        result: null
      };
    }
  }

  /**
   * Initialize service from localStorage if it was previously running
   */
  initializeFromStorage(userId: string): void {
    try {
      const lastCheck = localStorage.getItem('warranty_last_check');
      if (lastCheck) {
        this.lastCheck = new Date(lastCheck);
      }

      // Auto-start if user was previously using the service
      const wasRunning = localStorage.getItem('warranty_service_running');
      if (wasRunning === 'true') {
        this.start(userId);
      }
    } catch (error) {
      console.error('Failed to initialize warranty service from storage:', error);
    }
  }

  /**
   * Save service state to localStorage
   */
  private saveServiceState(): void {
    try {
      localStorage.setItem('warranty_service_running', this.isRunning.toString());
    } catch (error) {
      // Ignore localStorage errors
    }
  }
}

// Export singleton instance
export const warrantyBackgroundService = WarrantyBackgroundService.getInstance();

// Auto-initialize on window load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Will be initialized when user authentication is available
    console.log('Warranty background service available');
  });

  // Save service state when page is unloaded
  window.addEventListener('beforeunload', () => {
    warrantyBackgroundService['saveServiceState']();
  });
}