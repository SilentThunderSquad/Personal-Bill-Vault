-- ============================================================================
-- BILL VAULT ADMIN SYSTEM DATABASE EXTENSIONS
-- This migration adds admin functionality to the existing Bill Vault database
-- ============================================================================

-- ============================================================================
-- 1. ADMIN ROLES & PERMISSIONS SYSTEM
-- ============================================================================

-- User Roles Table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- ============================================================================
-- 2. ADMIN ACTIVITY TRACKING
-- ============================================================================

-- Admin Activities Table (separate from user activities)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_user_id ON public.admin_activities(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_resource_type ON public.admin_activities(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_target_user_id ON public.admin_activities(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON public.admin_activities(created_at DESC);

-- ============================================================================
-- 3. SYSTEM ANALYTICS & METRICS
-- ============================================================================

-- Daily Analytics Table
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

-- User Analytics Table (for detailed user metrics)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_last_login ON public.user_analytics(last_login_at DESC);

-- ============================================================================
-- 4. ADMIN SETTINGS & CONFIGURATION
-- ============================================================================

-- System Settings Table
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

-- Admin Notifications Table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_user ON public.admin_notifications(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(is_read);

-- ============================================================================
-- 5. STORAGE ANALYTICS
-- ============================================================================

-- File Storage Analytics
CREATE TABLE IF NOT EXISTS public.storage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_storage_analytics_user_id ON public.storage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_analytics_bucket ON public.storage_analytics(bucket_name);
CREATE INDEX IF NOT EXISTS idx_storage_analytics_file_type ON public.storage_analytics(file_type);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all admin tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_analytics ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Admin access to user roles" ON public.user_roles;
CREATE POLICY "Admin access to user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for admin_permissions
DROP POLICY IF EXISTS "Admin access to permissions" ON public.admin_permissions;
CREATE POLICY "Admin access to permissions" ON public.admin_permissions
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for admin_activities
DROP POLICY IF EXISTS "Admin access to admin activities" ON public.admin_activities;
CREATE POLICY "Admin access to admin activities" ON public.admin_activities
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for daily_analytics
DROP POLICY IF EXISTS "Admin access to daily analytics" ON public.daily_analytics;
CREATE POLICY "Admin access to daily analytics" ON public.daily_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for user_analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin access to user analytics" ON public.user_analytics;
CREATE POLICY "Admin access to user analytics" ON public.user_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for system_settings
DROP POLICY IF EXISTS "Public system settings" ON public.system_settings;
CREATE POLICY "Public system settings" ON public.system_settings
  FOR SELECT TO authenticated
  USING (is_public = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage system settings" ON public.system_settings;
CREATE POLICY "Admin manage system settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for admin_notifications
DROP POLICY IF EXISTS "Admin access to admin notifications" ON public.admin_notifications;
CREATE POLICY "Admin access to admin notifications" ON public.admin_notifications
  FOR ALL TO authenticated
  USING (public.is_admin());

-- RLS Policies for storage_analytics
DROP POLICY IF EXISTS "Admin access to storage analytics" ON public.storage_analytics;
CREATE POLICY "Admin access to storage analytics" ON public.storage_analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 7. TRIGGERS FOR AUTOMATED ANALYTICS
-- ============================================================================

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

-- Triggers for user analytics updates
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

-- ============================================================================
-- 8. INITIAL DATA & SETUP
-- ============================================================================

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
  ('app_version', '"1.0.0"', 'Current application version', 'system', true),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'system', false),
  ('max_file_size_mb', '10', 'Maximum file upload size in MB', 'uploads', false),
  ('allowed_file_types', '["image/jpeg", "image/png", "application/pdf"]', 'Allowed file types for uploads', 'uploads', false),
  ('notification_settings', '{"email_enabled": true, "push_enabled": true}', 'Global notification settings', 'notifications', false),
  ('analytics_retention_days', '365', 'How long to retain analytics data', 'analytics', false)
ON CONFLICT (key) DO NOTHING;

-- Create initial super admin role (Note: Replace with actual admin user ID)
-- This should be manually updated with the actual admin user ID after deployment
INSERT INTO public.user_roles (user_id, role, granted_by, granted_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- PLACEHOLDER: Replace with actual admin user ID
  'super_admin',
  '00000000-0000-0000-0000-000000000000', -- PLACEHOLDER: Replace with actual admin user ID
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 9. VIEWS FOR ADMIN DASHBOARD
-- ============================================================================

-- User Overview View
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as signup_date,
  u.last_sign_in_at,
  up.full_name,
  up.country,
  ur.role,
  ua.total_bills,
  ua.storage_used_bytes,
  ua.last_login_at,
  ua.total_spent,
  CASE
    WHEN u.last_sign_in_at > NOW() - INTERVAL '7 days' THEN 'active'
    WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'inactive'
    ELSE 'dormant'
  END as activity_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.user_analytics ua ON u.id = ua.user_id
WHERE u.deleted_at IS NULL;

-- System Overview View
CREATE OR REPLACE VIEW public.admin_system_overview AS
SELECT
  (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days') as active_users,
  (SELECT COUNT(*) FROM public.bills) as total_bills,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE) as bills_today,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as bills_week,
  (SELECT COUNT(*) FROM public.bills WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as bills_month,
  (SELECT COALESCE(SUM(storage_used_bytes), 0) FROM public.user_analytics) as total_storage_used,
  (SELECT COUNT(*) FROM public.notifications WHERE created_at >= CURRENT_DATE) as notifications_today;

-- ============================================================================
-- 10. FUNCTIONS FOR ADMIN OPERATIONS
-- ============================================================================

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION public.get_user_activity_summary(target_user_id UUID)
RETURNS TABLE (
  activity_date DATE,
  bill_count INTEGER,
  login_count INTEGER,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(ua.created_at) as activity_date,
    COALESCE(bill_counts.count, 0) as bill_count,
    COALESCE(login_counts.count, 0) as login_count,
    MAX(ua.created_at) as last_activity
  FROM public.user_activities ua
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM public.bills
    WHERE user_id = target_user_id
    GROUP BY DATE(created_at)
  ) bill_counts ON DATE(ua.created_at) = bill_counts.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM public.user_activities
    WHERE user_id = target_user_id AND activity_type = 'user_login'
    GROUP BY DATE(created_at)
  ) login_counts ON DATE(ua.created_at) = login_counts.date
  WHERE ua.user_id = target_user_id
  GROUP BY DATE(ua.created_at), bill_counts.count, login_counts.count
  ORDER BY activity_date DESC
  LIMIT 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;