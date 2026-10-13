import express, { Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { config } from './config/env';
import { verifyWooCommerceWebhook, RawBodyRequest } from './middlewares/verifyHmac';
import { dbService } from './services/databaseService';
import { dashboardService } from './services/dashboardService';
import { renderDashboardHtml } from './views/dashboardHtml';
import { orderQueue } from './queues/orderQueue';
import { initOrderWorker } from './queues/orderWorker';
import { WcOrderPayload } from './types/woocommerce';

const app = express();
const port = config.port || 3000;

// Capture raw body buffer for HMAC-SHA256 signature verification
app.use(
  express.json({
    verify: (req: RawBodyRequest, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// 1. Dashboard View
app.get('/', async (_req, res) => {
  try {
    const data = await dashboardService.getStats();
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(renderDashboardHtml(data));
  } catch (err: any) {
    return res.status(500).send(`<h3>Failed to load dashboard: ${err.message}</h3>`);
  }
});

// 2. Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 3. WooCommerce Webhook Route (MUST MATCH send-test.ts EXACTLY)
app.post(
  '/webhooks/woocommerce/order',
  verifyWooCommerceWebhook,
  async (req: RawBodyRequest, res: Response) => {
    try {
      const orderPayload = req.body as WcOrderPayload;
      const deliveryId = (req.headers['x-wc-webhook-id'] as string) || `del_${Date.now()}`;
      const topic = (req.headers['x-wc-webhook-topic'] as string) || 'order.created';

      const logEntry = await dbService.logIncomingWebhook(deliveryId, topic, orderPayload);

      await orderQueue.add('sync-order', {
        webhookLogId: logEntry.id,
        order: orderPayload,
      });

      return res.status(202).json({
        status: 'accepted',
        auditId: logEntry.id,
        message: 'Webhook logged and processing queued',
      });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// 4. One-Click Indian Order Simulator Route
app.post('/api/test-event', async (_req, res) => {
  try {
    const indianLocations = [
      { first: 'Aarav', last: 'Sharma', city: 'Mumbai' },
      { first: 'Pooja', last: 'Patel', city: 'Ahmedabad' },
      { first: 'Rohan', last: 'Verma', city: 'Bengaluru' },
      { first: 'Aditya', last: 'Naik', city: 'Panaji' },
    ];
    const person = indianLocations[Math.floor(Math.random() * indianLocations.length)];
    const randomOrderId = Math.floor(5000 + Math.random() * 4000);
    const inrTotal = (Math.floor(1499 + Math.random() * 8500)).toFixed(2);

    const mockOrder: WcOrderPayload = {
      id: randomOrderId,
      status: 'processing',
      currency: 'INR',
      total: inrTotal,
      customer_id: Math.floor(100 + Math.random() * 800),
      date_created: new Date().toISOString(),
      billing: {
        first_name: person.first,
        last_name: person.last,
        email: `${person.first.toLowerCase()}.${person.last.toLowerCase()}${randomOrderId}@example.in`,
        phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
        city: person.city,
        country: 'IN',
      },
      line_items: [
        { id: 101, name: 'Noise Cancelling Earbuds', quantity: 1, total: inrTotal },
      ],
    };

    const logEntry = await dbService.logIncomingWebhook(`sim_inr_${Date.now()}`, 'order.created', mockOrder);
    await orderQueue.add('sync-order', { webhookLogId: logEntry.id, order: mockOrder });

    return res.status(200).json({ status: 'queued', orderId: randomOrderId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  initOrderWorker();
});