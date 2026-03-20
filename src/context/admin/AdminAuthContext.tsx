import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AdminUser extends User {
  role: 'admin' | 'super_admin';
  permissions?: string[];
}

interface AdminAuthError {
  message: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: AdminAuthError | null }>;
  signOut: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Function to check if user has admin role
  const checkAdminRole = async (userId?: string): Promise<boolean> => {
    try {
      const targetUserId = userId || session?.user?.id;
      if (!targetUserId) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .single();

      if (error || !data) {
        console.log('No admin role found for user:', targetUserId);
        return false;
      }

      const adminRole = data.role;
      const hasAdminRole = adminRole === 'admin' || adminRole === 'super_admin';

      if (hasAdminRole) {
        setIsAdmin(true);
        setIsSuperAdmin(adminRole === 'super_admin');
      }

      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  // Enhanced user object with role information
  const createAdminUser = async (baseUser: User): Promise<AdminUser | null> => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', baseUser.id)
        .single();

      if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
        return null; // Not an admin user
      }

      // Get permissions if needed
      const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('user_id', baseUser.id);

      return {
        ...baseUser,
        role: roleData.role as 'admin' | 'super_admin',
        permissions: permissions?.map(p => p.permission) || []
      };
    } catch (error) {
      console.error('Error creating admin user object:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (initialSession?.user) {
          const hasRole = await checkAdminRole(initialSession.user.id);
          if (hasRole) {
            const adminUser = await createAdminUser(initialSession.user);
            if (adminUser) {
              setUser(adminUser);
              setSession(initialSession);
            } else {
              // User exists but is not admin
              console.log('User does not have admin privileges');
              await supabase.auth.signOut();
            }
          } else {
            // No admin role, sign out
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Admin auth state changed:', event);

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          const hasRole = await checkAdminRole(session.user.id);

          if (hasRole) {
            const adminUser = await createAdminUser(session.user);
            if (adminUser) {
              setUser(adminUser);
              setSession(session);
            } else {
              console.log('Failed to create admin user object');
              await supabase.auth.signOut();
            }
          } else {
            console.log('User authenticated but does not have admin role');
            await supabase.auth.signOut();
          }
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithProvider = async (provider: 'google' | 'github'): Promise<{ error: AdminAuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSuperAdmin,
        signInWithProvider,
        signOut,
        checkAdminRole
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}