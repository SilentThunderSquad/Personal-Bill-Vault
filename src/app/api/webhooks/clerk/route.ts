import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', {
            status: 400,
        });
    }

    // Get body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error: Could not verify webhook:', err);
        return new Response('Error: Verification error', {
            status: 400,
        });
    }

    const { type, data } = evt;
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
