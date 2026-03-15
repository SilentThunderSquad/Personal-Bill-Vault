import { useEffect } from 'react';
import { useBills } from '@/hooks/useBills';
import { useProfile } from '@/hooks/useProfile';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentBills } from '@/components/dashboard/RecentBills';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WarrantyTimeline } from '@/components/dashboard/WarrantyTimeline';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getWarrantyStatus } from '@/utils/formatters';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { bills, loading, fetchBills } = useBills();
  const { profile } = useProfile();

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const stats: DashboardStats = {
    total: bills.length,
    active: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'active').length,
    expiringSoon: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expiring').length,
    expired: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expired').length,
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {bills.length === 0
            ? 'Start by adding your first bill'
            : `You have ${stats.active} active warranties`}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsGrid stats={stats} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <RecentBills bills={bills.slice(0, 5)} />
        <WarrantyTimeline bills={bills} />
      </motion.div>
    </motion.div>
  );
}
