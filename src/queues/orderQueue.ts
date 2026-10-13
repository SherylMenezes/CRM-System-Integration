import { Queue } from 'bullmq';
import { config } from '../config/env';
import { WcOrderPayload } from '../types/woocommerce';

export interface QueueJobPayload {
  webhookLogId: string;
  order: WcOrderPayload;
}

export const orderQueue = new Queue<QueueJobPayload>('order-sync-queue', {
  connection: config.redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
  },
});