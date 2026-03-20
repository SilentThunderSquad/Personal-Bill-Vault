import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Activity,
  Globe,
  Shield,
  Database,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface AnalyticsData {
  // User Analytics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  userGrowthRate: number;

  // Bill Analytics
  totalBills: number;
  billsToday: number;
  billsThisWeek: number;
  billsThisMonth: number;
  billGrowthRate: number;

  // Revenue Analytics
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  averageBillAmount: number;
  revenueGrowthRate: number;

  // Storage Analytics
  totalStorageUsed: number;
  storageGrowthRate: number;
  averageFileSize: number;

  // Processing Analytics
  processingSuccessRate: number;
  averageProcessingTime: number;
  failedProcessingCount: number;
}

interface ChartData {
  userRegistrations: Array<{ date: string; count: number }>;
  billCreations: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  storageUsage: Array<{ date: string; usage: number }>;
  processingStats: Array<{ date: string; success: number; failed: number }>;
}

interface TimeRange {
  label: string;
  value: '7d' | '30d' | '90d' | '1y';
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: 'Last 7 Days', value: '7d', days: 7 },
  { label: 'Last 30 Days', value: '30d', days: 30 },
  { label: 'Last 90 Days', value: '90d', days: 90 },
  { label: 'Last Year', value: '1y', days: 365 }
];

