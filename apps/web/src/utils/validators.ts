import type { BillFormData } from '@/types';

export function validateBillForm(data: BillFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.product_name.trim()) {
    errors.product_name = 'Product name is required';
  }

  if (!data.purchase_date) {
    errors.purchase_date = 'Purchase date is required';
  }

  if (!data.store_name.trim()) {
    errors.store_name = 'Store name is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  // Only validate warranty period if has_warranty is true
  if (data.has_warranty) {
    const months = parseInt(data.warranty_period_months);
    if (isNaN(months) || months < 0) {
      errors.warranty_period_months = 'Valid warranty period is required';
    }
  }

  const price = parseFloat(data.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Valid price is required';
  }

  return errors;
}
