import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
      toast.error('App is not configured. Environment variables are missing.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">Bill Vault</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {!isConfigured && (
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-destructive">
              <p className="font-semibold">Backend not configured</p>
              <p className="mt-1">Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Settings &gt; Environment Variables, then redeploy.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-5 sm:p-8 rounded-xl border border-border">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs sm:text-sm text-accent hover:underline">Forgot password?</Link>
            </div>
            <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-11 text-base" disabled={loading || !isConfigured}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
