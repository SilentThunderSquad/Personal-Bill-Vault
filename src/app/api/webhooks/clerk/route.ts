import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Clerk Webhook handler — syncs user data to Supabase when:
 * - A new user signs up (user.created)
 * - A user updates their profile (user.updated)
 * - A user deletes their account (user.deleted)
 */

interface ClerkWebhookEvent {
    type: string;
    data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
    };
}

export async function POST(request: Request) {
    const body = await request.text();

    // For now, parse the webhook without Svix verification in development
    // In production, add CLERK_WEBHOOK_SECRET and verify with Svix
    let event: ClerkWebhookEvent;

    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, data } = event;
    const supabaseAdmin = getSupabaseAdmin();

    try {
        switch (type) {
            case 'user.created':
            case 'user.updated': {
                const email = data.email_addresses?.[0]?.email_address;
                if (!email) break;

                const { error } = await supabaseAdmin
                    .from('users')
                    .upsert(
                        {
                            id: data.id,
                            email,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'id' }
                    );

                if (error) {
                    console.error('Error upserting user:', error);
                    return NextResponse.json({ error: 'DB error' }, { status: 500 });
                }

                // Create default notification settings for new users
                if (type === 'user.created') {
                    await supabaseAdmin
                        .from('notification_settings')
                        .insert({
                            user_id: data.id,
                            days_before_expiry: 30,
                            email_notifications_enabled: true,
                        });
                }
                break;
            }

            case 'user.deleted': {
                // Soft delete — mark user's data as deleted
                const { error } = await supabaseAdmin
                    .from('bills')
                    .update({ deleted_at: new Date().toISOString() })
                    .eq('user_id', data.id);
                if (error) console.error('Error soft-deleting bills:', error);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
