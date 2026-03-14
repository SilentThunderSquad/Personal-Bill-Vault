import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDaysRemaining, getWarrantyStatus, formatDate } from '@/utils/formatters';
import { WARRANTY_STATUSES } from '@/utils/constants';
import { Clock } from 'lucide-react';
import type { Bill } from '@/types';

interface WarrantyTimelineProps {
  bills: Bill[];
}

export function WarrantyTimeline({ bills }: WarrantyTimelineProps) {
  const navigate = useNavigate();

  // Show bills expiring soonest (active + expiring only), sorted by days remaining
  const upcoming = bills
    .filter((b) => getWarrantyStatus(b.warranty_expiry) !== 'expired')
    .sort((a, b) => getDaysRemaining(a.warranty_expiry) - getDaysRemaining(b.warranty_expiry))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Warranty Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No active warranties to show</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((bill) => {
              const days = getDaysRemaining(bill.warranty_expiry);
              const status = getWarrantyStatus(bill.warranty_expiry);
              const statusInfo = WARRANTY_STATUSES[status];
              return (
                <div
                  key={bill.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/bills/${bill.id}`)}
                >
                  <div className={`w-2 h-2 rounded-full ${status === 'expiring' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{bill.product_name}</p>
                    <p className="text-xs text-muted-foreground">Expires {formatDate(bill.warranty_expiry)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusInfo.color}`}>
                    {days}d left
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
