import { Card, CardContent } from '@/components/ui/card';
import { Receipt, ShieldCheck, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/types';

const statCards = [
  {
    key: 'total',
    label: 'Total Bills',
    icon: Receipt,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    borderColor: 'hover:border-blue-500/30',
    gradient: 'from-blue-500/5 to-transparent',
  },
  {
    key: 'active',
    label: 'Active Warranties',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    borderColor: 'hover:border-emerald-500/30',
    gradient: 'from-emerald-500/5 to-transparent',
  },
  {
    key: 'expiringSoon',
    label: 'Expiring Soon',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    borderColor: 'hover:border-amber-500/30',
    gradient: 'from-amber-500/5 to-transparent',
  },
  {
    key: 'expired',
    label: 'Expired',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    borderColor: 'hover:border-red-500/30',
    gradient: 'from-red-500/5 to-transparent',
  },
] as const;

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className={`relative overflow-hidden border-border ${card.borderColor} transition-all duration-300 hover:shadow-lg group`}>
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <CardContent className="relative p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-2.5 rounded-xl ${card.bg} transition-transform group-hover:scale-110`}>
                  <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                </div>
                {card.key === 'active' && stats[card.key] > 0 && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">Active</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {stats[card.key]}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
