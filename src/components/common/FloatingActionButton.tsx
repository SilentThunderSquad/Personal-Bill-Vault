import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: typeof Plus;
  label: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

const fabActions: FABAction[] = [
  {
    icon: Upload,
    label: 'Upload Bill',
    href: '/bills/new?tab=upload',
    color: 'bg-blue-500',
  },
  {
    icon: Camera,
    label: 'Scan Bill',
    href: '/bills/new?tab=camera',
    color: 'bg-emerald-500',
  },
  {
    icon: FileText,
    label: 'Manual Entry',
    href: '/bills/new?tab=manual',
    color: 'bg-amber-500',
  },
];

export function FloatingActionButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Hide FAB on add bill page and on pages where bottom nav shows Add button
  const hideFAB =
    location.pathname === '/bills/new' ||
    location.pathname.startsWith('/bills/');

  // Only show on main pages (dashboard, bills list)
  const showFAB = !hideFAB && (location.pathname === '/dashboard' || location.pathname === '/bills');

  if (!showFAB) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container - Hidden on mobile since we have bottom nav */}
      <div className="fixed right-4 bottom-24 z-50 hidden lg:block">
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 mb-3">
              {fabActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setIsOpen(false);
                    if (action.href) navigate(action.href);
                    if (action.onClick) action.onClick();
                  }}
                  className="flex items-center gap-3 group"
                >
                  <span className="px-3 py-1.5 bg-card rounded-lg text-sm font-medium text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {action.label}
                  </span>
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-transform hover:scale-110',
                      action.color
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-colors',
            isOpen
              ? 'bg-muted text-foreground'
              : 'bg-accent text-white shadow-accent/30'
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
