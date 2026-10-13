import { Worker, Job } from 'bullmq';
import { config } from '../config/env';
import { QueueJobPayload } from './orderQueue';
import { crmService } from '../services/crmService';
import { dbService } from '../services/databaseService';
import { sendOrderNotification } from '../services/notificationService';

export const initOrderWorker = () => {
  const worker = new Worker<QueueJobPayload>(
    'order-sync-queue',
    async (job: Job<QueueJobPayload>) => {
      const { webhookLogId, order } = job.data;
      console.log(`[Worker] Started processing Job ${job.id} for Order #${order.id}`);

      try {
        // 1. Customer Data Management: Upsert Contact into HubSpot & Postgres
        const contactId = await crmService.upsertContact(order.billing, order.customer_id);
        console.log(`[Worker] Synced Contact ${contactId} for Order #${order.id}`);

        // 2. Order Tracking: Create or update Deal stage in HubSpot & record in Postgres
        const dealId = await crmService.syncDeal(order, contactId);
        console.log(`[Worker] Synced Deal ${dealId} for Order #${order.id}`);

        // 3. Communication Workflow: Send status-based transactional email
        await sendOrderNotification(order.billing.email, order.id, order.status);
        console.log(`[Worker] Dispatched notification email to ${order.billing.email}`);

        // 4. Update Webhook audit log in PostgreSQL
        await dbService.updateWebhookStatus(webhookLogId, 'PROCESSED');
        console.log(`[Worker] Successfully completed Job ${job.id}`);

        return { contactId, dealId };
      } catch (err: any) {
        console.error(`[Worker] Error in Job ${job.id} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts}): ${err.message}`);

        // If all retry attempts are exhausted, record the permanent failure in PostgreSQL
        if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
          await dbService.updateWebhookStatus(webhookLogId, 'FAILED', err.message);
        }

        // Re-throw so BullMQ triggers the configured exponential backoff
        throw err;
      }
    },
    {
      connection: config.redis,
      concurrency: 5, // Processes up to 5 webhook jobs in parallel
    }
  );

  worker.on('ready', () => {
    console.log('[Worker] Connected to Redis and listening for jobs...');
  });

  worker.on('failed', (job: Job<QueueJobPayload> | undefined, err: Error) => {
    console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
  });

  worker.on('error', (err: Error) => {
    console.error('[Worker] Unexpected Redis worker error:', err);
  });

  return worker;
};