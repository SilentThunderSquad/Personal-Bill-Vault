import { Progress } from '@/components/ui/progress';
import { ScanSearch, Loader2 } from 'lucide-react';

interface OCRPreviewProps {
  progress: number;
}

export function OCRPreview({ progress }: OCRPreviewProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        {progress < 100 ? (
          <Loader2 className="h-5 w-5 text-accent animate-spin" />
        ) : (
          <ScanSearch className="h-5 w-5 text-accent" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {progress < 100 ? 'Scanning bill...' : 'Scan complete!'}
          </p>
          <p className="text-xs text-muted-foreground">
            {progress < 100 ? 'Extracting text from your bill image' : 'Review and edit the extracted details below'}
          </p>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2 text-right">{progress}%</p>
    </div>
  );
}
