import { Resend } from 'resend';

function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
    return new Resend(apiKey);
}

interface WarrantyExpiryEmailParams {
    to: string;
    productTitle: string;
    warrantyEndDate: string;
    daysRemaining: number;
    dashboardUrl: string;
}

export async function sendWarrantyExpiryEmail({
    to,
    productTitle,
    warrantyEndDate,
    daysRemaining,
    dashboardUrl,
}: WarrantyExpiryEmailParams) {
    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: 'Warranty Vault <onboarding@resend.dev>',
            to: [to],
            subject: `⚠️ Warranty expiring soon: ${productTitle}`,
            html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #F9FAFB; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; margin: 0;">
              <span style="color: #3B82F6;">Warranty</span>
              <span style="color: #D4A574;">Vault</span>
            </h1>
          </div>
          
          <div style="background: #050816; border: 1px solid rgba(212,165,116,0.25); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #FACC15; font-size: 18px; margin: 0 0 16px;">
              ⚠️ Warranty Expiring Soon
            </h2>
            <p style="color: #9CA3AF; margin: 0 0 12px;">
              Your warranty for the following product is expiring in <strong style="color: #FACC15;">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>:
            </p>
            <div style="background: rgba(59,130,246,0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="color: #F9FAFB; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${productTitle}</p>
              <p style="color: #9CA3AF; margin: 0;">Expires on: <strong style="color: #EF4444;">${warrantyEndDate}</strong></p>
            </div>
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              If you need to make a warranty claim, now is the time to check your product and contact the manufacturer.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              View in Dashboard →
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 24px;">
            You received this email because you have warranty expiry notifications enabled in Warranty Vault.
          </p>
        </div>
      `,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, id: data?.id };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}
