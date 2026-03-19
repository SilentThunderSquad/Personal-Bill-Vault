import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Shield,
  LogIn,
  LogOut,
  Settings,
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Download
} from 'lucide-react';
import { supabase } from '../context/AdminAuthContext';
import { cn } from '@shared/utils/cn';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_full_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  session_id: string | null;
}

interface ActivityFilters {
  search: string;
  action: string;
  resourceType: string;
  severity: 'all' | 'info' | 'warning' | 'error' | 'critical';
  dateRange: 'all' | 'today' | 'week' | 'month';
  userId: string;
}

const actionTypes = [
  'user.login',
  'user.logout',
  'user.register',
  'user.password_change',
  'bill.create',
  'bill.update',
  'bill.delete',
  'bill.view',
  'admin.user_suspend',
  'admin.user_activate',
  'admin.user_delete',
  'admin.bill_delete',
  'admin.settings_update',
  'system.backup',
  'system.error'
];

const resourceTypes = [
  'user',
  'bill',
  'authentication',
  'admin',
  'system'
];

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    dateRange: 'all',
    userId: ''
  });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use mock data as the activity_logs table would need to be created
      // In production, this would query the actual activity logs table
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          user_email: 'john.doe@example.com',
          user_full_name: 'John Doe',
          action: 'user.login',
          resource_type: 'authentication',
          resource_id: null,
          details: { ip: '192.168.1.100', location: 'New York, US' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          timestamp: new Date().toISOString(),
          session_id: 'session-123'
        },
        {
          id: '2',
          user_id: 'user-2',
          user_email: 'jane.smith@example.com',
          user_full_name: 'Jane Smith',
          action: 'bill.create',
          resource_type: 'bill',
          resource_id: 'bill-456',
          details: { title: 'Grocery Receipt', amount: 45.67, vendor: 'SuperMart' },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          severity: 'info',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          session_id: 'session-456'
        },
        {
          id: '3',
          user_id: null,
          user_email: 'admin@bill-vault.com',
          user_full_name: 'System Admin',
          action: 'admin.user_suspend',
          resource_type: 'admin',
          resource_id: 'user-3',
          details: { reason: 'Suspicious activity detected', suspended_user: 'spammer@example.com' },
          ip_address: '10.0.0.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'warning',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          session_id: 'admin-session-789'
        },
        {
          id: '4',
          user_id: null,
          user_email: null,
          user_full_name: null,
          action: 'system.error',
          resource_type: 'system',
          resource_id: null,
          details: { error: 'Database connection timeout', service: 'ocr-processor' },
          ip_address: null,
          user_agent: null,
          severity: 'error',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          session_id: null
        },
        {
          id: '5',
          user_id: 'user-4',
          user_email: 'bob.wilson@example.com',
          user_full_name: 'Bob Wilson',
          action: 'user.password_change',
          resource_type: 'authentication',
          resource_id: null,
          details: { method: 'self_service' },
          ip_address: '203.0.113.45',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          severity: 'info',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          session_id: 'mobile-session-321'
        }
      ];

      setLogs(mockLogs);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        return now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    // Search filter
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !searchTerm ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.user_email?.toLowerCase().includes(searchTerm) ||
      log.user_full_name?.toLowerCase().includes(searchTerm) ||
      log.resource_type.toLowerCase().includes(searchTerm) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm);

    // Action filter
    const matchesAction = filters.action === 'all' || log.action === filters.action;

    // Resource type filter
    const matchesResourceType = filters.resourceType === 'all' || log.resource_type === filters.resourceType;

    // Severity filter
    const matchesSeverity = filters.severity === 'all' || log.severity === filters.severity;

    // Date range filter
    const dateRangeFilter = getDateRangeFilter();
    const matchesDateRange = !dateRangeFilter ||
      (filters.dateRange === 'today'
        ? new Date(log.timestamp).toDateString() === dateRangeFilter
        : new Date(log.timestamp) >= new Date(dateRangeFilter));

    // User filter
    const matchesUser = !filters.userId || log.user_id === filters.userId;

    return matchesSearch && matchesAction && matchesResourceType &&
           matchesSeverity && matchesDateRange && matchesUser;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'critical': return 'bg-red-500/30 text-red-500 border-red-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'error': return <XCircle className="h-3 w-3" />;
      case 'critical': return <XCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LogIn className="h-4 w-4" />;
    if (action.includes('logout')) return <LogOut className="h-4 w-4" />;
    if (action.includes('create')) return <Plus className="h-4 w-4" />;
    if (action.includes('update')) return <Edit className="h-4 w-4" />;
    if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (action.includes('admin')) return <Shield className="h-4 w-4" />;
    if (action.includes('system')) return <Database className="h-4 w-4" />;
    if (action.includes('bill')) return <FileText className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login') || action.includes('register')) return 'text-green-500';
    if (action.includes('logout')) return 'text-blue-500';
    if (action.includes('delete')) return 'text-red-500';
    if (action.includes('suspend')) return 'text-yellow-500';
    if (action.includes('error')) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    await loadActivityLogs();
    setRefreshing(false);
    toast.success('Activity logs refreshed');
  };

  const exportLogs = () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'User Email', 'Action', 'Resource Type', 'IP Address', 'Severity', 'Details'];
      const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.user_email || 'System',
          log.action,
          log.resource_type,
          log.ip_address || 'N/A',
          log.severity,
          JSON.stringify(log.details).replace(/"/g, '""') // Escape quotes for CSV
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Activity logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const viewLogDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowLogModal(true);
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
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <span className="text-destructive font-medium text-lg">{error}</span>
        </div>
        <button
          onClick={loadActivityLogs}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all user activities and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredLogs.length} of {logs.length} logs
          </span>
          <button
            onClick={refreshLogs}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh Logs"
          >
            <Activity className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={exportLogs}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Export Logs"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs, users, actions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Action filter */}
          <select
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Resource type filter */}
          <select
            value={filters.resourceType}
            onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Resources</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Severity filter */}
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          {/* Date range filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* User ID filter */}
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resource</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    {Object.values(filters).some(f => f !== 'all' && f !== '')
                      ? 'No logs match your filters'
                      : 'No activity logs found'
                    }
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="text-foreground">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.user_email ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm min-w-0">
                            <p className="text-foreground truncate">
                              {log.user_full_name || log.user_email.split('@')[0]}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {log.user_email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">System</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", getActionColor(log.action))}>
                          {getActionIcon(log.action)}
                        </div>
                        <span className="text-sm text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-foreground capitalize">{log.resource_type}</p>
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {log.resource_id}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                        getSeverityColor(log.severity)
                      )}>
                        {getSeverityIcon(log.severity)}
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {log.ip_address || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewLogDetails(log)}
                        className="text-sm text-accent hover:text-accent/80 underline"
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {showLogModal && selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowLogModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Activity Log Details</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="text-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resource Type</label>
                  <p className="text-foreground capitalize">{selectedLog.resource_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Severity</label>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                    getSeverityColor(selectedLog.severity)
                  )}>
                    {getSeverityIcon(selectedLog.severity)}
                    {selectedLog.severity}
                  </span>
                </div>
                {selectedLog.resource_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resource ID</label>
                    <p className="text-foreground font-mono text-sm">{selectedLog.resource_id}</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-foreground font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}
              </div>

              {/* User Information */}
              {selectedLog.user_email && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">User Information</label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Email: </span>
                      {selectedLog.user_email}
                    </p>
                    {selectedLog.user_full_name && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Name: </span>
                        {selectedLog.user_full_name}
                      </p>
                    )}
                    {selectedLog.session_id && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Session: </span>
                        <code className="text-xs">{selectedLog.session_id}</code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.user_agent && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                  <p className="text-sm text-foreground mt-1 font-mono">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {/* Details */}
              {selectedLog.details && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}