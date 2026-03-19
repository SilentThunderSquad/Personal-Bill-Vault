import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { UsersManagement } from './pages/UsersManagement';
import { BillsManagement } from './pages/BillsManagement';
import { SystemAnalytics } from './pages/SystemAnalytics';
import { ActivityLogs } from './pages/ActivityLogs';
import { StorageManagement } from './pages/StorageManagement';
import { Settings } from './pages/Settings';
import { AdminLayout } from './components/layout/AdminLayout';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased admin-panel">
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Public route - Admin login */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected admin routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/bills" element={<BillsManagement />} />
                <Route path="/analytics" element={<SystemAnalytics />} />
                <Route path="/activity" element={<ActivityLogs />} />
                <Route path="/storage" element={<StorageManagement />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        expand={true}
        closeButton
      />
    </div>
  );
}

export default App;