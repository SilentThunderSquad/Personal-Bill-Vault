import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCheck, Bell } from 'lucide-react';
import { formatRelativeDate } from '@/utils/formatters';
import type { Notification } from '@/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }: NotificationDropdownProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onMarkAllAsRead}>
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>
      <Separator />
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0 ${
                !notification.is_read ? 'bg-accent/5' : ''
              }`}
              onClick={() => {
                onMarkAsRead(notification.id);
                if (notification.bill_id) onClose();
              }}
            >
              {notification.bill_id ? (
                <Link to={`/bills/${notification.bill_id}`} onClick={onClose}>
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(notification.created_at)}</p>
                </Link>
              ) : (
                <>
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(notification.created_at)}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
