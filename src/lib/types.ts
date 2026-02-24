export interface Bill {
    id: string;
    user_id: string;
    title: string;
    product_category: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    purchase_date: string;
    purchase_store: string;
    amount: number;
    currency: string;
    warranty_period_months: number;
    warranty_end_date: string;
    notes: string | null;
    bill_image_url: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface BillFormData {
    title: string;
    product_category: string;
    brand: string;
    model: string;
    serial_number: string;
    purchase_date: string;
    purchase_store: string;
    amount: string;
    currency: string;
    warranty_period_months: string;
    warranty_end_date: string;
    notes: string;
}

export interface NotificationSettings {
    id: string;
    user_id: string;
    days_before_expiry: number;
    email_notifications_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface NotificationLog {
    id: string;
    user_id: string;
    bill_id: string;
    type: string;
    sent_at: string;
    delivery_status: 'success' | 'failed';
    error_message: string | null;
}

export interface OcrResult {
    store_name?: string;
    purchase_date?: string;
    product_name?: string;
    amount?: string;
    raw_text: string;
    confidence: number;
}
