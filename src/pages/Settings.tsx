import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, User, Shield } from 'lucide-react';
import type { NotificationSettings } from '@/types';

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  email_enabled: true,
  notify_30_days: true,
  notify_7_days: true,
  notify_1_day: true,
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

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
        // No settings found, create default settings
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

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user || !settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update settings');
    } else {
      setSettings({ ...settings, [key]: value });
      toast.success('Settings updated');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and notification preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Email</Label>
            <p className="text-foreground">{user?.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Member since</Label>
            <p className="text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-sm text-muted-foreground">Loading notification settings...</p>
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

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
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
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
