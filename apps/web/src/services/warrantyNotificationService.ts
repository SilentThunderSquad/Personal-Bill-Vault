import { supabase } from './supabase';
import type { Bill } from '@/types';

export interface WarrantyAlert {
  bill: Bill;
  daysUntilExpiry: number;
  alertType: 'warning_30' | 'warning_7' | 'critical_1' | 'expired';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class WarrantyNotificationService {
  /**
   * Check for bills with expiring warranties and generate notifications
   */
  static async checkWarrantyExpiries(userId: string): Promise<WarrantyAlert[]> {
    try {
      // Get user's notification settings
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!settings) {
        console.log('No notification settings found for user');
        return [];
      }

      // Get all bills with warranties for this user
      const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .eq('has_warranty', true)
        .order('warranty_expiry', { ascending: true });

      if (error) {
        throw error;
      }

      if (!bills || bills.length === 0) {
        return [];
      }

      const alerts: WarrantyAlert[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const bill of bills) {
        const expiryDate = new Date(bill.warranty_expiry);
        expiryDate.setHours(0, 0, 0, 0);

        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Determine alert type based on days until expiry and user settings
        let alertType: WarrantyAlert['alertType'] | null = null;
        let urgencyLevel: WarrantyAlert['urgencyLevel'] = 'low';

        if (daysUntilExpiry < 0) {
          alertType = 'expired';
          urgencyLevel = 'critical';
        } else if (daysUntilExpiry <= 1 && settings.notify_1_day) {
          alertType = 'critical_1';
          urgencyLevel = 'critical';
        } else if (daysUntilExpiry <= 7 && settings.notify_7_days) {
          alertType = 'warning_7';
          urgencyLevel = 'high';
        } else if (daysUntilExpiry <= 30 && settings.notify_30_days) {
          alertType = 'warning_30';
          urgencyLevel = 'medium';
        }

        if (alertType) {
          alerts.push({
            bill,
            daysUntilExpiry,
            alertType,
            urgencyLevel
          });
        }
      }

      return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    } catch (error) {
      console.error('Error checking warranty expiries:', error);
      throw error;
    }
  }

  /**
   * Generate notification messages for warranty alerts
   */
  static generateNotificationMessage(alert: WarrantyAlert): string {
    const { bill, daysUntilExpiry, alertType } = alert;
    const productName = bill.product_name || 'Product';

    switch (alertType) {
      case 'expired':
        return `⚠️ Warranty expired for ${productName}. Consider extending or replacing.`;
      case 'critical_1':
        return `🚨 URGENT: ${productName} warranty expires tomorrow!`;
      case 'warning_7':
        return `⏰ ${productName} warranty expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`;
      case 'warning_30':
        return `📅 ${productName} warranty expires in ${daysUntilExpiry} days`;
      default:
        return `Warranty notification for ${productName}`;
    }
  }

  /**
   * Create notification in database if it doesn't already exist
   */
  static async createNotification(
    userId: string,
    billId: string,
    alertType: WarrantyAlert['alertType'],
    message: string
  ): Promise<boolean> {
    try {
      // Check if we already have a notification for this bill and alert type today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('bill_id', billId)
        .eq('type', `warranty_${alertType}`)
        .gte('created_at', today.toISOString())
        .single();

      // Skip if notification already exists today
      if (existingNotification) {
        return false;
      }

      // Create new notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          bill_id: billId,
          type: `warranty_${alertType}`,
          message,
          is_read: false,
          sent_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Process all warranty alerts for a user and create notifications
   */
  static async processWarrantyAlerts(userId: string): Promise<{
    alertsProcessed: number;
    notificationsCreated: number;
  }> {
    try {
      const alerts = await this.checkWarrantyExpiries(userId);
      let notificationsCreated = 0;

      for (const alert of alerts) {
        const message = this.generateNotificationMessage(alert);
        const created = await this.createNotification(
          userId,
          alert.bill.id,
          alert.alertType,
          message
        );

        if (created) {
          notificationsCreated++;
        }
      }

      return {
        alertsProcessed: alerts.length,
        notificationsCreated
      };
    } catch (error) {
      console.error('Error processing warranty alerts:', error);
      return {
        alertsProcessed: 0,
        notificationsCreated: 0
      };
    }
  }

  /**
   * Get warranty summary for dashboard
   */
  static async getWarrantySummary(userId: string): Promise<{
    expiredCount: number;
    criticalCount: number; // expires within 1 day
    warningCount: number; // expires within 7 days
    upcomingCount: number; // expires within 30 days
  }> {
    try {
      const alerts = await this.checkWarrantyExpiries(userId);

      let expiredCount = 0;
      let criticalCount = 0;
      let warningCount = 0;
      let upcomingCount = 0;

      for (const alert of alerts) {
        switch (alert.alertType) {
          case 'expired':
            expiredCount++;
            break;
          case 'critical_1':
            criticalCount++;
            break;
          case 'warning_7':
            warningCount++;
            break;
          case 'warning_30':
            upcomingCount++;
            break;
        }
      }

      return {
        expiredCount,
        criticalCount,
        warningCount,
        upcomingCount
      };
    } catch (error) {
      console.error('Error getting warranty summary:', error);
      return {
        expiredCount: 0,
        criticalCount: 0,
        warningCount: 0,
        upcomingCount: 0
      };
    }
  }
}

export default WarrantyNotificationService;