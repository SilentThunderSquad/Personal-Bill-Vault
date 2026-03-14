import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WarrantyBadge } from '@/components/bills/WarrantyBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Receipt, ArrowRight } from 'lucide-react';
import type { Bill } from '@/types';

interface RecentBillsProps {
  bills: Bill[];
}

export function RecentBills({ bills }: RecentBillsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Bills</CardTitle>
        {bills.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/bills')} className="text-accent">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No bills yet"
            description="Add your first bill to get started"
            actionLabel="Add Bill"
            onAction={() => navigate('/bills/new')}
          />
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/bills/${bill.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{bill.product_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(bill.purchase_date)} &middot; {formatCurrency(bill.price, bill.currency)}</p>
                </div>
                <WarrantyBadge expiryDate={bill.warranty_expiry} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
