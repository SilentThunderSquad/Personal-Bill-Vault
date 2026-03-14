import { Card, CardContent } from '@/components/ui/card';
import { Receipt, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/types';

const statCards = [
  { key: 'total', label: 'Total Bills', icon: Receipt, color: 'text-accent', bg: 'bg-accent/10' },
  { key: 'active', label: 'Active Warranties', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'expiringSoon', label: 'Expiring Soon', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'expired', label: 'Expired', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
] as const;

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="border-border hover:border-accent/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats[card.key]}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
