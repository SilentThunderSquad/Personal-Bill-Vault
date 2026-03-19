import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SocialLoginButtons } from './SocialLoginButtons';
import { Shield, AlertTriangle, ArrowLeft, Users, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function SocialAuthForm() {
  const { isConfigured } = useAuth();
  const navigate = useNavigate();

  // Redirect after successful authentication is handled automatically by AuthContext
  // and the OAuth provider redirects to /dashboard

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 sm:space-y-8"
      >
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </button>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">Bill Vault</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Join Bill Vault</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Secure access with your existing account
          </p>
        </div>

        {!isConfigured && (
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-destructive">
              <p className="font-semibold">Backend not configured</p>
              <p className="mt-1">
                Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Settings &gt; Environment Variables, then redeploy.
              </p>
            </div>
          </div>
        )}

        <div className="bg-card p-5 sm:p-8 rounded-xl border border-border shadow-lg space-y-6">
          {/* Security Features */}
          <div className="grid grid-cols-1 gap-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-green-500" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Instant access - no passwords needed</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Use your trusted social account</span>
            </div>
          </div>

          {/* Main Authentication */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-foreground mb-2">Choose your preferred method</h3>
              <p className="text-sm text-muted-foreground">
                Bill Vault uses secure social authentication to protect your data
              </p>
            </div>

            <SocialLoginButtons />
          </div>

          {/* Privacy & Security Info */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Bill Vault only accesses your basic profile information (name, email, avatar).
              We never access your social media posts or other personal data.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="font-medium">Why social authentication?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No more forgotten passwords. Your account is secured by your trusted social provider's
            authentication system, giving you better security with less hassle.
          </p>
        </div>
      </motion.div>
    </div>
  );
}