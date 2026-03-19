import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck,
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldX,
  ShieldCheck
} from 'lucide-react';
import { formatRelativeDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

interface WarrantyNotificationStyle {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

function getWarrantyNotificationStyle(notification: Notification): WarrantyNotificationStyle {
  const type = notification.type.toLowerCase();

  if (type.includes('expired')) {
    return {
      icon: <ShieldX className="h-4 w-4" />,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      badge: { text: 'EXPIRED', variant: 'destructive' },
      urgency: 'critical'
    };
  }

  if (type.includes('critical_1') || type.includes('1_day')) {
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      badge: { text: 'URGENT', variant: 'destructive' },
      urgency: 'critical'
    };
  }

  if (type.includes('warning_7') || type.includes('7_day')) {
    return {
      icon: <Clock className="h-4 w-4" />,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      badge: { text: 'SOON', variant: 'secondary' },
      urgency: 'high'
    };
  }

  if (type.includes('warning_30') || type.includes('30_day')) {
    return {
      icon: <Calendar className="h-4 w-4" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      badge: { text: 'REMINDER', variant: 'outline' },
      urgency: 'medium'
    };
  }

  // Default warranty notification style
  return {
    icon: <ShieldCheck className="h-4 w-4" />,
    bgColor: 'bg-accent/10',
    textColor: 'text-accent',
    badge: { text: 'INFO', variant: 'secondary' },
    urgency: 'low'
  };
}

function isWarrantyNotification(notification: Notification): boolean {
  return notification.type.toLowerCase().includes('warranty');
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onClose
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}) {
  const isWarranty = isWarrantyNotification(notification);
  const warrantyStyle = isWarranty ? getWarrantyNotificationStyle(notification) : null;

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.bill_id) onClose();
  };

  const itemContent = (
    <div className="flex items-start gap-3 w-full">
      {/* Icon */}
      <div className={cn(
        "shrink-0 p-1.5 rounded-full mt-0.5",
        warrantyStyle ? warrantyStyle.bgColor : "bg-muted"
      )}>
        {warrantyStyle ? (
          <span className={warrantyStyle.textColor}>
            {warrantyStyle.icon}
          </span>
        ) : (
          <Bell className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-foreground leading-relaxed">
            {notification.message}
          </p>
          {warrantyStyle?.badge && (
            <Badge
              variant={warrantyStyle.badge.variant as any}
              className="text-xs shrink-0"
            >
              {warrantyStyle.badge.text}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {formatRelativeDate(notification.created_at)}
          </p>
          {!notification.is_read && (
            <div className="w-2 h-2 bg-accent rounded-full shrink-0" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0 transition-colors",
        !notification.is_read && "bg-accent/5",
        warrantyStyle && warrantyStyle.urgency === 'critical' && "border-l-4 border-l-destructive",
        warrantyStyle && warrantyStyle.urgency === 'high' && "border-l-4 border-l-orange-500",
      )}
      onClick={handleClick}
    >
      {notification.bill_id ? (
        <Link to={`/bills/${notification.bill_id}`} onClick={onClose} className="block">
          {itemContent}
        </Link>
      ) : (
        itemContent
      )}
    </div>
  );
}

export function EnhancedNotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const warrantyNotifications = notifications.filter(isWarrantyNotification);
  const criticalWarrantyCount = warrantyNotifications.filter(n => {
    const style = getWarrantyNotificationStyle(n);
    return style.urgency === 'critical';
  }).length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={onMarkAllAsRead}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Critical Warranty Alert Banner */}
      {criticalWarrantyCount > 0 && (
        <div className="mx-4 mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">
              {criticalWarrantyCount} critical warranty {criticalWarrantyCount === 1 ? 'alert' : 'alerts'}
            </span>
          </div>
        </div>
      )}

      <Separator />

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              You'll see warranty alerts and updates here
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with additional actions */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            {warrantyNotifications.length > 0 && (
              <span>
                {warrantyNotifications.length} warranty {warrantyNotifications.length === 1 ? 'alert' : 'alerts'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}