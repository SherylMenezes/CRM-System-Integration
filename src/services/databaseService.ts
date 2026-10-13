import { prisma } from '../config/db';
import { WcOrderPayload } from '../types/woocommerce';

export class DatabaseService {
  async logIncomingWebhook(deliveryId: string | undefined, topic: string, payload: any) {
    return prisma.webhookEvent.create({
      data: {
        deliveryId: deliveryId || null,
        topic,
        payload,
        status: 'QUEUED',
      },
    });
  }

  async updateWebhookStatus(id: string, status: 'PROCESSED' | 'FAILED', error?: string) {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status,
        errorMessage: error || null,
      },
    });
  }

  async getCustomerMapping(email: string) {
    return prisma.customerMapping.findUnique({ where: { email } });
  }

  async saveCustomerMapping(email: string, crmContactId: string, wcCustomerId?: number) {
    return prisma.customerMapping.upsert({
      where: { email },
      update: { crmContactId, wcCustomerId: wcCustomerId || null },
      create: { email, crmContactId, wcCustomerId: wcCustomerId || null },
    });
  }

  async getOrderMapping(wcOrderId: number) {
    return prisma.orderMapping.findUnique({ where: { wcOrderId } });
  }

  async saveOrderMapping(order: WcOrderPayload, crmDealId: string) {
    return prisma.orderMapping.upsert({
      where: { wcOrderId: order.id },
      update: {
        status: order.status,
        amount: parseFloat(order.total),
        crmDealId,
      },
      create: {
        wcOrderId: order.id,
        crmDealId,
        status: order.status,
        amount: parseFloat(order.total),
      },
    });
  }
}

export const dbService = new DatabaseService();