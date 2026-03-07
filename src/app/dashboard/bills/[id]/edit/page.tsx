'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Upload,
    FileText,
    Camera,
} from 'lucide-react';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { PRODUCT_CATEGORIES } from '@/lib/utils';
import type { Bill, BillFormData } from '@/lib/types';
import NextImage from 'next/image';

export default function EditBillPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useUser();
    const { getClient } = useSupabase();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [bill, setBill] = useState<Bill | null>(null);
    const [formData, setFormData] = useState<BillFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchBill = async () => {
            if (!user) return;
            try {
                const supabaseClient = await getClient();
                const { data, error } = await supabaseClient
                    .from('bills')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .is('deleted_at', null)
                    .single();
                if (error) throw error;
                setBill(data);
                setFormData({
                    title: data.title,
                    product_category: data.product_category,
                    brand: data.brand || '',
                    model: data.model || '',
                    serial_number: data.serial_number || '',
                    purchase_date: data.purchase_date,
                    purchase_store: data.purchase_store,
                    amount: String(data.amount),
                    currency: data.currency,
                    warranty_period_months: String(data.warranty_period_months),
                    warranty_end_date: data.warranty_end_date,
                    notes: data.notes || '',
                });
                if (data.bill_image_url) {
                    setImagePreview(data.bill_image_url);
                }
            } catch (err) {
                console.error('Error fetching bill:', err);
                setError('Failed to load bill.');
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [id, user, getClient]);

    const calcEndDate = (purchaseDate: string, months: string) => {
        if (!purchaseDate || !months) return '';
        const date = new Date(purchaseDate);
        date.setMonth(date.getMonth() + parseInt(months));
        return date.toISOString().split('T')[0];
    };

    const handleFormChange = (field: keyof BillFormData, value: string) => {
        if (!formData) return;
        const updated = { ...formData, [field]: value };
        if (field === 'purchase_date' || field === 'warranty_period_months') {
            const pd = field === 'purchase_date' ? value : formData.purchase_date;
            const wm = field === 'warranty_period_months' ? value : formData.warranty_period_months;
            updated.warranty_end_date = calcEndDate(pd, wm);
        }
        setFormData(updated);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !bill || !formData) return;

        if (!formData.title || !formData.purchase_date || !formData.purchase_store || !formData.amount) {
            setError('Please fill in all required fields.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const supabaseClient = await getClient();
            let billImageUrl = bill.bill_image_url;

            // Upload new image if changed
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabaseClient.storage
                    .from('bill-images')
                    .upload(fileName, imageFile, { upsert: true });
                if (uploadError) throw uploadError;

                const { data: urlData } = supabaseClient.storage
                    .from('bill-images')
                    .getPublicUrl(fileName);
                billImageUrl = urlData.publicUrl;
            }

            const warrantyEndDate =
                formData.warranty_end_date ||
                calcEndDate(formData.purchase_date, formData.warranty_period_months);

            const { error: updateError } = await supabaseClient
                .from('bills')
                .update({
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
                    updated_at: new Date().toISOString(),
                })
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            router.push(`/dashboard/bills/${bill.id}`);
            router.refresh();
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to update bill. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="shimmer h-8 w-48 rounded-lg" />
                <div className="glass-card p-8">
                    <div className="shimmer h-80 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!bill || !formData) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <h2 className="text-xl font-semibold mb-2">Bill not found</h2>
                <button onClick={() => router.back()} className="text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-main transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-2xl font-bold">Edit Bill</h1>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image */}
                <div className="glass-card p-4">
                    {imagePreview ? (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-text-muted">Bill Image</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-primary text-sm hover:underline"
                                    >
                                        Change
                                    </button>
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
                            </div>
                            <div className="relative w-full aspect-[4/3] max-h-48 mt-4">
                                <NextImage
                                    src={imagePreview}
                                    alt="Bill preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-accent-dim rounded-lg text-text-muted hover:text-accent hover:border-accent transition-all"
                        >
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Upload bill image</span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </div>

                {/* Product details */}
                <div className="glass-card p-6 space-y-5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" />
                        Product Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">
                                Title <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                className="input-dark"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Category</label>
                            <select
                                value={formData.product_category}
                                onChange={(e) => handleFormChange('product_category', e.target.value)}
                                className="input-dark appearance-none cursor-pointer"
                            >
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Brand</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleFormChange('brand', e.target.value)}
                                className="input-dark"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Model</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleFormChange('model', e.target.value)}
                                className="input-dark"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Serial Number</label>
                            <input
                                type="text"
                                value={formData.serial_number}
                                onChange={(e) => handleFormChange('serial_number', e.target.value)}
                                className="input-dark"
                            />
                        </div>
                    </div>
                </div>

                {/* Purchase details */}
                <div className="glass-card p-6 space-y-5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
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
                                Store <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.purchase_store}
                                onChange={(e) => handleFormChange('purchase_store', e.target.value)}
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

                {/* Warranty */}
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
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        rows={3}
                        className="input-dark resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
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
                                Update Bill
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
