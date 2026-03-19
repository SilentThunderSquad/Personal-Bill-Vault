import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Bill } from '@/types';
import { differenceInDays } from 'date-fns';
import { WARRANTY_CONFIG } from '@/utils/warrantyConfig';

export function WarrantyAlertPanel({ bills }: { bills: Bill[] }) {
  const now = new Date();
  
  const expiringBills = bills.filter(bill => {
    if (!bill.has_warranty || !bill.warranty_expiry) return false;
    const daysLeft = differenceInDays(new Date(bill.warranty_expiry), now);
    return daysLeft <= WARRANTY_CONFIG.EXPIRING_SOON_DAYS && daysLeft >= 0;
  });

  const expiredBills = bills.filter(bill => {
    if (!bill.has_warranty || !bill.warranty_expiry) return false;
    const daysLeft = differenceInDays(new Date(bill.warranty_expiry), now);
    return daysLeft < 0;
  });

  const totalAlerts = expiringBills.length + expiredBills.length;
  if (totalAlerts === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="border-amber-200/50 bg-amber-500/5 dark:bg-amber-500/10 overflow-hidden relative shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 sm:p-2.5 bg-amber-500/15 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-200">
                  Warranty Action Required
                </h3>
                <p className="text-sm text-amber-800/80 dark:text-amber-400/80 mt-1">
                  You have {expiringBills.length > 0 && <span><strong>{expiringBills.length}</strong> warranties expiring soon</span>}
                  {expiringBills.length > 0 && expiredBills.length > 0 && ' and '}
                  {expiredBills.length > 0 && <span><strong>{expiredBills.length}</strong> expired warranties</span>}.
                </p>
              </div>
            </div>
            
            <Link to="/bills" className="w-full sm:w-auto shrink-0">
              <Button variant="default" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-sm border-0">
                Review Warranties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
