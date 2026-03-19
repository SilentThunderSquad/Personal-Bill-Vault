import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity as ActivityIcon } from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';
import { formatActivityTime, getActivityIcon } from '@/services/activityTracker';
import { cn } from '@/lib/utils';
import type { UserActivity } from '@/types';

export function ActivityDropdown() {
  const navigate = useNavigate();
  const { activities, loading } = useActivity();
  const [isOpen, setIsOpen] = useState(false);

  // Show up to 5 recent activities in dropdown
  const recentActivities = activities.slice(0, 5);

  const handleActivityClick = (activity: UserActivity) => {
    // Navigate to related entity if possible
    if (activity.related_entity_type === 'bill' && activity.related_entity_id) {
      navigate(`/bills/${activity.related_entity_id}`);
    } else if (activity.activity_type === 'profile_updated') {
      navigate('/profile');
    }
    setIsOpen(false);
  };

  const handleViewAllActivities = () => {
    navigate('/profile#activity');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 relative gap-2">
        <ActivityIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Activity</span>
        {recentActivities.length > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
            {recentActivities.length}
          </Badge>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Recent Activity</h3>
            {recentActivities.length > 0 && (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-3 py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
            <p className="text-xs text-muted-foreground mt-2">Loading activities...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <ActivityIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No recent activity</p>
            <p className="text-xs text-muted-foreground">Your actions will appear here</p>
          </div>
        ) : (
          <div className="py-1">
            {recentActivities.map((activity, index) => {
              const { icon, color } = getActivityIcon(activity.activity_type as any);
              const isClickable = activity.related_entity_type === 'bill' || activity.activity_type === 'profile_updated';

              return (
                <div key={activity.id}>
                  <DropdownMenuItem
                    onClick={() => handleActivityClick(activity)}
                    className={cn(
                      "px-3 py-3 cursor-pointer",
                      !isClickable && "cursor-default"
                    )}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={cn('text-base shrink-0 mt-0.5', color)}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.activity_title}
                        </p>
                        {activity.activity_description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {activity.activity_description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatActivityTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {index < recentActivities.length - 1 && (
                    <div className="mx-3 border-b border-border/50" />
                  )}
                </div>
              );
            })}

            {recentActivities.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewAllActivities} className="px-3 py-2 text-center">
                  <span className="text-sm text-accent font-medium">View All Activity</span>
                </DropdownMenuItem>
              </>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}