import { dbService } from './databaseService';
import { WcOrderPayload } from '../types/woocommerce';

export class CRMService {
  /**
   * Persists customer record directly to local CRM storage (MySQL)
   */
  async upsertContact(billing: WcOrderPayload['billing'], wcCustomerId?: number): Promise<string> {
    const existing = await dbService.getCustomerMapping(billing.email);
    if (existing) {
      return existing.crmContactId;
    }

    const localContactId = `crm_cust_${Date.now()}`;
    await dbService.saveCustomerMapping(billing.email, localContactId, wcCustomerId);
    return localContactId;
  }

  /**
   * Tracks order progression and stages directly in local CRM storage (MySQL)
   */
  async syncDeal(order: WcOrderPayload, contactId: string): Promise<string> {
    const existingOrder = await dbService.getOrderMapping(order.id);
    const localDealId = existingOrder ? existingOrder.crmDealId : `crm_deal_${order.id}`;

    await dbService.saveOrderMapping(order, localDealId);
    return localDealId;
  }
}

export const crmService = new CRMService();