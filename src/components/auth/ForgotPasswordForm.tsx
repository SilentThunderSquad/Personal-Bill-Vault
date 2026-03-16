import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success('Password reset email sent!');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {sent ? 'Check your email for a reset link' : "Enter your email and we will send you a reset link"}
          </p>
        </div>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-5 sm:p-8 rounded-xl border border-border shadow-lg">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-11 text-base" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="bg-card p-5 sm:p-8 rounded-xl border border-border shadow-lg text-center space-y-4">
            <p className="text-sm sm:text-base text-foreground">We sent a password reset link to <strong>{email}</strong>.</p>
            <Button variant="outline" onClick={() => setSent(false)} className="w-full h-11">Send again</Button>
          </div>
        )}
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
