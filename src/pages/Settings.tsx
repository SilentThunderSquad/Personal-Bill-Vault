import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, User, Shield, Camera, Lock, Save, Loader2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NotificationSettings, UserProfile } from '@/types';
import { sanitizePhoneNumber } from '@/utils/security';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other',
];

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  email_enabled: true,
  notify_30_days: true,
  notify_7_days: true,
  notify_1_day: true,
  analytics_enabled: true,
};

export default function Settings() {
  const { user, signOut, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    mobileNumber: '',
    country: 'India',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create new profile
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id, full_name: '' })
          .select()
          .single();
        if (newProfile) {
          setProfile(newProfile);
          setProfileForm({
            fullName: newProfile.full_name || '',
            mobileNumber: newProfile.mobile_number || '',
            country: newProfile.country || 'India',
          });
          setAvatarUrl(newProfile.avatar_url);
        }
      } else if (data) {
        setProfile(data);
        setProfileForm({
          fullName: data.full_name || '',
          mobileNumber: data.mobile_number || '',
          country: data.country || 'India',
        });
        setAvatarUrl(data.avatar_url);
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.fullName.trim(),
          mobile_number: profileForm.mobileNumber || null,
          country: profileForm.country,
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar files to prevent orphans (e.g. switching .png to .jpg)
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Storage not configured. Please create the "avatars" bucket in Supabase.');
        } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission') || uploadError.message.includes('not authorized')) {
          toast.error('Storage policy not configured. Run the storage policies SQL in Supabase.');
        } else {
          toast.error(`Upload failed: ${uploadError.message}`);
        }
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await supabase
        .from('user_profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProfile ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50"
                    aria-label="Upload profile picture"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={profileForm.mobileNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: sanitizePhoneNumber(e.target.value) })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>

              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

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
