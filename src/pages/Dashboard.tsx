import { useEffect } from 'react';
import { useBills } from '@/hooks/useBills';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentBills } from '@/components/dashboard/RecentBills';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WarrantyTimeline } from '@/components/dashboard/WarrantyTimeline';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getWarrantyStatus } from '@/utils/formatters';
import type { DashboardStats } from '@/types';

export default function Dashboard() {
  const { bills, loading, fetchBills } = useBills();

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const stats: DashboardStats = {
    total: bills.length,
    active: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'active').length,
    expiringSoon: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expiring').length,
    expired: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expired').length,
  };

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your bills and warranties</p>
      </div>

      <StatsGrid stats={stats} />
      <QuickActions />

      <div className="grid lg:grid-cols-2 gap-8">
        <RecentBills bills={bills.slice(0, 5)} />
        <WarrantyTimeline bills={bills} />
      </div>
    </div>
  );
}
