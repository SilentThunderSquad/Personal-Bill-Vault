import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { useOCR } from '@/hooks/useOCR';
import { ImageUpload } from '@/components/bills/ImageUpload';
import { OCRPreview } from '@/components/bills/OCRPreview';
import { BillForm } from '@/components/bills/BillForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Camera, Upload, FileText } from 'lucide-react';
import type { BillFormData } from '@/types';

export default function AddBill() {
  const navigate = useNavigate();
  const { createBill } = useBills();
  const { processing, progress, result, error: ocrError, processImage, reset } = useOCR();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageSelect = async (file: File) => {
    setImageFile(file);
    await processImage(file);
  };

  const handleSave = async (formData: BillFormData) => {
    setSaving(true);
    try {
      await createBill(formData, imageFile || undefined);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Bill</h1>
        <p className="text-muted-foreground mt-1">Upload a bill image or enter details manually</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Camera</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Manual</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <ImageUpload onImageSelect={handleImageSelect} mode="upload" />
          {processing && <OCRPreview progress={progress} />}
          {ocrError && <p className="text-sm text-destructive">{ocrError}</p>}
          {result && !processing && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">
                OCR Confidence: <span className="text-foreground font-medium">{Math.round(result.confidence)}%</span>
                {result.confidence < 50 && ' - Low confidence, please verify all fields'}
              </p>
            </div>
          )}
          <BillForm initialData={initialData} onSubmit={handleSave} loading={saving} onCancel={() => { reset(); navigate(-1); }} />
        </TabsContent>

        <TabsContent value="camera" className="space-y-6 mt-6">
          <ImageUpload onImageSelect={handleImageSelect} mode="camera" />
          {processing && <OCRPreview progress={progress} />}
          {ocrError && <p className="text-sm text-destructive">{ocrError}</p>}
          <BillForm initialData={initialData} onSubmit={handleSave} loading={saving} onCancel={() => { reset(); navigate(-1); }} />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-6">
          <BillForm onSubmit={handleSave} loading={saving} onCancel={() => navigate(-1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
