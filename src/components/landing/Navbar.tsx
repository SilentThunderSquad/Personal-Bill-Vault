import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Shield, Menu, LayoutDashboard, Sparkles, Settings2, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const isSignedIn = !loading && !!user;

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
    }
    setOpen(false);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
          <span className="text-lg sm:text-xl font-bold text-foreground">Bill Vault</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>

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

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-foreground hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </button>
            }
          />
          <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background border-l border-border p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <span>Bill Vault</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col p-4">
              {/* Navigation Links */}
              <div className="space-y-1">
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Features</span>
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">How It Works</span>
                </a>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-border" />

              {/* Action Buttons */}
              <div className="space-y-2">
                {isSignedIn ? (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block">
                    <Button className="w-full bg-accent hover:bg-accent/90 h-11 gap-2 text-base">
                      <LayoutDashboard className="h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block">
                      <Button variant="outline" className="w-full h-11 gap-2 text-base">
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="block">
                      <Button className="w-full bg-accent hover:bg-accent/90 h-11 gap-2 text-base">
                        <UserPlus className="h-5 w-5" />
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
