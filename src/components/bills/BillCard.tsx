import { Card, CardContent } from '@/components/ui/card';
import { WarrantyBadge } from './WarrantyBadge';
import { formatDate, formatCurrency, getDaysRemaining } from '@/utils/formatters';
import { Calendar, Store, Tag } from 'lucide-react';
import type { Bill } from '@/types';

interface BillCardProps {
  bill: Bill;
  onClick: () => void;
}

export function BillCard({ bill, onClick }: BillCardProps) {
  const days = getDaysRemaining(bill.warranty_expiry);

  return (
    <Card
      className="cursor-pointer hover:border-accent/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0 mr-2 sm:mr-3">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{bill.product_name}</h3>
            {bill.brand && <p className="text-xs sm:text-sm text-muted-foreground truncate">{bill.brand}</p>}
          </div>
          <WarrantyBadge expiryDate={bill.warranty_expiry} />
        </div>

        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">{bill.store_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>{formatDate(bill.purchase_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>{bill.category}</span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border flex items-center justify-between">
          <span className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(bill.price, bill.currency)}</span>
          {days >= 0 && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">{days} days left</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
