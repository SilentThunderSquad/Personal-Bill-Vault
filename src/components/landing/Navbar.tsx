import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Shield, Menu, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const isSignedIn = !loading && !!user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" />
          <span className="text-xl font-bold text-foreground">Bill Vault</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>

          {isSignedIn ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-accent hover:bg-accent/90 gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-accent hover:bg-accent/90">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-card">
            <div className="flex flex-col gap-4 mt-8">
              <a href="#features" onClick={() => setOpen(false)} className="text-foreground py-2">Features</a>
              <a href="#how-it-works" onClick={() => setOpen(false)} className="text-foreground py-2">How It Works</a>

              {isSignedIn ? (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-accent hover:bg-accent/90 gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-accent hover:bg-accent/90">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
