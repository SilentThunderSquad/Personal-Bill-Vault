-- Admin RPC functions for user management operations
-- These functions should only be callable by admin users

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

  -- Delete user's bills
  DELETE FROM public.bills WHERE user_id = target_user_id;

  -- Delete user's notifications
  DELETE FROM public.notifications WHERE user_id = target_user_id;

  -- Delete user profile
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;

  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

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

  -- Note: Deleting from auth.users requires superuser privileges
  -- This should be done via a separate process or API call

  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
-- The functions will check admin role internally
GRANT EXECUTE ON FUNCTION admin_suspend_user(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_activate_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, UUID) TO authenticated;

-- Create admin activity logs table if it doesn't exist
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

-- Add RLS policy for admin activity logs
CREATE POLICY "Admin can view activity logs" ON public.admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Add missing columns to user_profiles if they don't exist
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update admin_user_overview view to include status
DROP VIEW IF EXISTS public.admin_user_overview;
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
  COALESCE(SUM(b.file_size), 0) as storage_used_bytes,
  MAX(b.created_at) as last_login_at,
  COALESCE(SUM(b.total_amount), 0) as total_spent,
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
GROUP BY u.id, u.email, u.email_confirmed_at, u.created_at, u.last_sign_in_at,
         up.full_name, up.country, up.status, up.suspended_at, up.suspended_reason, ur.role
ORDER BY u.created_at DESC;