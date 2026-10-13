import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env';

export interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

export const verifyWooCommerceWebhook = (
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['x-wc-webhook-signature'] as string;

  if (!signature || !req.rawBody) {
    return res.status(401).json({ error: 'Missing webhook signature or raw body' });
  }

  const hash = crypto
    .createHmac('sha256', config.wcSecret)
    .update(req.rawBody)
    .digest('base64');

  const trusted = Buffer.from(hash, 'utf-8');
  const untrusted = Buffer.from(signature, 'utf-8');

  if (trusted.length !== untrusted.length || !crypto.timingSafeEqual(trusted, untrusted)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
};