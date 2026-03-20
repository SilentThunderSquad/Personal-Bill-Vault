import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  HardDrive,
  Calendar,
  Clock,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBills: number;
  billsToday: number;
  billsThisWeek: number;
  billsThisMonth: number;
  storageUsed: number;
  notificationsToday: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'default', loading }: StatCardProps) {
  const colorClasses = {
    default: 'text-accent bg-accent/20',
    success: 'text-green-500 bg-green-500/20',
    warning: 'text-yellow-500 bg-yellow-500/20',
    danger: 'text-red-500 bg-red-500/20'
  };

  const changeColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', colorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
            )}
            {change !== undefined && changeLabel && !loading && (
              <div className="flex items-center gap-1">
                {change > 0 ? (
                  <ArrowUpIcon className={cn('h-3 w-3', changeColor)} />
                ) : change < 0 ? (
                  <ArrowDownIcon className={cn('h-3 w-3', changeColor)} />
                ) : null}
                <span className={cn('text-xs font-medium', changeColor)}>
                  {change > 0 ? '+' : ''}{change}% {changeLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system overview metrics
      const { data: systemOverview, error: overviewError } = await supabase
        .from('admin_system_overview')
        .select('*')
        .single();

      if (overviewError) {
        throw overviewError;
      }

      if (systemOverview) {
        setMetrics({
          totalUsers: systemOverview.total_users || 0,
          activeUsers: systemOverview.active_users || 0,
          totalBills: systemOverview.total_bills || 0,
          billsToday: systemOverview.bills_today || 0,
          billsThisWeek: systemOverview.bills_week || 0,
          billsThisMonth: systemOverview.bills_month || 0,
          storageUsed: systemOverview.total_storage_used || 0,
          notificationsToday: systemOverview.notifications_today || 0
        });
      }
    } catch (err) {
      console.error('Error loading system metrics:', err);
      setError('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and management for Bill Vault
        </p>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <button className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group">
          <Eye className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">View Users</p>
            <p className="text-xs text-muted-foreground">Manage user accounts</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group">
          <FileText className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">View Bills</p>
            <p className="text-xs text-muted-foreground">Bill management</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group">
          <Activity className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">Activity Logs</p>
            <p className="text-xs text-muted-foreground">System activity</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group">
          <Shield className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">System Settings</p>
            <p className="text-xs text-muted-foreground">Configure system</p>
          </div>
        </button>
      </motion.div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          change={metrics ? calculatePercentage(metrics.activeUsers, metrics.totalUsers) : undefined}
          changeLabel="of total"
          icon={TrendingUp}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Total Bills"
          value={metrics?.totalBills || 0}
          icon={FileText}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Storage Used"
          value={metrics ? formatBytes(metrics.storageUsed) : '0 Bytes'}
          icon={HardDrive}
          color="warning"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Bills Today"
          value={metrics?.billsToday || 0}
          icon={Calendar}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Bills This Week"
          value={metrics?.billsThisWeek || 0}
          icon={Clock}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Bills This Month"
          value={metrics?.billsThisMonth || 0}
          icon={TrendingUp}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Notifications Today"
          value={metrics?.notificationsToday || 0}
          icon={AlertTriangle}
          color="warning"
          loading={loading}
        />
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Database: Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Authentication: Healthy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Storage: Available</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <button className="text-sm text-accent hover:text-accent/80 transition-colors">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent admin activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}