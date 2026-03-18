import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Persist collapse state in localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen h-[100dvh] bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        "flex-1 flex flex-col min-h-0 w-full",
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Mobile Header - visible only on mobile */}
        <MobileHeader className="lg:hidden shrink-0" />

        {/* Main Content with page transitions */}
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "-webkit-overflow-scrolling-touch",
          // Horizontal and top padding
          "px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8",
          // Bottom padding: 128px for mobile (nav 64px + safe area 34px + extra 30px), normal for desktop
          "pb-26 lg:pb-8"
        )}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Action Button - Desktop only */}
        <FloatingActionButton />

        {/* Bottom Navigation - Mobile only */}
        <BottomNav />
      </div>
    </div>
  );
}
