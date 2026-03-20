import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// User pages
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bills = lazy(() => import('@/pages/Bills'));
const AddBill = lazy(() => import('@/pages/AddBill'));
const BillDetailPage = lazy(() => import('@/pages/BillDetail'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Legal pages
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));

// Admin pages
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('@/pages/admin/UsersManagement'));
const BillsManagement = lazy(() => import('@/pages/admin/BillsManagement'));
const SystemAnalytics = lazy(() => import('@/pages/admin/SystemAnalytics'));
const ActivityLogs = lazy(() => import('@/pages/admin/ActivityLogs'));
const StorageManagement = lazy(() => import('@/pages/admin/StorageManagement'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

// Admin components
import { AdminProtectedRoute } from '@/components/admin/auth/AdminProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminAuthProvider } from '@/context/admin/AdminAuthContext';

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Auth pages - redirect to dashboard if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/bills/new" element={<AddBill />} />
              <Route path="/bills/:id" element={<BillDetailPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Admin routes with separate auth context */}
          <Route path="/admin/*" element={
            <AdminAuthProvider>
              <Routes>
                {/* Admin login - public within admin context */}
                <Route path="login" element={<AdminLogin />} />

                {/* Protected admin routes */}
                <Route element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="bills" element={<BillsManagement />} />
                    <Route path="analytics" element={<SystemAnalytics />} />
                    <Route path="activity" element={<ActivityLogs />} />
                    <Route path="storage" element={<StorageManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>
              </Routes>
            </AdminAuthProvider>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
