import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Bill, BillFormData } from '@/types';

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBills(data ?? []);
    }
    setLoading(false);
  }, [user]);

  const fetchBill = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    return data as Bill;
  }, [user]);

  const createBill = async (formData: BillFormData, imageFile?: File) => {
    if (!user) throw new Error('Not authenticated');

    let bill_image_url: string | null = null;

    if (imageFile) {
      const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('bill-images')
        .upload(filePath, imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('bill-images')
        .getPublicUrl(filePath);
      bill_image_url = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from('bills')
      .insert({
        user_id: user.id,
        product_name: formData.product_name,
        brand: formData.brand || null,
        purchase_date: formData.purchase_date,
        warranty_period_months: parseInt(formData.warranty_period_months) || 12,
        warranty_expiry: formData.warranty_expiry,
        invoice_number: formData.invoice_number || null,
        store_name: formData.store_name,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        currency: formData.currency || 'INR',
        notes: formData.notes || null,
        bill_image_url,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return data as Bill;
  };

  const updateBill = async (id: string, formData: Partial<BillFormData>) => {
    const update: Record<string, unknown> = {};
    if (formData.product_name !== undefined) update.product_name = formData.product_name;
    if (formData.brand !== undefined) update.brand = formData.brand || null;
    if (formData.purchase_date !== undefined) update.purchase_date = formData.purchase_date;
    if (formData.warranty_period_months !== undefined) update.warranty_period_months = parseInt(formData.warranty_period_months);
    if (formData.warranty_expiry !== undefined) update.warranty_expiry = formData.warranty_expiry;
    if (formData.invoice_number !== undefined) update.invoice_number = formData.invoice_number || null;
    if (formData.store_name !== undefined) update.store_name = formData.store_name;
    if (formData.category !== undefined) update.category = formData.category;
    if (formData.price !== undefined) update.price = parseFloat(formData.price) || 0;
    if (formData.currency !== undefined) update.currency = formData.currency;
    if (formData.notes !== undefined) update.notes = formData.notes || null;

    const { data, error: updateError } = await supabase
      .from('bills')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return data as Bill;
  };

  const deleteBill = async (billId: string) => {
    if (!user) throw new Error('Not authenticated');
    const { error: deleteError } = await supabase
      .from('bills')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', billId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
    setBills((prev) => prev.filter((b) => b.id !== billId));
  };

  return { bills, loading, error, fetchBills, fetchBill, createBill, updateBill, deleteBill };
}
