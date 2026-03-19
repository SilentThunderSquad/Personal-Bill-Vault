import { type MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, File, ZoomIn } from 'lucide-react';
import { detectFileTypeFromUrl, getFileExtensionFromUrl } from '@/utils/fileHelpers';
import { cn } from '@/lib/utils';

interface FileThumbnailProps {
  fileUrl: string | null;
  productName?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FileThumbnail({
  fileUrl,
  productName = 'Bill',
  size = 'md',
  showBadge = true,
  onClick,
  className
}: FileThumbnailProps) {
  const fileType = detectFileTypeFromUrl(fileUrl);
  const extension = getFileExtensionFromUrl(fileUrl);

  if (!fileUrl) return null;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const badgeSize = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const containerClass = cn(
    'relative rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 overflow-hidden group transition-all duration-200',
    onClick && 'cursor-pointer hover:border-accent/50 hover:bg-accent/5',
    sizeClasses[size],
    className
  );

  return (
    <div className={containerClass} onClick={handleClick}>
      {fileType === 'image' ? (
        <>
          <img
            src={fileUrl}
            alt={`${productName} bill`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {onClick && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-4 w-4 text-white" />
            </div>
          )}
        </>
      ) : fileType === 'pdf' ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
          <FileText className={cn(
            'text-muted-foreground mb-1',
            size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
          <span className={cn(
            'text-muted-foreground font-medium',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}>
            PDF
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
          <File className={cn(
            'text-muted-foreground mb-1',
            size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
          <span className={cn(
            'text-muted-foreground font-medium',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}>
            FILE
          </span>
        </div>
      )}

      {showBadge && extension && (
        <Badge
          variant="secondary"
          className={cn(
            'absolute top-1 right-1 shadow-sm',
            badgeSize
          )}
        >
          {extension}
        </Badge>
      )}
    </div>
  );
}