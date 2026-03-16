import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured, getFriendlyAuthError } from '@/services/supabase';
import type { User, Session, Provider } from '@supabase/supabase-js';

interface AuthError {
  message: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      // Network error during initial session check - don't block the app
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: { message: getFriendlyAuthError(error.message) } };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message: getFriendlyAuthError(msg) } };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: { message: getFriendlyAuthError(error.message) } };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message: getFriendlyAuthError(msg) } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout errors
    }
  };

  const signInWithProvider = async (provider: Provider): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) return { error: { message: getFriendlyAuthError(error.message) } };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message: getFriendlyAuthError(msg) } };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) return { error: { message: getFriendlyAuthError(error.message) } };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message: getFriendlyAuthError(msg) } };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: { message: getFriendlyAuthError(error.message) } };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message: getFriendlyAuthError(msg) } };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isConfigured: isSupabaseConfigured, signIn, signUp, signInWithProvider, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
