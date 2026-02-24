'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
    Camera,
    Upload,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { extractWithTesseract } from '@/lib/ocr/tesseract';
import { PRODUCT_CATEGORIES } from '@/lib/utils';
import type { BillFormData, OcrResult } from '@/lib/types';

const initialFormData: BillFormData = {
    title: '',
    product_category: 'Electronics',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_store: '',
    amount: '',
    currency: 'INR',
    warranty_period_months: '12',
    warranty_end_date: '',
    notes: '',
};

export default function NewBillPage() {
    const router = useRouter();
    const { user } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'choose' | 'ocr' | 'manual'>('choose');
    const [formData, setFormData] = useState<BillFormData>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate warranty end date from purchase date + months
    const calcEndDate = (purchaseDate: string, months: string) => {
        if (!purchaseDate || !months) return '';
        const date = new Date(purchaseDate);
        date.setMonth(date.getMonth() + parseInt(months));
        return date.toISOString().split('T')[0];
    };

    const handleFormChange = (field: keyof BillFormData, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // Auto-calculate warranty end date
            if (field === 'purchase_date' || field === 'warranty_period_months') {
                const pd = field === 'purchase_date' ? value : prev.purchase_date;
                const wm = field === 'warranty_period_months' ? value : prev.warranty_period_months;
                updated.warranty_end_date = calcEndDate(pd, wm);
            }
            return updated;
        });
    };

    const handleImageSelect = async (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        // Run OCR
        setOcrProcessing(true);
        setOcrProgress(0);
        try {
            const result = await extractWithTesseract(file, (progress) => setOcrProgress(progress));
            setOcrResult(result);

            // Pre-fill form with OCR results
            setFormData((prev) => ({
                ...prev,
                title: result.product_name || prev.title,
                purchase_store: result.store_name || prev.purchase_store,
                purchase_date: result.purchase_date || prev.purchase_date,
                amount: result.amount || prev.amount,
            }));

            setMode('manual'); // Switch to form with pre-filled data
        } catch {
            setError('OCR failed. Please fill in the details manually.');
            setMode('manual');
        } finally {
            setOcrProcessing(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMode('ocr');
            handleImageSelect(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validate
        if (!formData.title || !formData.purchase_date || !formData.purchase_store || !formData.amount) {
            setError('Please fill in all required fields.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            let billImageUrl: string | null = null;

            // Upload image to Supabase Storage
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('bill-images')
                    .upload(fileName, imageFile, { upsert: true });
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('bill-images')
                    .getPublicUrl(fileName);
                billImageUrl = urlData.publicUrl;
            }

            // Calculate warranty end date
            const warrantyEndDate =
                formData.warranty_end_date ||
                calcEndDate(formData.purchase_date, formData.warranty_period_months);

            // Insert bill
            const { error: insertError } = await supabase.from('bills').insert({
                user_id: user.id,
                title: formData.title,
                product_category: formData.product_category,
                brand: formData.brand || null,
                model: formData.model || null,
                serial_number: formData.serial_number || null,
                purchase_date: formData.purchase_date,
                purchase_store: formData.purchase_store,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                warranty_period_months: parseInt(formData.warranty_period_months),
                warranty_end_date: warrantyEndDate,
                notes: formData.notes || null,
                bill_image_url: billImageUrl,
            });

            if (insertError) throw insertError;

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save bill. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add New Bill</h1>
                <p className="text-text-muted mt-1">Upload a photo or enter details manually.</p>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Mode chooser */}
            {mode === 'choose' && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="glass-card glass-card-hover p-8 text-center group cursor-pointer"
                    >
                        <Camera className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold mb-2">Upload / Capture Photo</h3>
                        <p className="text-text-muted text-sm">
                            Take a photo or upload an image of your bill.{' '}
                            <span className="text-accent">OCR will auto-extract details</span>.
                        </p>
                    </button>

                    <button
                        onClick={() => setMode('manual')}
                        className="glass-card glass-card-hover p-8 text-center group cursor-pointer"
                    >
                        <FileText className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold mb-2">Enter Manually</h3>
                        <p className="text-text-muted text-sm">
                            Fill in the bill and warranty details yourself. Quick and straightforward.
                        </p>
                    </button>

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </div>
            )}

            {/* OCR Processing */}
            {mode === 'ocr' && ocrProcessing && (
                <div className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Extracting Data from Bill...</h3>
                            <p className="text-text-muted text-sm">Our OCR engine is reading your bill.</p>
                        </div>
                        <div className="w-full max-w-xs bg-bg-main rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${ocrProgress}%` }}
                            />
                        </div>
                        <p className="text-text-muted text-sm">{ocrProgress}%</p>
                    </div>
                </div>
            )}

            {/* OCR Result banner */}
            {ocrResult && mode === 'manual' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-primary">
                            OCR completed! (Confidence: {Math.round(ocrResult.confidence)}%)
                        </p>
                        <p className="text-xs text-text-muted">
                            Fields have been pre-filled. Please review and correct any inaccuracies.
                        </p>
                    </div>
                </div>
            )}

            {/* Bill Form */}
            {mode === 'manual' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image preview */}
                    {imagePreview && (
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-text-muted">Uploaded Bill Image</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="text-text-muted hover:text-danger transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <img
                                src={imagePreview}
                                alt="Bill preview"
                                className="rounded-lg max-h-48 object-contain mx-auto"
                            />
                        </div>
                    )}

                    {/* If no image yet, allow adding one */}
                    {!imagePreview && (
                        <div className="glass-card p-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-accent-dim rounded-lg text-text-muted hover:text-accent hover:border-accent transition-all"
                            >
                                <Upload className="w-5 h-5" />
                                <span className="text-sm">Upload bill image (optional)</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Form fields */}
                    <div className="glass-card p-6 space-y-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent" />
                            Product Details
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Title / Product Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    placeholder="e.g. LG Washing Machine"
                                    className="input-dark"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Category <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={formData.product_category}
                                    onChange={(e) => handleFormChange('product_category', e.target.value)}
                                    className="input-dark appearance-none cursor-pointer"
                                >
                                    {PRODUCT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Brand</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => handleFormChange('brand', e.target.value)}
                                    placeholder="e.g. LG, Samsung"
                                    className="input-dark"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Model</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => handleFormChange('model', e.target.value)}
                                    placeholder="Model number"
                                    className="input-dark"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Serial Number</label>
                                <input
                                    type="text"
                                    value={formData.serial_number}
                                    onChange={(e) => handleFormChange('serial_number', e.target.value)}
                                    placeholder="Serial / IMEI"
                                    className="input-dark"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            Purchase Details
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Purchase Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={(e) => handleFormChange('purchase_date', e.target.value)}
                                    className="input-dark"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Store / Seller <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.purchase_store}
                                    onChange={(e) => handleFormChange('purchase_store', e.target.value)}
                                    placeholder="e.g. Amazon, Croma, Local Store"
                                    className="input-dark"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Amount <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleFormChange('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="input-dark"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => handleFormChange('currency', e.target.value)}
                                    className="input-dark appearance-none cursor-pointer"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            Warranty Details
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Warranty Period (months)
                                </label>
                                <input
                                    type="number"
                                    value={formData.warranty_period_months}
                                    onChange={(e) => handleFormChange('warranty_period_months', e.target.value)}
                                    placeholder="12"
                                    className="input-dark"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    Warranty End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.warranty_end_date}
                                    onChange={(e) => handleFormChange('warranty_end_date', e.target.value)}
                                    className="input-dark"
                                />
                                <p className="text-xs text-text-muted mt-1">Auto-calculated from purchase date + warranty months.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            placeholder="Any additional notes about this purchase or warranty..."
                            rows={3}
                            className="input-dark resize-none"
                        />
                    </div>

                    {/* Submit buttons */}
                    <div className="flex items-center gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 rounded-lg text-text-muted hover:text-text-main border border-accent-dim hover:border-accent transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all btn-glow"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Save Bill
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
