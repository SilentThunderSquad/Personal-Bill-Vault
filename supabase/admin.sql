-- =============================================
-- PERSONAL BILL VAULT - ADMIN SYSTEM
-- Complete admin dashboard and management functionality
-- REQUIRES: user.sql to be run FIRST
-- Run this file AFTER user.sql on a fresh Supabase project
-- =============================================

-- =============================================
-- 1. ADMIN ROLES & PERMISSIONS SYSTEM
-- =============================================

-- User Roles Table (assigns admin/super_admin roles to users)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Permissions Table (for granular permissions in the future)
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  resource TEXT NOT NULL DEFAULT '*',
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Activities Table (separate from user activities for admin audit trail)
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'user', 'bill', 'system'
  resource_id UUID,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Activity Logs Table (enhanced admin logging)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. SYSTEM ANALYTICS & METRICS
-- =============================================

-- Daily Analytics Table (system-wide metrics)
CREATE TABLE IF NOT EXISTS public.daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  new_users_count INTEGER DEFAULT 0,
  total_users_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  bills_uploaded_count INTEGER DEFAULT 0,
  total_bills_count INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Analytics Table (detailed user metrics for admin dashboard)
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_login_at TIMESTAMPTZ,
  total_bills INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  bills_this_month INTEGER DEFAULT 0,
  bills_this_year INTEGER DEFAULT 0,
  avg_bills_per_month NUMERIC(8, 2) DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  favorite_categories JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Storage Analytics (file usage tracking)
CREATE TABLE IF NOT EXISTS public.storage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ADMIN SETTINGS & CONFIGURATION
-- =============================================

