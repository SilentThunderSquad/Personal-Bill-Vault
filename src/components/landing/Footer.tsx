import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            <span className="text-base sm:text-lg font-bold text-foreground">Bill Vault</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
          <div className="flex flex-col gap-2 text-center text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors underline">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors underline">
                Terms of Service
              </Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Bill Vault. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
