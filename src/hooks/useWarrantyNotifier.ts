import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { Bill } from '@/types';
import { differenceInDays } from 'date-fns';
import { pwaNotificationService, PWANotificationService } from '@/services/pwaNotificationService';
import { WARRANTY_CONFIG } from '@/utils/warrantyConfig';

export function useWarrantyNotifier(bills: Bill[]) {
  const { user } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!user || bills.length === 0 || hasChecked) return;

    let mounted = true;

    const checkWarranties = async () => {
      try {
        setHasChecked(true); // Check only once per session mount

        const now = new Date();
        const alertsNeeded: Array<{ bill: Bill, type: string, message: string }> = [];

        bills.forEach(bill => {
          if (!bill.has_warranty || !bill.warranty_expiry) return;
          
          const daysLeft = differenceInDays(new Date(bill.warranty_expiry), now);
          
          if (daysLeft < 0) {
            alertsNeeded.push({
              bill,
              type: 'warranty_expired',
              message: `Your warranty for ${bill.product_name} has expired by ${Math.abs(daysLeft)} days.`
            });
          } else if (daysLeft <= WARRANTY_CONFIG.EXPIRING_SOON_DAYS) {
            alertsNeeded.push({
              bill,
              type: 'warranty_expiring',
              message: `Warranty for ${bill.product_name} expires in ${daysLeft} days.`
            });
          }
        });

        if (alertsNeeded.length === 0 || !mounted) return;

        // Query existing notifications for these exact parameters
        const billIds = alertsNeeded.map(a => a.bill.id);
        const { data: existingNotifs, error } = await supabase
          .from('notifications')
          .select('bill_id, type')
          .eq('user_id', user.id)
          .in('bill_id', billIds);

        if (error) {
          console.error("Error fetching existing notifications:", error);
          return;
        }

        const newAlerts = alertsNeeded.filter(alert => {
          return !existingNotifs?.some(
            n => n.bill_id === alert.bill.id && n.type === alert.type
          );
        });

        if (newAlerts.length === 0 || !mounted) return;

        // Insert new notifications into DB
        const notificationsToInsert = newAlerts.map(alert => ({
          user_id: user.id,
          bill_id: alert.bill.id,
          type: alert.type,
          message: alert.message,
          is_read: false,
          sent_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notificationsToInsert);

        if (insertError) {
          console.error("Error inserting notifications:", insertError);
          return;
        }

        // Display to user directly via toast and PWA notifications
        newAlerts.forEach(alert => {
          if (!mounted) return;

          const isExpired = alert.type === 'warranty_expired';

          // Show toast notification for immediate feedback
          if (isExpired) {
            toast.error('Warranty Expired', { description: alert.message, duration: WARRANTY_CONFIG.TOAST_DURATION });
          } else {
            toast.warning('Warranty Expiring Soon', { description: alert.message, duration: WARRANTY_CONFIG.TOAST_DURATION });
          }

          // Show PWA notification for background alerts
          if (PWANotificationService.isSupported()) {
            const daysLeft = differenceInDays(new Date(alert.bill.warranty_expiry!), now);
            const pwaPayload = PWANotificationService.createWarrantyNotificationPayload(
              alert.bill.product_name,
              daysLeft,
              alert.bill.id,
              alert.type
            );

            pwaNotificationService.showNotification(pwaPayload).catch(err => {
              console.warn('PWA notification failed:', err);
            });
          }
        });

      } catch (err) {
        console.error("Exception in warranty notifier check:", err);
      }
    };

    checkWarranties();

    return () => {
      mounted = false;
    };
  }, [user, bills, hasChecked]);
}
