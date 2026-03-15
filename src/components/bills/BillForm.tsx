import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES, CURRENCY_OPTIONS } from '@/utils/constants';
import { calculateExpiryDate } from '@/utils/formatters';
import { validateBillForm } from '@/utils/validators';
import { Loader2 } from 'lucide-react';
import type { BillFormData } from '@/types';

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData, imageFile?: File) => void | Promise<void>;
  loading?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
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

export function BillForm({
  initialData,
  onSubmit,
  loading,
  isSubmitting,
  submitLabel = 'Save Bill',
  onCancel,
}: BillFormProps) {
  const [form, setForm] = useState<BillFormData>({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isDisabled = loading || isSubmitting;

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
        if (expiry) {
          setForm((prev) => ({ ...prev, warranty_expiry: expiry }));
        }
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
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product_name">Product Name <span className="text-destructive">*</span></Label>
          <Input
            id="product_name"
            value={form.product_name}
            onChange={(e) => handleChange('product_name', e.target.value)}
            placeholder="e.g. MacBook Pro 16"
            className={errors.product_name ? 'border-destructive' : ''}
            aria-invalid={!!errors.product_name}
            aria-describedby={errors.product_name ? 'product_name-error' : undefined}
          />
          {errors.product_name && (
            <p id="product_name-error" className="text-xs text-destructive" role="alert">{errors.product_name}</p>
          )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date <span className="text-destructive">*</span></Label>
          <Input
            id="purchase_date"
            type="date"
            value={form.purchase_date}
            onChange={(e) => handleChange('purchase_date', e.target.value)}
            className={errors.purchase_date ? 'border-destructive' : ''}
            aria-invalid={!!errors.purchase_date}
          />
          {errors.purchase_date && (
            <p className="text-xs text-destructive" role="alert">{errors.purchase_date}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="warranty_period_months">Warranty Period (months) <span className="text-destructive">*</span></Label>
          <Input
            id="warranty_period_months"
            type="number"
            min="0"
            max="240"
            value={form.warranty_period_months}
            onChange={(e) => handleChange('warranty_period_months', e.target.value)}
            placeholder="12"
            className={errors.warranty_period_months ? 'border-destructive' : ''}
          />
          {errors.warranty_period_months && (
            <p className="text-xs text-destructive" role="alert">{errors.warranty_period_months}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name <span className="text-destructive">*</span></Label>
          <Input
            id="store_name"
            value={form.store_name}
            onChange={(e) => handleChange('store_name', e.target.value)}
            placeholder="e.g. Amazon, Croma"
            className={errors.store_name ? 'border-destructive' : ''}
          />
          {errors.store_name && (
            <p className="text-xs text-destructive" role="alert">{errors.store_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
          <Select value={form.category} onValueChange={(v) => v && handleChange('category', v)}>
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive" role="alert">{errors.category}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0.00"
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && (
            <p className="text-xs text-destructive" role="alert">{errors.price}</p>
          )}
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
          className="resize-none"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
          disabled={isDisabled}
        >
          {isDisabled ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