export default function SystemAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(timeRanges[1]); // Default to 30 days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadAnalyticsData(),
        loadChartData()
      ]);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange.days);

    // Get user analytics
    const { data: userStats } = await supabase
      .from('admin_user_overview')
      .select('signup_date, activity_status');

    // Get bill analytics
    const { data: billStats } = await supabase
      .from('admin_bills_overview')
      .select('created_at, date, total_amount, currency, processing_status');

    // Process the data
    const now = new Date();
    const today = now.toDateString();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastPeriod = new Date(now.getTime() - 2 * timeRange.days * 24 * 60 * 60 * 1000);

    // User analytics
    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => u.activity_status === 'active').length || 0;
    const newUsersToday = userStats?.filter(u =>
      new Date(u.signup_date).toDateString() === today
    ).length || 0;
    const newUsersThisWeek = userStats?.filter(u =>
      new Date(u.signup_date) >= thisWeek
    ).length || 0;

    // Calculate growth rate
    const currentPeriodUsers = userStats?.filter(u =>
      new Date(u.signup_date) >= startDate
    ).length || 0;
    const lastPeriodUsers = userStats?.filter(u =>
      new Date(u.signup_date) >= lastPeriod && new Date(u.signup_date) < startDate
    ).length || 0;
    const userGrowthRate = lastPeriodUsers > 0
      ? ((currentPeriodUsers - lastPeriodUsers) / lastPeriodUsers) * 100
      : 0;

    // Bill analytics
    const totalBills = billStats?.length || 0;
    const billsToday = billStats?.filter(b =>
      new Date(b.created_at).toDateString() === today
    ).length || 0;
    const billsThisWeek = billStats?.filter(b =>
      new Date(b.created_at) >= thisWeek
    ).length || 0;
    const billsThisMonth = billStats?.filter(b =>
      new Date(b.created_at) >= thisMonth
    ).length || 0;

    const currentPeriodBills = billStats?.filter(b =>
      new Date(b.created_at) >= startDate
    ).length || 0;
    const lastPeriodBills = billStats?.filter(b =>
      new Date(b.created_at) >= lastPeriod && new Date(b.created_at) < startDate
    ).length || 0;
    const billGrowthRate = lastPeriodBills > 0
      ? ((currentPeriodBills - lastPeriodBills) / lastPeriodBills) * 100
      : 0;

    // Revenue analytics
    const billsWithAmount = billStats?.filter(b => b.total_amount) || [];
    const totalRevenue = billsWithAmount.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const revenueToday = billsWithAmount
      .filter(b => new Date(b.created_at).toDateString() === today)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const revenueThisMonth = billsWithAmount
      .filter(b => new Date(b.created_at) >= thisMonth)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const averageBillAmount = billsWithAmount.length > 0
      ? totalRevenue / billsWithAmount.length
      : 0;

    const currentPeriodRevenue = billsWithAmount
      .filter(b => new Date(b.created_at) >= startDate)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const lastPeriodRevenue = billsWithAmount
      .filter(b => new Date(b.created_at) >= lastPeriod && new Date(b.created_at) < startDate)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const revenueGrowthRate = lastPeriodRevenue > 0
      ? ((currentPeriodRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100
      : 0;

    // Storage analytics (placeholder - would need actual storage data)
    const totalStorageUsed = 1024 * 1024 * 1024 * 2.5; // 2.5 GB placeholder
    const storageGrowthRate = 12.5;
    const averageFileSize = 1024 * 1024 * 2; // 2 MB placeholder

    // Processing analytics
    const completedBills = billStats?.filter(b => b.processing_status === 'completed').length || 0;
    const failedBills = billStats?.filter(b => b.processing_status === 'failed').length || 0;
    const processingSuccessRate = totalBills > 0 ? (completedBills / totalBills) * 100 : 0;
    const averageProcessingTime = 3.2; // seconds placeholder
    const failedProcessingCount = failedBills;

    setAnalytics({
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      userGrowthRate,
      totalBills,
      billsToday,
      billsThisWeek,
      billsThisMonth,
      billGrowthRate,
      totalRevenue,
      revenueToday,
      revenueThisMonth,
      averageBillAmount,
      revenueGrowthRate,
      totalStorageUsed,
      storageGrowthRate,
      averageFileSize,
      processingSuccessRate,
      averageProcessingTime,
      failedProcessingCount
    });
  };

  const loadChartData = async () => {
    // This would typically fetch data for charts
    // For now, we'll use placeholder data
    setChartData({
      userRegistrations: [
        { date: '2024-01-01', count: 12 },
        { date: '2024-01-02', count: 18 },
        { date: '2024-01-03', count: 8 },
        { date: '2024-01-04', count: 25 },
        { date: '2024-01-05', count: 15 },
        { date: '2024-01-06', count: 22 },
        { date: '2024-01-07', count: 30 }
      ],
      billCreations: [
        { date: '2024-01-01', count: 45 },
        { date: '2024-01-02', count: 62 },
        { date: '2024-01-03', count: 38 },
        { date: '2024-01-04', count: 71 },
        { date: '2024-01-05', count: 55 },
        { date: '2024-01-06', count: 68 },
        { date: '2024-01-07', count: 82 }
      ],
      categoryDistribution: [
        { category: 'Electronics', count: 145, percentage: 28.5 },
        { category: 'Food & Dining', count: 120, percentage: 23.6 },
        { category: 'Transportation', count: 89, percentage: 17.5 },
        { category: 'Utilities', count: 76, percentage: 14.9 },
        { category: 'Healthcare', count: 45, percentage: 8.8 },
        { category: 'Other', count: 35, percentage: 6.9 }
      ],
      revenueByMonth: [
        { month: 'Jan', amount: 12500 },
        { month: 'Feb', amount: 15200 },
        { month: 'Mar', amount: 18700 },
        { month: 'Apr', amount: 16800 },
        { month: 'May', amount: 22100 },
        { month: 'Jun', amount: 25400 }
      ],
      storageUsage: [
        { date: '2024-01-01', usage: 1.2 },
        { date: '2024-01-02', usage: 1.25 },
        { date: '2024-01-03', usage: 1.31 },
        { date: '2024-01-04', usage: 1.38 },
        { date: '2024-01-05', usage: 1.45 },
        { date: '2024-01-06', usage: 1.52 },
        { date: '2024-01-07', usage: 1.58 }
      ],
      processingStats: [
        { date: '2024-01-01', success: 42, failed: 3 },
        { date: '2024-01-02', success: 58, failed: 4 },
        { date: '2024-01-03', success: 35, failed: 3 },
        { date: '2024-01-04', success: 67, failed: 4 },
        { date: '2024-01-05', success: 51, failed: 4 },
        { date: '2024-01-06', success: 64, failed: 4 },
        { date: '2024-01-07', success: 78, failed: 4 }
      ]
    });
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = () => {
    try {
      if (!analytics || !chartData) {
        toast.error('No data available to export');
        return;
      }

      // Create comprehensive analytics report
      const reportData = {
        generatedAt: new Date().toISOString(),
        timeRange: timeRange.label,
        summary: {
          totalUsers: analytics.totalUsers,
          activeUsers: analytics.activeUsers,
          totalBills: analytics.totalBills,
          totalRevenue: analytics.totalRevenue,
          storageUsed: formatBytes(analytics.totalStorageUsed),
          processingSuccessRate: analytics.processingSuccessRate
        },
        userAnalytics: {
          newUsersToday: analytics.newUsersToday,
          newUsersThisWeek: analytics.newUsersThisWeek,
          userGrowthRate: analytics.userGrowthRate
        },
        billAnalytics: {
          billsToday: analytics.billsToday,
          billsThisWeek: analytics.billsThisWeek,
          billsThisMonth: analytics.billsThisMonth,
          billGrowthRate: analytics.billGrowthRate,
          averageBillAmount: analytics.averageBillAmount
        },
        revenueAnalytics: {
          revenueToday: analytics.revenueToday,
          revenueThisMonth: analytics.revenueThisMonth,
          revenueGrowthRate: analytics.revenueGrowthRate
        },
        categoryDistribution: chartData.categoryDistribution,
        userRegistrations: chartData.userRegistrations,
        billCreations: chartData.billCreations,
        revenueByMonth: chartData.revenueByMonth
      };

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also create a CSV summary
      const csvHeaders = ['Metric', 'Value', 'Growth Rate'];
      const csvData = [
        ['Total Users', analytics.totalUsers, `${analytics.userGrowthRate.toFixed(1)}%`],
        ['Active Users', analytics.activeUsers, ''],
        ['Total Bills', analytics.totalBills, `${analytics.billGrowthRate.toFixed(1)}%`],
        ['Total Revenue', formatCurrency(analytics.totalRevenue), `${analytics.revenueGrowthRate.toFixed(1)}%`],
        ['Storage Used', formatBytes(analytics.totalStorageUsed), `${analytics.storageGrowthRate.toFixed(1)}%`],
        ['Processing Success Rate', `${analytics.processingSuccessRate.toFixed(1)}%`, ''],
        ['Average Processing Time', `${analytics.averageProcessingTime.toFixed(1)}s`, ''],
        ['Failed Processing Count', analytics.failedProcessingCount, '']
      ];

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvLink = document.createElement('a');
      const csvUrl = URL.createObjectURL(csvBlob);
      csvLink.setAttribute('href', csvUrl);
      csvLink.setAttribute('download', `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`);
      csvLink.style.visibility = 'hidden';
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);

      toast.success('Analytics data exported successfully (JSON + CSV)');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-destructive" />
          <span className="text-destructive font-medium text-lg">{error}</span>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into system performance and user behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange.value}
            onChange={(e) => setTimeRange(timeRanges.find(t => t.value === e.target.value)!)}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh Data"
          >
            <Activity className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={exportData}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Export Data"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalUsers.toLocaleString()}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(analytics.userGrowthRate))}>
              {getGrowthIcon(analytics.userGrowthRate)}
              {formatPercentage(analytics.userGrowthRate)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{analytics.activeUsers}</span> active users
          </div>
        </motion.div>

        {/* Total Bills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalBills.toLocaleString()}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(analytics.billGrowthRate))}>
              {getGrowthIcon(analytics.billGrowthRate)}
              {formatPercentage(analytics.billGrowthRate)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{analytics.billsToday}</span> created today
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(analytics.revenueGrowthRate))}>
              {getGrowthIcon(analytics.revenueGrowthRate)}
              {formatPercentage(analytics.revenueGrowthRate)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Avg: <span className="text-foreground font-medium">{formatCurrency(analytics.averageBillAmount)}</span>
          </div>
        </motion.div>

        {/* Storage Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold text-foreground">{formatBytes(analytics.totalStorageUsed)}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm", getGrowthColor(analytics.storageGrowthRate))}>
              {getGrowthIcon(analytics.storageGrowthRate)}
              {formatPercentage(analytics.storageGrowthRate)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Avg file: <span className="text-foreground font-medium">{formatBytes(analytics.averageFileSize)}</span>
          </div>
        </motion.div>
      </div>

      {/* Processing Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Processing Success Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-500">
            {analytics.processingSuccessRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Successfully processed bills
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Avg Processing Time</h3>
          </div>
          <div className="text-3xl font-bold text-blue-500">
            {analytics.averageProcessingTime.toFixed(1)}s
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Time to process documents
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Failed Processing</h3>
          </div>
          <div className="text-3xl font-bold text-red-500">
            {analytics.failedProcessingCount}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Documents requiring attention
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-center gap-2">
            {chartData?.userRegistrations.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-8 transition-all hover:bg-blue-400"
                  style={{ height: `${(item.count / 30) * 200}px` }}
                  title={`${item.count} users`}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(item.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bill Creation Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Bill Creation</h3>
          <div className="h-64 flex items-end justify-center gap-2">
            {chartData?.billCreations.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-green-500 rounded-t w-8 transition-all hover:bg-green-400"
                  style={{ height: `${(item.count / 82) * 200}px` }}
                  title={`${item.count} bills`}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(item.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {chartData?.categoryDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                  />
                  <span className="text-sm text-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                  <span className="text-sm font-medium text-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-end justify-between">
            {chartData?.revenueByMonth.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-yellow-500 rounded-t w-12 transition-all hover:bg-yellow-400"
                  style={{ height: `${(item.amount / 26000) * 150}px` }}
                  title={formatCurrency(item.amount)}
                />
                <span className="text-xs text-muted-foreground mt-2">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}