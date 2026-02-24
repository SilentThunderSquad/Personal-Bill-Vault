'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Bell,
    Settings as SettingsIcon,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mail,
    Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { NotificationSettings } from '@/lib/types';

export default function SettingsPage() {
    const { user } = useUser();
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(30);
    const [emailEnabled, setEmailEnabled] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('notification_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    setSettings(data);
                    setDaysBeforeExpiry(data.days_before_expiry);
                    setEmailEnabled(data.email_notifications_enabled);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            if (settings) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('notification_settings')
                    .update({
                        days_before_expiry: daysBeforeExpiry,
                        email_notifications_enabled: emailEnabled,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id);
                if (updateError) throw updateError;
            } else {
                // Create new
                const { error: insertError } = await supabase
                    .from('notification_settings')
                    .insert({
                        user_id: user.id,
                        days_before_expiry: daysBeforeExpiry,
                        email_notifications_enabled: emailEnabled,
                    });
                if (insertError) throw insertError;
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="shimmer h-8 w-48 rounded-lg" />
                <div className="glass-card p-8">
                    <div className="shimmer h-60 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-accent" />
                    Notification Settings
                </h1>
                <p className="text-text-muted mt-1">
                    Choose when and how you want to be notified about expiring warranties.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {saved && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30 text-success">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Settings saved successfully!</p>
                </div>
            )}

            {/* Email notifications toggle */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Notifications</h3>
                            <p className="text-text-muted text-sm">
                                Get warranty expiry reminders sent to your email.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEmailEnabled(!emailEnabled)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${emailEnabled ? 'bg-primary' : 'bg-bg-main'
                            }`}
                    >
                        <div
                            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${emailEnabled ? 'translate-x-7.5' : 'translate-x-0.5'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Notification timing */}
            <div className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10">
                        <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Reminder Timing</h3>
                        <p className="text-text-muted text-sm">
                            How many days before expiry should we notify you?
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Days before warranty expiry
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={365}
                        value={daysBeforeExpiry}
                        onChange={(e) => setDaysBeforeExpiry(parseInt(e.target.value) || 7)}
                        className="input-dark max-w-[200px]"
                    />
                    <p className="text-xs text-text-muted mt-2">
                        You&apos;ll be notified when a warranty is{' '}
                        <span className="text-accent font-medium">{daysBeforeExpiry} day{daysBeforeExpiry !== 1 ? 's' : ''}</span>{' '}
                        away from expiring.
                    </p>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2">
                    {[7, 14, 30, 60, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setDaysBeforeExpiry(days)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${daysBeforeExpiry === days
                                    ? 'bg-primary/10 text-primary border border-primary/30'
                                    : 'bg-bg-main text-text-muted border border-accent-dim hover:border-accent hover:text-accent'
                                }`}
                        >
                            {days} days
                        </button>
                    ))}
                </div>
            </div>

            {/* User info */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-success/10">
                        <Bell className="w-5 h-5 text-success" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Notification Email</h3>
                        <p className="text-text-muted text-sm">
                            Reminders will be sent to:{' '}
                            <span className="text-text-main font-medium">
                                {user?.emailAddresses[0]?.emailAddress || 'your email'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all btn-glow"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
