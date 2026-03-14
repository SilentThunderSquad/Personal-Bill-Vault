import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date();
    const thresholds = [
      { days: 30, type: 'warranty_expiry_30d' },
      { days: 7, type: 'warranty_expiry_7d' },
      { days: 1, type: 'warranty_expiry_1d' },
    ];

    let notificationsCreated = 0;

    for (const { days, type } of thresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find bills expiring on exactly this date
      const { data: bills } = await supabase
        .from('bills')
        .select('id, user_id, product_name')
        .eq('warranty_expiry', targetDateStr)
        .is('deleted_at', null);

      if (!bills || bills.length === 0) continue;

      for (const bill of bills) {
        // Check user's notification settings
        const { data: settings } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', bill.user_id)
          .single();

        // Skip if user disabled this notification tier
        if (settings) {
          if (days === 30 && !settings.notify_30_days) continue;
          if (days === 7 && !settings.notify_7_days) continue;
          if (days === 1 && !settings.notify_1_day) continue;
        }

        // Check if notification already sent for this bill + type
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('bill_id', bill.id)
          .eq('type', type)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Create in-app notification
        const message = `Warranty for "${bill.product_name}" expires in ${days} day${days !== 1 ? 's' : ''}.`;

        await supabase.from('notifications').insert({
          user_id: bill.user_id,
          bill_id: bill.id,
          type,
          message,
        });

        notificationsCreated++;

        // Email notification can be added here using Resend, SendGrid, etc.
        // Example with Resend:
        // if (settings?.email_enabled) {
        //   const { data: userData } = await supabase.auth.admin.getUserById(bill.user_id);
        //   if (userData?.user?.email) {
        //     await fetch('https://api.resend.com/emails', {
        //       method: 'POST',
        //       headers: {
        //         'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        //         'Content-Type': 'application/json',
        //       },
        //       body: JSON.stringify({
        //         from: 'Bill Vault <notifications@yourdomain.com>',
        //         to: userData.user.email,
        //         subject: `Warranty expiring: ${bill.product_name}`,
        //         html: `<p>${message}</p><p><a href="${Deno.env.get('APP_URL')}/bills/${bill.id}">View Bill</a></p>`,
        //       }),
        //     });
        //   }
        // }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notificationsCreated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
