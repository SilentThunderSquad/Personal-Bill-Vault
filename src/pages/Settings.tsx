import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Shield, Lock, Loader2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { activityTracker, ActivityHelpers } from '@/services/activityTracker';
import type { NotificationSettings } from '@/types';

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  email_enabled: true,
  notify_30_days: true,
  notify_7_days: true,
  notify_1_day: true,
  analytics_enabled: true,
};

export default function Settings() {
  const { user, signOut, updatePassword } = useAuth();

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification settings state
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      setLoadingSettings(true);
      setSettingsError(null);

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('notification_settings')
          .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
          .select()
          .single();

        if (insertError) {
          setSettingsError('Failed to create notification settings');
        } else {
          setSettings(newData);
        }
      } else if (error) {
        setSettingsError('Failed to load notification settings');
      } else if (data) {
        setSettings(data);
      }
      setLoadingSettings(false);
    };

    loadSettings();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await updatePassword(passwordForm.newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user || !settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      console.error('Settings update error:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    } else {
      setSettings({ ...settings, [key]: value });
      toast.success('Settings updated');
      // Log activity
      try {
        await activityTracker.logActivity(
          ActivityHelpers.settingsUpdated()
        );
      } catch (activityError) {
        console.error('Failed to log settings update activity:', activityError);
      }
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-8"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your account security, notifications, and preferences
        </p>
      </div>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={changingPassword || !passwordForm.newPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure when you receive warranty expiry alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSettings ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : settingsError ? (
            <p className="text-sm text-destructive">{settingsError}</p>
          ) : settings ? (
            <>
              <ToggleRow
                label="Email Notifications"
                description="Receive warranty alerts via email"
                checked={settings.email_enabled}
                onChange={(v) => updateSetting('email_enabled', v)}
                disabled={saving}
              />
              <Separator />
              <ToggleRow
                label="30-Day Warning"
                description="Alert 30 days before warranty expires"
                checked={settings.notify_30_days}
                onChange={(v) => updateSetting('notify_30_days', v)}
                disabled={saving}
              />
              <ToggleRow
                label="7-Day Warning"
                description="Alert 7 days before warranty expires"
                checked={settings.notify_7_days}
                onChange={(v) => updateSetting('notify_7_days', v)}
                disabled={saving}
              />
              <ToggleRow
                label="1-Day Warning"
                description="Alert 1 day before warranty expires"
                checked={settings.notify_1_day}
                onChange={(v) => updateSetting('notify_1_day', v)}
                disabled={saving}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No settings available</p>
          )}
        </CardContent>
      </Card>

      {/* Analytics Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <CardTitle>Analytics</CardTitle>
          </div>
          <CardDescription>Control dashboard charts and analytics features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSettings ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : settingsError ? (
            <p className="text-sm text-destructive">{settingsError}</p>
          ) : settings ? (
            <>
              <ToggleRow
                label="Dashboard Analytics"
                description="Show charts and analytics on your dashboard"
                checked={settings.analytics_enabled}
                onChange={(v) => updateSetting('analytics_enabled', v)}
                disabled={saving}
              />
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <p className="font-medium mb-1">What this includes:</p>
                <ul className="space-y-0.5">
                  <li>• Monthly bill upload trends</li>
                  <li>• Category distribution charts</li>
                  <li>• Visual insights and statistics</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No settings available</p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer block">{label}</label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? 'bg-accent' : 'bg-muted',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
