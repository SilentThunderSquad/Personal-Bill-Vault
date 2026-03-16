import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Shield, LayoutDashboard, Receipt, PlusCircle, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bills', href: '/bills', icon: Receipt },
  { label: 'Add Bill', href: '/bills/new', icon: PlusCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function NavLink({ item, isActive, collapsed, onClose }: {
  item: typeof navItems[0];
  isActive: boolean;
  collapsed?: boolean;
  onClose?: () => void;
}) {
  const linkElement = (
    <Link
      to={item.href}
      onClick={onClose}
      className={cn(
        'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkElement} />
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
}

function SidebarContent({ onClose, collapsed, onToggleCollapse }: { onClose?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className={cn("flex items-center justify-between p-4", collapsed ? "px-2" : "p-6")}>
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <Shield className={cn("text-accent transition-all", collapsed ? "h-8 w-8" : "h-7 w-7")} />
          {!collapsed && <span className="text-xl font-bold text-foreground">Bill Vault</span>}
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClose={onClose}
            />
          );
        })}
      </nav>

      {/* Collapse toggle button - desktop only */}
      {onToggleCollapse && (
        <div className={cn("px-3 py-2", collapsed && "px-2")}>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center w-full rounded-lg text-sm font-medium transition-all text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

      <div className={cn("p-4 border-t border-border", collapsed && "p-2")}>
        {collapsed ? (
          <p className="text-xs text-muted-foreground text-center">v1.0</p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Bill Vault v1.0</p>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="left" className="p-0 w-64 bg-card">
          <SidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
