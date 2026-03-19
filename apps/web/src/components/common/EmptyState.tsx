import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center px-4">
      <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mb-4 sm:mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-accent hover:bg-accent/90 h-10 sm:h-11 text-sm sm:text-base">{actionLabel}</Button>
      )}
    </div>
  );
}
