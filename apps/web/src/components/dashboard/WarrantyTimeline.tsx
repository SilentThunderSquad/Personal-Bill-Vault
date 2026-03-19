import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDaysRemaining, getWarrantyStatus, formatDate } from '@/utils/formatters';
import { Clock, ChevronRight, CalendarClock } from 'lucide-react';
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Clock className="h-4 w-4 text-accent" />
          </div>
          Warranty Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4">
            <div className="p-3 rounded-full bg-muted mb-3">
              <CalendarClock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No upcoming expirations</p>
            <p className="text-xs text-muted-foreground mt-1">All warranties are far from expiring</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((bill) => {
              const days = getDaysRemaining(bill.warranty_expiry);
              const status = getWarrantyStatus(bill.warranty_expiry);
              const isExpiring = status === 'expiring';

              return (
                <div
                  key={bill.id}
                  className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/bills/${bill.id}`)}
                >
                  {/* Timeline indicator */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ring-4 ${
                      isExpiring
                        ? 'bg-amber-400 ring-amber-400/20'
                        : 'bg-emerald-400 ring-emerald-400/20'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {bill.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expires {formatDate(bill.warranty_expiry)}
                    </p>
                  </div>

                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    isExpiring
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {days}d left
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
