import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText, AlertCircle } from 'lucide-react';
import { detectFileTypeFromUrl, getFileNameFromUrl, downloadFile } from '@/utils/fileHelpers';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
  fileUrl: string | null;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ fileUrl, fileName, isOpen, onClose }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileType = detectFileTypeFromUrl(fileUrl);
  const displayFileName = fileName || getFileNameFromUrl(fileUrl);

  // Reset zoom when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setImageError(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleDownload = async () => {
    if (!fileUrl) return;

    setDownloading(true);
    try {
      await downloadFile(fileUrl, displayFileName);
      toast.success('File downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!fileUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 gap-0 border-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <DialogTitle className="text-sm font-medium truncate">{displayFileName}</DialogTitle>
                <Badge variant="outline" className="text-xs shrink-0">
                  {fileType?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {fileType === 'image' && !imageError && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.1}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="text-xs px-2 mx-1">
                      {Math.round(zoom * 100)}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 5}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetZoom}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="h-8 px-3"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="relative bg-muted/10">
            {fileType === 'image' ? (
              <div
                className={cn(
                  "overflow-auto max-w-[85vw] max-h-[70vh]",
                  zoom > 1 && "cursor-grab active:cursor-grabbing"
                )}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.2) transparent'
                }}
              >
                {imageError ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Failed to load image</p>
                    <p className="text-xs text-muted-foreground mt-1">The image might be corrupted or inaccessible</p>
                  </div>
                ) : (
                  <img
                    src={fileUrl}
                    alt={displayFileName}
                    className="block transition-transform duration-200 ease-out"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      maxWidth: zoom <= 1 ? '100%' : 'none',
                      height: 'auto'
                    }}
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                    draggable={false}
                  />
                )}
              </div>
            ) : fileType === 'pdf' ? (
              <div className="w-[85vw] h-[70vh] bg-white rounded">
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title={displayFileName}
                  onError={() => toast.error('Failed to load PDF')}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Preview not available</p>
                <p className="text-xs text-muted-foreground mt-1">Click download to view this file</p>
              </div>
            )}
          </div>

          {/* Footer with shortcuts info */}
          <div className="px-4 py-2 bg-muted/30 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {fileType === 'image' && !imageError && (
                <>
                  <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">+</kbd> / <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">-</kbd> Zoom •
                  <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">0</kbd> Reset •
                </>
              )}
              <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">Esc</kbd> Close
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}