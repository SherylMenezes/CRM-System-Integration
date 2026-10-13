export interface WcBilling {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
}

export interface WcLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
}

export interface WcOrderPayload {
  id: number;
  status: string;
  currency: string;
  total: string;
  customer_id: number;
  date_created: string;
  billing: WcBilling;
  line_items: WcLineItem[];
}