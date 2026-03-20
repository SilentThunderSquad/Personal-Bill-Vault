import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AdminProtectedRoute() {
  const { user, loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}