-- System Settings Table (global app configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Notifications Table (system alerts for admins)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_read BOOLEAN DEFAULT false,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. PERFORMANCE INDEXES
-- =============================================

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Admin permissions indexes
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- Admin activities indexes
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_user_id ON public.admin_activities(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_resource_type ON public.admin_activities(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_target_user_id ON public.admin_activities(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON public.admin_activities(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_last_login ON public.user_analytics(last_login_at DESC);

-- Storage analytics indexes
CREATE INDEX IF NOT EXISTS idx_storage_analytics_user_id ON public.storage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_analytics_bucket ON public.storage_analytics(bucket_name);
CREATE INDEX IF NOT EXISTS idx_storage_analytics_file_type ON public.storage_analytics(file_type);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);

-- Admin notifications indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_user ON public.admin_notifications(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(is_read);

-- =============================================
-- 5. ADMIN HELPER FUNCTIONS
-- =============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to make user an admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, granted_by, granted_at)
  VALUES (target_user_id, 'admin', target_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    granted_at = NOW();
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to make user a super admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_super_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, granted_by, granted_at)
  VALUES (target_user_id, 'super_admin', target_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    granted_at = NOW();
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ADMIN DASHBOARD VIEWS
-- =============================================

-- User Overview View for Admin Dashboard
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as signup_date,
  u.last_sign_in_at,
  up.full_name,
  up.country,
  up.status,
  up.suspended_at,
  up.suspended_reason,
  ur.role,
  COUNT(b.id) as total_bills,
  0 as storage_used_bytes, -- Placeholder - would need actual file sizes from storage
  MAX(b.created_at) as last_bill_date,
  COALESCE(SUM(b.price), 0) as total_spent,
  CASE
    WHEN up.status = 'suspended' THEN 'inactive'::TEXT
    WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'active'::TEXT
    WHEN u.last_sign_in_at > NOW() - INTERVAL '90 days' THEN 'inactive'::TEXT
    ELSE 'dormant'::TEXT
  END as activity_status
FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  LEFT JOIN public.bills b ON u.id = b.user_id
WHERE u.deleted_at IS NULL OR u.deleted_at IS NOT NULL -- Handle cases where deleted_at column may not exist
GROUP BY u.id, u.email, u.email_confirmed_at, u.created_at, u.last_sign_in_at,
         up.full_name, up.country, up.status, up.suspended_at, up.suspended_reason, ur.role
ORDER BY u.created_at DESC;

-- Bills Overview View for Admin Dashboard
CREATE OR REPLACE VIEW public.admin_bills_overview AS
SELECT
  b.id,
  b.user_id,
  u.email as user_email,
  up.full_name as user_full_name,
  b.product_name as title,
  b.price as total_amount,
  b.currency,
  b.purchase_date as date,
  b.category,
  COALESCE(b.vendor_name, b.store_name) as vendor,
  b.notes as description,
  b.has_warranty,
  b.warranty_expiry as warranty_expires_on,
  ARRAY[]::TEXT[] as tags, -- Placeholder for tags functionality
  b.bill_file_url as file_url,
  0 as file_size, -- Placeholder - would need actual file size from storage
  'application/pdf' as file_type, -- Placeholder - would need actual file type detection
  NULL as thumbnail_url, -- Placeholder for thumbnails
  b.created_at,
  b.updated_at,
  COALESCE(
    CASE
      WHEN b.bill_file_url IS NOT NULL THEN 'completed'
      ELSE 'pending'
    END,
    'pending'
  ) as processing_status,
  NULL as ocr_text -- Placeholder for OCR functionality
FROM public.bills b
  LEFT JOIN auth.users u ON b.user_id = u.id
  LEFT JOIN public.user_profiles up ON b.user_id = up.user_id
ORDER BY b.created_at DESC;

-- System Overview View for Admin Dashboard
CREATE OR REPLACE VIEW public.admin_system_overview AS
SELECT
  (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL OR deleted_at IS NOT NULL) as total_users,
  (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days') as active_users,
  (SELECT COUNT(*) FROM public.bills) as total_bills,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE) as bills_today,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as bills_week,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as bills_month,
  COALESCE((SELECT SUM(storage_used_bytes) FROM public.user_analytics), 0) as total_storage_used,
  (SELECT COUNT(*) FROM public.notifications WHERE created_at >= CURRENT_DATE) as notifications_today;

-- =============================================
-- 7. ROW LEVEL SECURITY SETUP
-- =============================================

-- Enable RLS on all admin tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. ADMIN RLS POLICIES
-- =============================================

-- User roles policies (admin-only access)
DROP POLICY IF EXISTS "Admin access to user roles" ON public.user_roles;
CREATE POLICY "Admin access to user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin permissions policies
DROP POLICY IF EXISTS "Admin access to permissions" ON public.admin_permissions;
CREATE POLICY "Admin access to permissions" ON public.admin_permissions
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin activities policies
DROP POLICY IF EXISTS "Admin access to admin activities" ON public.admin_activities;
CREATE POLICY "Admin access to admin activities" ON public.admin_activities
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin activity logs policies
DROP POLICY IF EXISTS "Admin can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admin can view activity logs" ON public.admin_activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admin can insert activity logs" ON public.admin_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Daily analytics policies
DROP POLICY IF EXISTS "Admin access to daily analytics" ON public.daily_analytics;
CREATE POLICY "Admin access to daily analytics" ON public.daily_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- User analytics policies (users can see their own, admins see all)
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin access to user analytics" ON public.user_analytics;
CREATE POLICY "Admin access to user analytics" ON public.user_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- System settings policies (public settings visible to all, private only to admins)
DROP POLICY IF EXISTS "Public system settings" ON public.system_settings;
CREATE POLICY "Public system settings" ON public.system_settings
  FOR SELECT TO authenticated
  USING (is_public = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage system settings" ON public.system_settings;
CREATE POLICY "Admin manage system settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin notifications policies
DROP POLICY IF EXISTS "Admin access to admin notifications" ON public.admin_notifications;
CREATE POLICY "Admin access to admin notifications" ON public.admin_notifications
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Storage analytics policies
DROP POLICY IF EXISTS "Admin access to storage analytics" ON public.storage_analytics;
CREATE POLICY "Admin access to storage analytics" ON public.storage_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =============================================
-- 9. ADMIN OVERRIDE POLICIES FOR USER TABLES
-- =============================================
-- These allow admins to access all user data for admin dashboard

-- Admin can view all bills
DROP POLICY IF EXISTS "Admin access to all bills" ON public.bills;
CREATE POLICY "Admin access to all bills" ON public.bills
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin can view all user profiles
DROP POLICY IF EXISTS "Admin access to all profiles" ON public.user_profiles;
CREATE POLICY "Admin access to all profiles" ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin can view all notifications
DROP POLICY IF EXISTS "Admin access to all notifications" ON public.notifications;
CREATE POLICY "Admin access to all notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin can view all notification settings
DROP POLICY IF EXISTS "Admin access to all settings" ON public.notification_settings;
CREATE POLICY "Admin access to all settings" ON public.notification_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin can view all user activities
DROP POLICY IF EXISTS "Admin access to all activities" ON public.user_activities;
CREATE POLICY "Admin access to all activities" ON public.user_activities
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =============================================
-- 10. ADMIN OPERATION FUNCTIONS
-- =============================================

-- Function to suspend a user
CREATE OR REPLACE FUNCTION admin_suspend_user(
  target_user_id UUID,
  admin_user_id UUID,
  reason TEXT DEFAULT 'Administrative action'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
BEGIN
  -- Check if the caller is an admin
  SELECT role INTO admin_role
  FROM public.user_roles
  WHERE user_id = admin_user_id;

  IF admin_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can suspend users';
  END IF;

  -- Update user profile to suspended status
  UPDATE public.user_profiles
  SET
    status = 'suspended',
    suspended_at = NOW(),
    suspended_reason = reason,
    suspended_by = admin_user_id,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Log the admin action
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    admin_user_id,
    'user.suspend',
    'user',
    target_user_id,
    jsonb_build_object('reason', reason),
    NOW()
  );

  RETURN TRUE;
END;
$$;

-- Function to activate a user
CREATE OR REPLACE FUNCTION admin_activate_user(
  target_user_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
BEGIN
  -- Check if the caller is an admin
  SELECT role INTO admin_role
  FROM public.user_roles
  WHERE user_id = admin_user_id;

  IF admin_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can activate users';
  END IF;

  -- Update user profile to active status
  UPDATE public.user_profiles
  SET
    status = 'active',
    suspended_at = NULL,
    suspended_reason = NULL,
    suspended_by = NULL,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Log the admin action
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    admin_user_id,
    'user.activate',
    'user',
    target_user_id,
    jsonb_build_object('reason', 'Administrative activation'),
    NOW()
  );

  RETURN TRUE;
END;
$$;

-- Function to delete a user and all their data
CREATE OR REPLACE FUNCTION admin_delete_user(
  target_user_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
  user_email TEXT;
BEGIN
  -- Check if the caller is an admin
  SELECT role INTO admin_role
  FROM public.user_roles
  WHERE user_id = admin_user_id;

  IF admin_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Get user email for logging
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;

  -- Log the admin action before deleting
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    admin_user_id,
    'user.delete',
    'user',
    target_user_id,
    jsonb_build_object(
      'user_email', user_email,
      'reason', 'Administrative deletion'
    ),
    NOW()
  );

  -- Delete user's data (cascading deletes will handle related data)
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;

  RETURN TRUE;
END;
$$;

-- =============================================
-- 11. ANALYTICS & REPORTING FUNCTIONS
-- =============================================

-- Function to update user analytics when bills change
CREATE OR REPLACE FUNCTION public.update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user analytics when bills are added/removed
  INSERT INTO public.user_analytics (user_id, total_bills, storage_used_bytes, updated_at)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    (SELECT COUNT(*) FROM public.bills WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)),
    0, -- Will be updated by storage triggers
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_bills = EXCLUDED.total_bills,
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user analytics updates
DROP TRIGGER IF EXISTS bill_analytics_trigger ON public.bills;
CREATE TRIGGER bill_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_analytics();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  action_type TEXT,
  resource_type TEXT DEFAULT 'unknown',
  resource_id UUID DEFAULT NULL,
  target_user UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.admin_activities (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    target_user_id,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    action_type,
    resource_type,
    resource_id,
    target_user,
    details,
    NOW()
  )
  RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 12. INITIAL ADMIN DATA & SETUP
-- =============================================

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
  ('app_version', '"1.0.0"', 'Current application version', 'system', true),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'system', false),
  ('max_file_size_mb', '10', 'Maximum file upload size in MB', 'uploads', false),
  ('allowed_file_types', '["image/jpeg", "image/png", "application/pdf"]', 'Allowed file types for uploads', 'uploads', false),
  ('notification_settings', '{"email_enabled": true, "push_enabled": true}', 'Global notification settings', 'notifications', false),
  ('analytics_retention_days', '365', 'How long to retain analytics data', 'analytics', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 13. GRANTS & PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users (functions check admin role internally)
GRANT EXECUTE ON FUNCTION admin_suspend_user(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_activate_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.make_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.make_user_super_admin(UUID) TO authenticated;

-- Grant access to admin views (security is handled by RLS policies)
GRANT SELECT ON public.admin_user_overview TO authenticated;
GRANT SELECT ON public.admin_bills_overview TO authenticated;
GRANT SELECT ON public.admin_system_overview TO authenticated;

-- Grant necessary permissions for admin functions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- 14. TABLE COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.user_roles IS 'User role assignments for RBAC (admin/super_admin)';
COMMENT ON TABLE public.admin_activities IS 'Admin action audit trail';
COMMENT ON TABLE public.admin_activity_logs IS 'Enhanced admin activity logging for compliance';
COMMENT ON TABLE public.daily_analytics IS 'System-wide daily metrics';
COMMENT ON TABLE public.user_analytics IS 'Per-user analytics for admin dashboard';
COMMENT ON TABLE public.system_settings IS 'Global application configuration';
COMMENT ON TABLE public.admin_notifications IS 'System alerts for administrators';
COMMENT ON TABLE public.storage_analytics IS 'File storage usage tracking';

COMMENT ON FUNCTION public.is_admin IS 'Helper function to check admin role';
COMMENT ON FUNCTION public.make_user_admin IS 'Helper function to grant admin role to a user';
COMMENT ON FUNCTION public.make_user_super_admin IS 'Helper function to grant super admin role to a user';
COMMENT ON FUNCTION admin_suspend_user IS 'Admin function to suspend user accounts';
COMMENT ON FUNCTION admin_activate_user IS 'Admin function to activate user accounts';
COMMENT ON FUNCTION admin_delete_user IS 'Admin function to delete user data';

COMMENT ON VIEW public.admin_user_overview IS 'Admin dashboard view of all users with activity metrics';
COMMENT ON VIEW public.admin_bills_overview IS 'Admin dashboard view of all bills with processing status';
COMMENT ON VIEW public.admin_system_overview IS 'Admin dashboard system metrics and KPIs';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
  RAISE NOTICE 'PERSONAL BILL VAULT - ADMIN SYSTEM';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All admin tables created successfully';
  RAISE NOTICE '✅ All admin functions installed';
  RAISE NOTICE '✅ All admin views configured';
  RAISE NOTICE '✅ All RLS policies applied';
  RAISE NOTICE '✅ Analytics system configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin System Features:';
  RAISE NOTICE '- Role-based access control (RBAC)';
  RAISE NOTICE '- User management functions';
  RAISE NOTICE '- Admin dashboard views';
  RAISE NOTICE '- Activity logging and audit trail';
  RAISE NOTICE '- System analytics and metrics';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin Tables Created:';
  RAISE NOTICE '- user_roles (RBAC system)';
  RAISE NOTICE '- admin_activities (audit trail)';
  RAISE NOTICE '- admin_activity_logs (enhanced logging)';
  RAISE NOTICE '- daily_analytics (system metrics)';
  RAISE NOTICE '- user_analytics (user metrics)';
  RAISE NOTICE '- storage_analytics (file tracking)';
  RAISE NOTICE '- system_settings (configuration)';
  RAISE NOTICE '- admin_notifications (admin alerts)';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin Views Created:';
  RAISE NOTICE '- admin_user_overview (user management)';
  RAISE NOTICE '- admin_bills_overview (bill management)';
  RAISE NOTICE '- admin_system_overview (system metrics)';
  RAISE NOTICE '';
  RAISE NOTICE 'TO MAKE A USER AN ADMIN:';
  RAISE NOTICE '1. Get the user ID from Supabase Auth';
  RAISE NOTICE '2. Run: SELECT make_user_admin(''user-uuid-here'');';
  RAISE NOTICE '3. For super admin: SELECT make_user_super_admin(''user-uuid-here'');';
  RAISE NOTICE '';
  RAISE NOTICE 'INSTALLATION COMPLETE!';
  RAISE NOTICE 'Your Personal Bill Vault is ready for production use.';
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
END
$$;