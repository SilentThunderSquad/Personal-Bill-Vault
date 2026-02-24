import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function getWarrantyStatus(warrantyEndDate: string): 'active' | 'expiring' | 'expired' {
    const now = new Date();
    const end = new Date(warrantyEndDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'active';
}

export function getDaysRemaining(warrantyEndDate: string): number {
    const now = new Date();
    const end = new Date(warrantyEndDate);
    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

export const PRODUCT_CATEGORIES = [
    'Electronics',
    'Home Appliance',
    'Kitchen Appliance',
    'Mobile & Tablet',
    'Computer & Laptop',
    'TV & Audio',
    'Furniture',
    'Automobile',
    'Health & Fitness',
    'Clothing & Accessories',
    'Toys & Games',
    'Tools & Hardware',
    'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
