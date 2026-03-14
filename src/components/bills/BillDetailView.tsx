import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WarrantyBadge } from './WarrantyBadge';
import { formatDate, formatCurrency, getDaysRemaining } from '@/utils/formatters';
import { ArrowLeft, Trash2, Calendar, Store, Tag, Receipt, CreditCard, Clock, FileText } from 'lucide-react';
import type { Bill } from '@/types';

interface BillDetailViewProps {
  bill: Bill;
  onDelete: () => void;
}

export function BillDetailView({ bill, onDelete }: BillDetailViewProps) {
  const navigate = useNavigate();
  const days = getDaysRemaining(bill.warranty_expiry);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{bill.product_name}</CardTitle>
              {bill.brand && <p className="text-muted-foreground mt-1">{bill.brand}</p>}
            </div>
            <WarrantyBadge expiryDate={bill.warranty_expiry} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <DetailRow icon={CreditCard} label="Price" value={formatCurrency(bill.price, bill.currency)} />
            <DetailRow icon={Store} label="Store" value={bill.store_name} />
            <DetailRow icon={Calendar} label="Purchase Date" value={formatDate(bill.purchase_date)} />
            <DetailRow icon={Clock} label="Warranty Expiry" value={`${formatDate(bill.warranty_expiry)} (${days >= 0 ? `${days} days left` : 'Expired'})`} />
            <DetailRow icon={Tag} label="Category" value={bill.category} />
            <DetailRow icon={Receipt} label="Invoice #" value={bill.invoice_number || 'N/A'} />
            <DetailRow icon={Clock} label="Warranty Period" value={`${bill.warranty_period_months} months`} />
            <DetailRow icon={FileText} label="Added" value={formatDate(bill.created_at)} />
          </div>

          {bill.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bill.notes}</p>
              </div>
            </>
          )}

          {bill.bill_image_url && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Bill Image</p>
                <img
                  src={bill.bill_image_url}
                  alt="Bill"
                  className="max-w-full rounded-lg border border-border"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
