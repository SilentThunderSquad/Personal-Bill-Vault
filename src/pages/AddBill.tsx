import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { useOCR } from '@/hooks/useOCR';
import { ImageUpload } from '@/components/bills/ImageUpload';
import { OCRPreview } from '@/components/bills/OCRPreview';
import { BillForm } from '@/components/bills/BillForm';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Upload, FileText, Sparkles, ArrowLeft, ImagePlus, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { BillFormData } from '@/types';

type TabType = 'upload' | 'camera' | 'manual';

const tabs = [
  { id: 'upload' as const, label: 'Upload', icon: Upload, description: 'Upload an image' },
  { id: 'camera' as const, label: 'Camera', icon: Camera, description: 'Take a photo' },
  { id: 'manual' as const, label: 'Manual', icon: FileText, description: 'Enter manually' },
];

export default function AddBill() {
  const navigate = useNavigate();
  const { createBill } = useBills();
  const { processing, progress, result, error: ocrError, processImage, reset } = useOCR();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);
  const [manualImagePreview, setManualImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (file: File) => {
    setImageFile(file);
    await processImage(file);
  };

  // Handle manual image upload without OCR
  const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setManualImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setManualImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearManualImage = () => {
    setManualImageFile(null);
    setManualImagePreview(null);
    if (manualFileInputRef.current) manualFileInputRef.current.value = '';
  };

  const handleSave = async (formData: BillFormData) => {
    setSaving(true);
    try {
      // Use appropriate image based on active tab
      const imageToUpload = activeTab === 'manual' ? manualImageFile : imageFile;
      await createBill(formData, imageToUpload || undefined);
      toast.success('Bill added successfully!');
      navigate('/bills');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill form from OCR results
  const initialData: Partial<BillFormData> = result
    ? {
        product_name: result.product_name || '',
        store_name: result.store_name || '',
        purchase_date: result.purchase_date || '',
        price: result.amount || '',
        invoice_number: result.invoice_number || '',
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Add New Bill</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload a bill image or enter details manually</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>

      {/* Custom Tabs */}
      <Card className="overflow-hidden">
        <div className="bg-muted/50 p-1.5 sm:p-2">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-background shadow-md text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <div className={`p-2 sm:p-2.5 rounded-full transition-colors ${
                    isActive ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>
                    <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs sm:text-sm font-medium ${isActive ? 'text-foreground' : ''}`}>
                      {tab.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                <ImageUpload onImageSelect={handleImageSelect} mode="upload" />
                {processing && <OCRPreview progress={progress} />}
                {ocrError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{ocrError}</p>
                  </div>
                )}
                {result && !processing && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">OCR Complete</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {Math.round(result.confidence)}%
                        {result.confidence < 50 && ' - Please verify fields'}
                      </p>
                    </div>
                  </div>
                )}
                <BillForm initialData={initialData} onSubmit={handleSave} loading={saving} onCancel={() => { reset(); navigate(-1); }} />
              </motion.div>
            )}

            {activeTab === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                <ImageUpload onImageSelect={handleImageSelect} mode="camera" />
                {processing && <OCRPreview progress={progress} />}
                {ocrError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{ocrError}</p>
                  </div>
                )}
                <BillForm initialData={initialData} onSubmit={handleSave} loading={saving} onCancel={() => { reset(); navigate(-1); }} />
              </motion.div>
            )}

            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Optional Bill Image Upload (No OCR) */}
                <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <ImagePlus className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground">Bill Image <span className="text-muted-foreground font-normal">(Optional)</span></h3>
                  </div>

                  <input
                    ref={manualFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleManualImageSelect}
                    className="hidden"
                  />

                  {manualImagePreview ? (
                    <div className="relative rounded-lg border-2 border-accent/30 overflow-hidden bg-muted/20">
                      <div className="p-3 bg-accent/5 border-b border-accent/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium text-foreground">Image attached</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearManualImage} className="h-7 px-2 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 flex justify-center">
                        <img src={manualImagePreview} alt="Bill preview" className="max-h-40 object-contain rounded" />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => manualFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-accent/50 hover:bg-muted/20 transition-all"
                    >
                      <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to attach bill image</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
                    </button>
                  )}
                </div>

                <BillForm onSubmit={handleSave} loading={saving} onCancel={() => navigate(-1)} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>  );
}
