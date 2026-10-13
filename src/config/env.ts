import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  wcSecret: process.env.WOOCOMMERCE_WEBHOOK_SECRET || '',
  hubspotToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  redis: {
    host: (process.env.REDIS_HOST || '127.0.0.1').replace(/^https?:\/\//, ''),
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_HOST && process.env.REDIS_HOST !== '127.0.0.1' && process.env.REDIS_HOST !== 'localhost' ? {} : undefined,
  },
};