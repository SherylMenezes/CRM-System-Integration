import * as crypto from 'crypto';
import * as http from 'http';
import * as dotenv from 'dotenv';
dotenv.config();

const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET || 'mysecret123';

const payload = JSON.stringify({
  id: 3001,
  status: 'processing',
  currency: 'INR',
  total: '4999.00',
  customer_id: 108,
  date_created: new Date().toISOString(),
  billing: {
    first_name: 'Rahul',
    last_name: 'Dravid',
    email: 'rahul.dravid@example.in',
    phone: '+91 9876543210',
    city: 'Bengaluru',
    country: 'IN',
  },
  line_items: [
    {
      id: 204,
      name: 'Wireless Bluetooth Headset',
      quantity: 1,
      total: '4999.00',
    },
  ],
});

// Compute HMAC-SHA256 signature
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('base64');

const req = http.request(
  'http://localhost:3000/webhooks/woocommerce/order',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WC-Webhook-Signature': signature,
      'X-WC-Webhook-ID': `del_inr_${Date.now()}`,
      'X-WC-Webhook-Topic': 'order.created',
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log(`\nHTTP Status: ${res.statusCode}`);
      try {
        console.log('Response Payload:', JSON.parse(body));
      } catch {
        console.log('Response (non-JSON):', body.slice(0, 150));
      }
    });
  }
);

req.on('error', (err) => console.error('Request Error:', err.message));
req.write(payload);
req.end();