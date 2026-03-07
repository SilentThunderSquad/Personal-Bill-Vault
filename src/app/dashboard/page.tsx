'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
    PlusCircle,
    Search,
    Filter,
    Package,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    TrendingUp,
    Calendar,
    ArrowUpDown,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { cn, getWarrantyStatus, getDaysRemaining, formatCurrency, formatDate } from '@/lib/utils';
import type { Bill } from '@/lib/types';

type SortField = 'purchase_date' | 'warranty_end_date' | 'amount' | 'title';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'expiring' | 'expired';

export default function DashboardPage() {
    const { user } = useUser();
    const { getClient } = useSupabase();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('warranty_end_date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchBills = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const supabaseClient = await getClient();
            const { data, error } = await supabaseClient
                .from('bills')
                .select('*')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order(sortField, { ascending: sortOrder === 'asc' });

            if (error) throw error;
            setBills(data || []);
        } catch (err) {
            console.error('Error fetching bills:', err);
        } finally {
            setLoading(false);
        }
    }, [user, sortField, sortOrder, getClient]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handleDelete = async (billId: string) => {
        try {
            const supabaseClient = await getClient();
            const { error } = await supabaseClient
                .from('bills')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', billId)
                .eq('user_id', user?.id);
            if (error) throw error;
            setBills((prev) => prev.filter((b) => b.id !== billId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting bill:', err);
        }
    };

    // Filter & search
    const filteredBills = bills.filter((bill) => {
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
                bill.title.toLowerCase().includes(q) ||
                bill.brand?.toLowerCase().includes(q) ||
                bill.model?.toLowerCase().includes(q) ||
                bill.purchase_store.toLowerCase().includes(q);
            if (!match) return false;
        }
        // Status filter
        if (statusFilter !== 'all') {
            const status = getWarrantyStatus(bill.warranty_end_date);
            if (status !== statusFilter) return false;
        }
        // Category filter
        if (categoryFilter !== 'all') {
            if (bill.product_category !== categoryFilter) return false;
        }
        return true;
    });

    // Stats
    const stats = {
        total: bills.length,
        active: bills.filter((b) => getWarrantyStatus(b.warranty_end_date) === 'active').length,
        expiring: bills.filter((b) => getWarrantyStatus(b.warranty_end_date) === 'expiring').length,
        expired: bills.filter((b) => getWarrantyStatus(b.warranty_end_date) === 'expired').length,
    };

    const categories = [...new Set(bills.map((b) => b.product_category))];

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome & Quick Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Welcome back
                        {user?.firstName ? `, ${user.firstName}` : ''}
                        <span className="text-accent">.</span>
                    </h1>
                    <p className="text-text-muted mt-1">Here&apos;s your warranty overview.</p>
                </div>
                <Link
                    href="/dashboard/bills/new"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-all btn-glow text-sm"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add New Bill
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Bills', value: stats.total, icon: Package, color: 'text-primary' },
                    { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-success' },
                    { label: 'Expiring Soon', value: stats.expiring, icon: ShieldAlert, color: 'text-warning' },
                    { label: 'Expired', value: stats.expired, icon: ShieldX, color: 'text-danger' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={cn('w-5 h-5', stat.color)} />
                            <TrendingUp className="w-4 h-4 text-text-muted" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-text-muted text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by title, brand, model, or store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-dark pl-10"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="input-dark pl-10 pr-8 appearance-none cursor-pointer min-w-[140px]"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expiring">Expiring Soon</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input-dark appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Sort bar */}
            <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-text-muted">Sort by:</span>
                {([
                    ['purchase_date', 'Purchase Date'],
                    ['warranty_end_date', 'Expiry Date'],
                    ['amount', 'Amount'],
                    ['title', 'Name'],
                ] as const).map(([field, label]) => (
                    <button
                        key={field}
                        onClick={() => toggleSort(field)}
                        className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
                            sortField === field
                                ? 'bg-primary/10 text-primary border border-primary/30'
                                : 'text-text-muted hover:text-text-main hover:bg-bg-surface'
                        )}
                    >
                        {label}
                        {sortField === field && (
                            <ArrowUpDown className="w-3 h-3" />
                        )}
                    </button>
                ))}
            </div>

            {/* Bills List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-6 shimmer h-24 rounded-xl" />
                    ))}
                </div>
            ) : filteredBills.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                        {bills.length === 0 ? 'Your vault is empty' : 'No bills match your search'}
                    </h3>
                    <p className="text-text-muted mb-6">
                        {bills.length === 0
                            ? 'Add your first bill to start tracking warranties.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                    {bills.length === 0 && (
                        <Link
                            href="/dashboard/bills/new"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add Your First Bill
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBills.map((bill) => {
                        const status = getWarrantyStatus(bill.warranty_end_date);
                        const days = getDaysRemaining(bill.warranty_end_date);
                        return (
                            <div
                                key={bill.id}
                                className="glass-card glass-card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold truncate">{bill.title}</h3>
                                        <span
                                            className={cn(
                                                'px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
                                                status === 'active' && 'status-active',
                                                status === 'expiring' && 'status-expiring',
                                                status === 'expired' && 'status-expired'
                                            )}
                                        >
                                            {status === 'active'
                                                ? `Active • ${days}d left`
                                                : status === 'expiring'
                                                    ? `Expiring • ${days}d left`
                                                    : `Expired`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                                        <span className="inline-flex items-center gap-1">
                                            <Package className="w-3.5 h-3.5" />
                                            {bill.product_category}
                                        </span>
                                        {bill.brand && <span>• {bill.brand}</span>}
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(bill.purchase_date)}
                                        </span>
                                        <span className="text-accent font-medium">
                                            {formatCurrency(bill.amount, bill.currency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={`/dashboard/bills/${bill.id}`}
                                        className="p-2.5 rounded-lg bg-bg-main hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                                        title="View details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={`/dashboard/bills/${bill.id}/edit`}
                                        className="p-2.5 rounded-lg bg-bg-main hover:bg-accent/10 text-text-muted hover:text-accent transition-all"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    {deleteConfirm === bill.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(bill.id)}
                                                className="px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-red-600 transition-all"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1.5 rounded-lg bg-bg-main text-text-muted text-xs hover:text-text-main transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(bill.id)}
                                            className="p-2.5 rounded-lg bg-bg-main hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
