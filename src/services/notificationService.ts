import { Resend } from 'resend';
import { config } from '../config/env';

const resend = new Resend(config.resendApiKey);

export async function sendOrderNotification(email: string, orderId: number, status: string): Promise<void> {
  if (!config.resendApiKey || !email) return;

  await resend.emails.send({
    from: 'Orders <orders@yourdomain.com>',
    to: email,
    subject: `Order #${orderId} Update: ${status.toUpperCase()}`,
    html: `
      <h2>Order Status Update</h2>
      <p>Your order <strong>#${orderId}</strong> is now marked as <strong>${status}</strong>.</p>
    `,
  });
}