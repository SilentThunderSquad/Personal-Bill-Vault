import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WarrantyBadge } from '@/components/bills/WarrantyBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Receipt, ArrowRight, ChevronRight } from 'lucide-react';
import type { Bill } from '@/types';

interface RecentBillsProps {
  bills: Bill[];
}

export function RecentBills({ bills }: RecentBillsProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Receipt className="h-4 w-4 text-accent" />
          </div>
          <CardTitle className="text-base sm:text-lg">Recent Bills</CardTitle>
        </div>
        {bills.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/bills')} className="text-accent gap-1 h-8">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {bills.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Receipt}
              title="No bills yet"
              description="Add your first bill to get started"
              actionLabel="Add Bill"
              onAction={() => navigate('/bills/new')}
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 cursor-pointer transition-colors group"
                onClick={() => navigate(`/bills/${bill.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                    {bill.product_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{formatDate(bill.purchase_date)}</p>
                    <span className="text-muted-foreground/50">•</span>
                    <p className="text-xs font-medium text-foreground">{formatCurrency(bill.price, bill.currency)}</p>
                  </div>
                </div>
                <WarrantyBadge expiryDate={bill.warranty_expiry} />
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
