import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import type { WarrantyStatus } from '@/types';
import { EXPIRING_SOON_DAYS } from './constants';

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM dd, yyyy');
}

export function formatDateShort(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy');
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function getDaysRemaining(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date());
}

export function getWarrantyStatus(expiryDate: string): WarrantyStatus {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return 'expired';
  if (days <= EXPIRING_SOON_DAYS) return 'expiring';
  return 'active';
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateExpiryDate(purchaseDate: string, months: number): string {
  const date = parseISO(purchaseDate);
  date.setMonth(date.getMonth() + months);
  return format(date, 'yyyy-MM-dd');
}
