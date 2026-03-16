import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Receipt, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    label: 'Add New Bill',
    description: 'Upload or scan a new bill',
    icon: PlusCircle,
    href: '/bills/new',
    primary: true,
  },
  {
    label: 'View All Bills',
    description: 'Browse your bill collection',
    icon: Receipt,
    href: '/bills',
    primary: false,
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              action.primary
                ? 'bg-accent/5 border-accent/20 hover:border-accent/40 hover:bg-accent/10'
                : 'hover:border-muted-foreground/20'
            }`}
            onClick={() => navigate(action.href)}
          >
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className={`p-2.5 sm:p-3 rounded-xl ${
                action.primary ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
              }`}>
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-medium ${
                  action.primary ? 'text-accent' : 'text-foreground'
                }`}>
                  {action.label}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className={`h-4 w-4 sm:h-5 sm:w-5 ${
                action.primary ? 'text-accent' : 'text-muted-foreground'
              }`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
