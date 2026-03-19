import type { Bill } from '@/types';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export interface MonthlyData {
  month: string;
  count: number;
  fullDate: Date;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

/**
 * Process bills data to get monthly upload trends for the last 6 months
 */
export function getMonthlyUploadsData(bills: Bill[]): MonthlyData[] {
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5); // Last 6 months including current

  // Generate all months in range
  const monthsInRange = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: startOfMonth(now),
  });

  // Group bills by month
  const billsByMonth = new Map<string, number>();

  bills.forEach(bill => {
    try {
      const billDate = parseISO(bill.created_at);
      const monthKey = format(startOfMonth(billDate), 'yyyy-MM');
      billsByMonth.set(monthKey, (billsByMonth.get(monthKey) || 0) + 1);
    } catch {
      // Skip invalid dates
    }
  });

  // Create data array with all months (including zero counts)
  return monthsInRange.map(month => {
    const monthKey = format(month, 'yyyy-MM');
    const count = billsByMonth.get(monthKey) || 0;

    return {
      month: format(month, 'MMM'), // Jan, Feb, Mar
      count,
      fullDate: month,
    };
  });
}

/**
 * Process bills data to get category distribution
 */
export function getCategoryDistributionData(bills: Bill[]): CategoryData[] {
  const categoryCount = new Map<string, number>();
  const total = bills.length;

  if (total === 0) return [];

  bills.forEach(bill => {
    const category = bill.category || 'Other';
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  });

  return Array.from(categoryCount.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Get color palette for charts
 */
export const chartColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
];

/**
 * Get responsive chart dimensions
 */
export function getChartDimensions() {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 640) { // sm breakpoint
      return { width: width - 40, height: 200 };
    } else if (width < 1024) { // lg breakpoint
      return { width: 400, height: 250 };
    }
    return { width: 450, height: 300 };
  }
  return { width: 450, height: 300 };
}

/**
 * Check if analytics should be shown (performance consideration)
 */
export function shouldShowAnalytics(billsCount: number): boolean {
  // Only show analytics if user has reasonable amount of data
  return billsCount >= 3;
}

/**
 * Format numbers for display in charts
 */
export function formatChartNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}