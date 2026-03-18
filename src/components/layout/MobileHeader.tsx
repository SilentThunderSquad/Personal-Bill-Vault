import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/common/NotificationBell';
import { cn } from '@/lib/utils';

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/bills': 'My Bills',
  '/bills/new': 'Add Bill',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
};

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current page title
  const getTitle = () => {
    // Exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    // Check for bill detail page
    if (location.pathname.match(/^\/bills\/[^/]+$/)) {
      return 'Bill Details';
    }
    return 'Bill Vault';
  };

  // Determine if we should show back button
  const showBackButton = () => {
    const noBackPages = ['/dashboard', '/bills', '/settings', '/notifications'];
    return !noBackPages.includes(location.pathname);
  };

  // Check if we're on a main tab (no header needed for bottom nav pages)
  const isMainTab = ['/dashboard', '/bills', '/settings'].includes(location.pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border',
        'h-14 flex items-center justify-between px-4',
        'safe-area-top',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBackButton() ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 shrink-0 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <h1 className="text-lg font-semibold text-foreground truncate">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isMainTab && <NotificationBell />}
      </div>
    </header>
  );
}
