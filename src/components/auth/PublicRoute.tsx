import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Route guard for public-only pages (login, register, forgot-password).
 * Redirects authenticated users to the dashboard.
 */
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
