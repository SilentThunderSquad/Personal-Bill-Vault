import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  mode: 'upload' | 'camera';
}

export function ImageUpload({ onImageSelect, mode }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onImageSelect(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl border-2 border-accent/30 overflow-hidden bg-muted/20"
      >
        <div className="p-3 sm:p-4 bg-accent/5 border-b border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-accent/10">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Image uploaded</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-xs">
                {fileName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
        <div className="p-2 sm:p-4 flex justify-center bg-muted/10">
          <img
            src={preview}
            alt="Bill preview"
            className="max-h-64 sm:max-h-80 object-contain rounded-lg shadow-sm"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`relative rounded-xl transition-all duration-200 ${
        dragActive
          ? 'border-2 border-accent bg-accent/5 shadow-lg shadow-accent/10'
          : 'border-2 border-dashed border-muted-foreground/25 hover:border-accent/50 bg-muted/20 hover:bg-muted/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={mode === 'camera' ? 'environment' : undefined}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 sm:gap-5 py-8 sm:py-12 px-4">
        <div className={`p-4 sm:p-5 rounded-2xl transition-colors ${
          dragActive ? 'bg-accent/15' : 'bg-muted'
        }`}>
          {mode === 'camera' ? (
            <Camera className={`h-8 w-8 sm:h-10 sm:w-10 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
          ) : (
            <ImageIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
          )}
        </div>

        <div className="text-center">
          <p className="text-base sm:text-lg font-medium text-foreground">
            {mode === 'camera' ? 'Take a photo of your bill' : 'Drop your bill image here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === 'camera'
              ? 'Use your camera to capture the bill'
              : 'Supports JPG, PNG, WebP up to 10MB'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'upload' && (
            <>
              <div className="h-px w-10 sm:w-16 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px w-10 sm:w-16 bg-border" />
            </>
          )}
        </div>

        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => fileInputRef.current?.click()}
          className={`h-11 px-6 text-sm font-medium gap-2 ${
            mode === 'camera' ? 'bg-accent hover:bg-accent/90' : ''
          }`}
        >
          {mode === 'camera' ? (
            <>
              <Camera className="h-4 w-4" />
              Open Camera
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Browse Files
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
