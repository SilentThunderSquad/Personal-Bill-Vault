-- =============================================
-- PERSONAL BILL VAULT - USER SYSTEM
-- Complete user-facing database schema for fresh Supabase projects
-- Run this file FIRST on a fresh Supabase project
-- =============================================

-- =============================================
-- 1. CORE USER TABLES
-- =============================================

-- User Profile Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile_number TEXT,
  country TEXT DEFAULT 'India',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Admin management fields (will be used by admin system)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,
  suspended_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

-- Bills Table (main invoice/receipt storage)
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand TEXT,
  purchase_date DATE NOT NULL,
  warranty_period_months INTEGER NOT NULL DEFAULT 12,
  warranty_expiry DATE NOT NULL,
  invoice_number TEXT,
  store_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  bill_file_url TEXT, -- Supports both images and PDFs
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Enhanced fields
  vendor_name TEXT,
  bill_number TEXT,
  has_warranty BOOLEAN NOT NULL DEFAULT true
);

-- Notifications Table (warranty alerts and system notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'warranty_expiry',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings Table (user preferences)
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  notify_30_days BOOLEAN NOT NULL DEFAULT true,
  notify_7_days BOOLEAN NOT NULL DEFAULT true,
  notify_1_day BOOLEAN NOT NULL DEFAULT true,
  analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activities Table (activity feed for users)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PERFORMANCE INDEXES
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Bills indexes
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_warranty_expiry ON public.bills(warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_bills_category ON public.bills(category);
CREATE INDEX IF NOT EXISTS idx_bills_user_category ON public.bills(user_id, category);
CREATE INDEX IF NOT EXISTS idx_bills_user_created ON public.bills(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_name ON public.bills(vendor_name);
CREATE INDEX IF NOT EXISTS idx_bills_has_warranty ON public.bills(has_warranty);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_bill_id ON public.notifications(bill_id);

-- User activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id_created ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_entity ON public.user_activities(related_entity_id, related_entity_type);

-- Notification settings indexes
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- =============================================
-- 3. DATA CONSTRAINTS
-- =============================================

-- Bills constraints
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_warranty_period_check;
ALTER TABLE public.bills ADD CONSTRAINT bills_warranty_period_check
  CHECK (warranty_period_months >= 0 AND warranty_period_months <= 240);

ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_price_check;
ALTER TABLE public.bills ADD CONSTRAINT bills_price_check
  CHECK (price >= 0);

-- =============================================
-- 4. FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS bills_updated_at ON public.bills;
CREATE TRIGGER bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile + notification settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _avatar_url TEXT;
BEGIN
  -- Extract name from social providers
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    ''
  );

  -- Extract avatar from social providers
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Create notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, _full_name, _avatar_url)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = CASE
      WHEN COALESCE(TRIM(public.user_profiles.full_name), '') = ''
      THEN EXCLUDED.full_name
      ELSE public.user_profiles.full_name
    END,
    avatar_url = CASE
      WHEN public.user_profiles.avatar_url IS NULL
      THEN EXCLUDED.avatar_url
      ELSE public.user_profiles.avatar_url
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. STORAGE BUCKETS
-- =============================================

-- Create storage buckets for user files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('bill-images', 'bill-images', true, 10485760, ARRAY['image/jpeg','image/png','image/jpg','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- 6. ROW LEVEL SECURITY SETUP
-- =============================================

-- Enable RLS on all user tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. USER RLS POLICIES (Standard User Access)
-- =============================================

-- User profiles policies (users can only access their own profile)
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
CREATE POLICY "Users can select own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bills policies (users can only access their own bills)
DROP POLICY IF EXISTS "Users can select own bills" ON public.bills;
CREATE POLICY "Users can select own bills"
  ON public.bills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;
CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies (users can only access their own notifications)
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
CREATE POLICY "Users can select own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Notification settings policies (users can only access their own settings)
DROP POLICY IF EXISTS "Users can select own settings" ON public.notification_settings;
CREATE POLICY "Users can select own settings"
  ON public.notification_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.notification_settings;
CREATE POLICY "Users can insert own settings"
  ON public.notification_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.notification_settings;
CREATE POLICY "Users can update own settings"
  ON public.notification_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User activities policies (users can only access their own activities)
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities"
  ON public.user_activities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities"
  ON public.user_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 8. STORAGE RLS POLICIES
-- =============================================

-- Drop all existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Bill images storage policies
CREATE POLICY "Users can upload own bill images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view bill images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'bill-images');

CREATE POLICY "Users can update own bill images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own bill images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatar storage policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- 9. GRANTS & PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- 10. TABLE COMMENTS & DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information linked to Supabase auth.users';
COMMENT ON TABLE public.bills IS 'User invoices and receipts with warranty tracking functionality';
COMMENT ON TABLE public.notifications IS 'User notification system for warranty alerts and system messages';
COMMENT ON TABLE public.notification_settings IS 'User preferences for notification delivery and frequency';
COMMENT ON TABLE public.user_activities IS 'User activity feed and audit trail for user actions';

COMMENT ON COLUMN public.user_profiles.status IS 'User account status managed by admin system';
COMMENT ON COLUMN public.bills.has_warranty IS 'Indicates whether the product has an active warranty period';
COMMENT ON COLUMN public.bills.bill_file_url IS 'URL to the stored bill file (image or PDF)';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
  RAISE NOTICE 'PERSONAL BILL VAULT - USER SYSTEM';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All user tables created successfully';
  RAISE NOTICE '✅ All indexes and constraints applied';
  RAISE NOTICE '✅ All RLS policies configured';
  RAISE NOTICE '✅ Storage buckets configured';
  RAISE NOTICE '✅ Triggers and functions installed';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEP: Run admin.sql to add admin functionality';
  RAISE NOTICE '';
  RAISE NOTICE 'Core Tables Created:';
  RAISE NOTICE '- user_profiles (user data)';
  RAISE NOTICE '- bills (invoice/receipt storage)';
  RAISE NOTICE '- notifications (warranty alerts)';
  RAISE NOTICE '- notification_settings (user preferences)';
  RAISE NOTICE '- user_activities (activity tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage Buckets Created:';
  RAISE NOTICE '- bill-images (for bill files)';
  RAISE NOTICE '- avatars (for user avatars)';
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
END
$$;