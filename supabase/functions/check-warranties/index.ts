import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Database schema type definitions
interface Bill {
  id: string;
  user_id: string;
  product_name: string;
  warranty_expiry: string;
}

interface NotificationSettings {
  user_id: string;
  email_enabled: boolean;
  notify_30_days: boolean;
  notify_7_days: boolean;
  notify_1_day: boolean;
  analytics_enabled: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  bill_id: string;
  type: string;
  message: string;
  is_read: boolean;
}

interface Database {
  public: {
    Tables: {
      bills: {
        Row: Bill;
        Insert: Partial<Bill>;
        Update: Partial<Bill>;
      };
      notification_settings: {
        Row: NotificationSettings;
        Insert: Partial<NotificationSettings>;
        Update: Partial<NotificationSettings>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
    };
  };
}

interface WarrantyThreshold {
  days: number;
  type: string;
}

interface ApiResponse {
  success: boolean;
  notificationsCreated: number;
}

interface ApiError {
  error: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Environment variables validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // Create typed Supabase client
    const supabase: SupabaseClient<Database> = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    const today = new Date();
    const thresholds: WarrantyThreshold[] = [
      { days: 30, type: 'warranty_expiry_30d' },
      { days: 7, type: 'warranty_expiry_7d' },
      { days: 1, type: 'warranty_expiry_1d' },
    ];

    let notificationsCreated = 0;

    // Process each warranty threshold
    for (const { days, type } of thresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find bills expiring on exactly this date
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('id, user_id, product_name')
        .eq('warranty_expiry', targetDateStr);

      if (billsError) {
        console.error('Error fetching bills:', billsError);
        continue;
      }

      if (!bills || bills.length === 0) continue;

      // Process each bill
      for (const bill of bills) {
        try {
          // Check user's notification settings
          const { data: settings, error: settingsError } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', bill.user_id)
            .single();

          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error('Error fetching notification settings:', settingsError);
            continue;
          }

          // Skip if user disabled this notification tier
          if (settings) {
            if (days === 30 && !settings.notify_30_days) continue;
            if (days === 7 && !settings.notify_7_days) continue;
            if (days === 1 && !settings.notify_1_day) continue;
          }

          // Check if notification already sent for this bill + type
          const { data: existing, error: existingError } = await supabase
            .from('notifications')
            .select('id')
            .eq('bill_id', bill.id)
            .eq('type', type)
            .limit(1);

          if (existingError) {
            console.error('Error checking existing notifications:', existingError);
            continue;
          }

          if (existing && existing.length > 0) continue;

          // Create in-app notification
          const message = `Warranty for "${bill.product_name}" expires in ${days} day${days !== 1 ? 's' : ''}.`;

          const { error: insertError } = await supabase
            .from('notifications')
            .insert({
              user_id: bill.user_id,
              bill_id: bill.id,
              type,
              message,
            });

          if (insertError) {
            console.error('Error creating notification:', insertError);
            continue;
          }

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
        } catch (billError) {
          console.error(`Error processing bill ${bill.id}:`, billError);
          continue;
        }
      }
    }

    const response: ApiResponse = {
      success: true,
      notificationsCreated
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Function error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unknown error occurred';

    const errorResponse: ApiError = {
      error: errorMessage
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
