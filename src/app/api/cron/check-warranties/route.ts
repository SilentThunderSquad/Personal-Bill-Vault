import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { sendWarrantyExpiryEmail } from '@/lib/email/resend';

/**
 * Daily cron job to check for expiring warranties and send email notifications.
 * Secured with CRON_SECRET to prevent unauthorized access.
 * 
 * Vercel Cron: Triggers this endpoint daily.
 */
export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    try {
        // Get all users with email notifications enabled
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('notification_settings')
            .select('*')
            .eq('email_notifications_enabled', true);

        if (settingsError) throw settingsError;
        if (!settings || settings.length === 0) {
            return NextResponse.json({ message: 'No users with notifications enabled', sent: 0 });
        }

        let totalSent = 0;
        const today = new Date();

        for (const userSettings of settings) {
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + userSettings.days_before_expiry);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            // Find bills expiring within the user's window that haven't been notified yet
            const { data: expiringBills, error: billsError } = await supabaseAdmin
                .from('bills')
                .select('*')
                .eq('user_id', userSettings.user_id)
                .is('deleted_at', null)
                .lte('warranty_end_date', futureDateStr)
                .gte('warranty_end_date', today.toISOString().split('T')[0]);

            if (billsError) {
                console.error(`Error fetching bills for user ${userSettings.user_id}:`, billsError);
                continue;
            }

            if (!expiringBills || expiringBills.length === 0) continue;

            // Get user email from Clerk (stored in our users table)
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users')
                .select('email')
                .eq('id', userSettings.user_id)
                .single();

            if (userError || !userData?.email) {
                console.error(`Error getting email for user ${userSettings.user_id}:`, userError);
                continue;
            }

            for (const bill of expiringBills) {
                // Check if we already sent a notification for this bill today
                const { data: existingLog } = await supabaseAdmin
                    .from('notification_log')
                    .select('id')
                    .eq('bill_id', bill.id)
                    .eq('user_id', userSettings.user_id)
                    .gte('sent_at', today.toISOString().split('T')[0]);

                if (existingLog && existingLog.length > 0) continue;

                const daysRemaining = Math.ceil(
                    (new Date(bill.warranty_end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                // Send email
                const result = await sendWarrantyExpiryEmail({
                    to: userData.email,
                    productTitle: bill.title,
                    warrantyEndDate: new Date(bill.warranty_end_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    }),
                    daysRemaining,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bills/${bill.id}`,
                });

                // Log the notification
                await supabaseAdmin.from('notification_log').insert({
                    user_id: userSettings.user_id,
                    bill_id: bill.id,
                    type: 'warranty_expiry_warning',
                    sent_at: new Date().toISOString(),
                    delivery_status: result.success ? 'success' : 'failed',
                    error_message: result.success ? null : result.error,
                });

                if (result.success) totalSent++;
            }
        }

        return NextResponse.json({
            message: `Notification check complete`,
            sent: totalSent,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
