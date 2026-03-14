export interface Bill {
  id: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  purchase_date: string;
  warranty_period_months: number;
  warranty_expiry: string;
  invoice_number: string | null;
  store_name: string;
  category: string;
  bill_image_url: string | null;
  price: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BillFormData {
  product_name: string;
  brand: string;
  purchase_date: string;
  warranty_period_months: string;
  warranty_expiry: string;
  invoice_number: string;
  store_name: string;
  category: string;
  price: string;
  currency: string;
  notes: string;
}

export interface OcrResult {
  product_name?: string;
  store_name?: string;
  purchase_date?: string;
  amount?: string;
  invoice_number?: string;
  raw_text: string;
  confidence: number;
}

export interface Notification {
  id: string;
  user_id: string;
  bill_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  notify_30_days: boolean;
  notify_7_days: boolean;
  notify_1_day: boolean;
  created_at: string;
  updated_at: string;
}

export type WarrantyStatus = 'active' | 'expiring' | 'expired';

export interface DashboardStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}
