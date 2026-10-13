import { prisma } from '../config/db';

export class DashboardService {
  async getStats() {
    const [
      totalEvents,
      processedEvents,
      failedEvents,
      totalCustomers,
      totalOrders,
      recentEvents,
      customers,
      orders,
    ] = await Promise.all([
      prisma.webhookEvent.count(),
      prisma.webhookEvent.count({ where: { status: 'PROCESSED' } }),
      prisma.webhookEvent.count({ where: { status: 'FAILED' } }),
      prisma.customerMapping.count(),
      prisma.orderMapping.count(),
      prisma.webhookEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerMapping.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderMapping.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      metrics: {
        totalEvents,
        processedEvents,
        failedEvents,
        totalCustomers,
        totalOrders,
      },
      recentEvents,
      customers,
      orders,
    };
  }
}

export const dashboardService = new DashboardService();