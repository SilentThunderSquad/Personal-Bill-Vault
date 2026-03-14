import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES, CURRENCY_OPTIONS } from '@/utils/constants';
import { calculateExpiryDate } from '@/utils/formatters';
import { validateBillForm } from '@/utils/validators';
import type { BillFormData } from '@/types';

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const emptyForm: BillFormData = {
  product_name: '',
  brand: '',
  purchase_date: '',
  warranty_period_months: '12',
  warranty_expiry: '',
  invoice_number: '',
  store_name: '',
  category: 'Electronics',
  price: '',
  currency: 'INR',
  notes: '',
};

export function BillForm({ initialData, onSubmit, loading, onCancel }: BillFormProps) {
  const [form, setForm] = useState<BillFormData>({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Auto-calculate warranty expiry when purchase date or period changes
  useEffect(() => {
    if (form.purchase_date && form.warranty_period_months) {
      const months = parseInt(form.warranty_period_months);
      if (!isNaN(months) && months >= 0) {
        const expiry = calculateExpiryDate(form.purchase_date, months);
        setForm((prev) => ({ ...prev, warranty_expiry: expiry }));
      }
    }
  }, [form.purchase_date, form.warranty_period_months]);

  const handleChange = (field: keyof BillFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBillForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product_name">Product Name *</Label>
          <Input
            id="product_name"
            value={form.product_name}
            onChange={(e) => handleChange('product_name', e.target.value)}
            placeholder="e.g. MacBook Pro 16"
          />
          {errors.product_name && <p className="text-xs text-destructive">{errors.product_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={form.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g. Apple"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date *</Label>
          <Input
            id="purchase_date"
            type="date"
            value={form.purchase_date}
            onChange={(e) => handleChange('purchase_date', e.target.value)}
          />
          {errors.purchase_date && <p className="text-xs text-destructive">{errors.purchase_date}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="warranty_period_months">Warranty Period (months) *</Label>
          <Input
            id="warranty_period_months"
            type="number"
            min="0"
            value={form.warranty_period_months}
            onChange={(e) => handleChange('warranty_period_months', e.target.value)}
            placeholder="12"
          />
          {errors.warranty_period_months && <p className="text-xs text-destructive">{errors.warranty_period_months}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
          <Input
            id="warranty_expiry"
            type="date"
            value={form.warranty_expiry}
            onChange={(e) => handleChange('warranty_expiry', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Auto-calculated from purchase date + warranty period</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={form.invoice_number}
            onChange={(e) => handleChange('invoice_number', e.target.value)}
            placeholder="e.g. INV-2024-001"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name *</Label>
          <Input
            id="store_name"
            value={form.store_name}
            onChange={(e) => handleChange('store_name', e.target.value)}
            placeholder="e.g. Amazon, Croma"
          />
          {errors.store_name && <p className="text-xs text-destructive">{errors.store_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={form.category} onValueChange={(v) => v && handleChange('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={form.currency} onValueChange={(v) => v && handleChange('currency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((cur) => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={loading}>
          {loading ? 'Saving...' : 'Save Bill'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
