import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, AlertTriangle, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { SocialLoginButtons } from './SocialLoginButtons';
import { validatePasswordStrength, isValidEmail, sanitizePhoneNumber, isCommonPassword } from '@/utils/security';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other',
];

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobileNumber: '',
    country: 'India',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = validatePasswordStrength(formData.password);

  const handleChange = (field: string, value: string) => {
    if (field === 'mobileNumber') {
      value = sanitizePhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string): string | null => {
    if (!touched[field]) return null;

    switch (field) {
      case 'email':
        if (!formData.email) return 'Email is required';
        if (!isValidEmail(formData.email)) return 'Enter a valid email address';
        break;
      case 'fullName':
        if (!formData.fullName.trim()) return 'Full name is required';
        if (formData.fullName.length < 2) return 'Name must be at least 2 characters';
        break;
      case 'password':
        if (!formData.password) return 'Password is required';
        if (isCommonPassword(formData.password)) return 'This password is too common';
        if (!passwordStrength.isValid) return 'Password is too weak';
        break;
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        break;
      case 'mobileNumber':
        if (formData.mobileNumber && formData.mobileNumber.length < 10) {
          return 'Enter a valid phone number';
        }
        break;
    }
    return null;
  };

  const isFormValid = () => {
    return (
      isValidEmail(formData.email) &&
      formData.fullName.trim().length >= 2 &&
      passwordStrength.isValid &&
      !isCommonPassword(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields to show errors
    setTouched({
      email: true,
      fullName: true,
      password: true,
      confirmPassword: true,
      mobileNumber: true,
    });

    if (!isConfigured) {
      toast.error('App is not configured. Environment variables are missing.');
      return;
    }

    if (!isFormValid()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password);
      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message);
      } else {
        // Create user profile with additional data
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await supabase.from('user_profiles').upsert({
            user_id: authData.user.id,
            full_name: formData.fullName.trim(),
            mobile_number: formData.mobileNumber || null,
            country: formData.country,
          });
        }
        toast.success('Account created! Check your email to verify your account.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong. Please try again later.');
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
        className="w-full max-w-md space-y-6"
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create an account</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Start managing your warranties today</p>
        </div>

        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-destructive">
              <p className="font-semibold">Backend not configured</p>
              <p className="mt-1">Supabase environment variables are missing.</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-5 sm:p-8 rounded-xl border border-border shadow-lg">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={getFieldError('fullName') ? 'border-destructive' : ''}
              required
              aria-describedby={getFieldError('fullName') ? 'fullName-error' : undefined}
            />
            {getFieldError('fullName') && (
              <p id="fullName-error" className="text-sm text-destructive" role="alert">{getFieldError('fullName')}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldError('email') ? 'border-destructive' : ''}
              required
              aria-describedby={getFieldError('email') ? 'email-error' : undefined}
            />
            {getFieldError('email') && (
              <p id="email-error" className="text-sm text-destructive" role="alert">{getFieldError('email')}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              onBlur={() => handleBlur('mobileNumber')}
              className={getFieldError('mobileNumber') ? 'border-destructive' : ''}
              aria-describedby={getFieldError('mobileNumber') ? 'mobile-error' : undefined}
            />
            {getFieldError('mobileNumber') && (
              <p id="mobile-error" className="text-sm text-destructive" role="alert">{getFieldError('mobileNumber')}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`pr-10 ${getFieldError('password') ? 'border-destructive' : ''}`}
                required
                aria-describedby="password-requirements"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= level
                          ? level <= 2
                            ? 'bg-destructive'
                            : level === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <ul id="password-requirements" className="text-xs space-y-1">
                  {passwordStrength.feedback.map((item, i) => (
                    <li key={i} className="flex items-center gap-1 text-muted-foreground">
                      <X className="h-3 w-3 text-destructive" />
                      {item}
                    </li>
                  ))}
                  {passwordStrength.isValid && (
                    <li className="flex items-center gap-1 text-green-500">
                      <Check className="h-3 w-3" />
                      Password meets requirements
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`pr-10 ${getFieldError('confirmPassword') ? 'border-destructive' : ''}`}
                required
                aria-describedby={getFieldError('confirmPassword') ? 'confirm-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {getFieldError('confirmPassword') && (
              <p id="confirm-error" className="text-sm text-destructive" role="alert">{getFieldError('confirmPassword')}</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 h-11 text-base"
            disabled={loading || !isConfigured}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <SocialLoginButtons disabled={loading} />

          <p className="text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
