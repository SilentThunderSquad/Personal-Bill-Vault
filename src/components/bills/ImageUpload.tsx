import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  mode: 'upload' | 'camera';
}

export function ImageUpload({ onImageSelect, mode }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-xl border border-border overflow-hidden">
        <img src={preview} alt="Bill preview" className="w-full max-h-96 object-contain bg-muted/30" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={clearPreview}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
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

      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-accent/10">
          {mode === 'camera' ? (
            <Camera className="h-8 w-8 text-accent" />
          ) : (
            <ImageIcon className="h-8 w-8 text-accent" />
          )}
        </div>
        <div>
          <p className="text-foreground font-medium">
            {mode === 'camera' ? 'Take a photo of your bill' : 'Drop your bill image here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'camera' ? 'Use your camera to capture the bill' : 'or click to browse (JPG, PNG, WebP)'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2"
        >
          {mode === 'camera' ? (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
