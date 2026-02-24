'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Calendar,
    Store,
    Package,
    Tag,
    Hash,
    FileText,
    Download,
    ExternalLink,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn, getWarrantyStatus, getDaysRemaining, formatCurrency, formatDate } from '@/lib/utils';
import type { Bill } from '@/lib/types';

export default function BillDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useUser();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchBill = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('bills')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .is('deleted_at', null)
                    .single();
                if (error) throw error;
                setBill(data);
            } catch (err) {
                console.error('Error fetching bill:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [id, user]);

    const handleDelete = async () => {
        if (!user || !bill) return;
        setDeleting(true);
        try {
            const { error } = await supabase
                .from('bills')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', bill.id)
                .eq('user_id', user.id);
            if (error) throw error;
            router.push('/dashboard');
        } catch (err) {
            console.error('Error deleting bill:', err);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="shimmer h-8 w-48 rounded-lg" />
                <div className="glass-card p-8 space-y-4">
                    <div className="shimmer h-6 w-64 rounded-lg" />
                    <div className="shimmer h-4 w-48 rounded-lg" />
                    <div className="shimmer h-40 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bill not found</h2>
                <p className="text-text-muted mb-6">This bill may have been deleted or doesn&apos;t exist.</p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const status = getWarrantyStatus(bill.warranty_end_date);
    const days = getDaysRemaining(bill.warranty_end_date);

    const StatusIcon = status === 'active' ? ShieldCheck : status === 'expiring' ? ShieldAlert : ShieldX;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-main transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/bills/${bill.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-accent-dim hover:border-accent text-sm transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Link>
                    {deleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-red-600 transition-all"
                            >
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-bg-surface text-text-muted text-sm hover:text-text-main transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-accent-dim hover:border-danger text-text-muted hover:text-danger text-sm transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Status banner */}
            <div
                className={cn(
                    'glass-card p-6 flex items-center gap-4',
                    status === 'active' && 'border-success/30',
                    status === 'expiring' && 'border-warning/30',
                    status === 'expired' && 'border-danger/30'
                )}
            >
                <StatusIcon
                    className={cn(
                        'w-10 h-10',
                        status === 'active' && 'text-success',
                        status === 'expiring' && 'text-warning',
                        status === 'expired' && 'text-danger'
                    )}
                />
                <div>
                    <h2 className="text-2xl font-bold">{bill.title}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-semibold',
                                status === 'active' && 'status-active',
                                status === 'expiring' && 'status-expiring',
                                status === 'expired' && 'status-expired'
                            )}
                        >
                            {status === 'active'
                                ? `Active — ${days} days remaining`
                                : status === 'expiring'
                                    ? `Expiring in ${days} days!`
                                    : `Expired ${Math.abs(days)} days ago`}
                        </span>
                        <span className="text-accent font-semibold text-lg">
                            {formatCurrency(bill.amount, bill.currency)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
                {[
                    { icon: Package, label: 'Category', value: bill.product_category },
                    { icon: Tag, label: 'Brand', value: bill.brand || '—' },
                    { icon: Hash, label: 'Model', value: bill.model || '—' },
                    { icon: Hash, label: 'Serial Number', value: bill.serial_number || '—' },
                    { icon: Calendar, label: 'Purchase Date', value: formatDate(bill.purchase_date) },
                    { icon: Store, label: 'Store', value: bill.purchase_store },
                    { icon: Calendar, label: 'Warranty Period', value: `${bill.warranty_period_months} months` },
                    { icon: Calendar, label: 'Warranty Expires', value: formatDate(bill.warranty_end_date) },
                ].map((item) => (
                    <div key={item.label} className="glass-card p-4">
                        <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                        <p className="font-medium">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Notes */}
            {bill.notes && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
                        <FileText className="w-4 h-4" />
                        Notes
                    </div>
                    <p className="text-text-main whitespace-pre-wrap">{bill.notes}</p>
                </div>
            )}

            {/* Bill image */}
            {bill.bill_image_url && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-text-muted text-sm">
                            <FileText className="w-4 h-4" />
                            Bill Image
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={bill.bill_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open
                            </a>
                            <a
                                href={bill.bill_image_url}
                                download
                                className="inline-flex items-center gap-1 text-accent text-sm hover:underline"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </a>
                        </div>
                    </div>
                    <img
                        src={bill.bill_image_url}
                        alt={`Bill for ${bill.title}`}
                        className="rounded-lg max-h-96 object-contain mx-auto border border-accent-dim"
                    />
                </div>
            )}
        </div>
    );
}
