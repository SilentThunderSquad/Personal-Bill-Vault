-- =============================================
-- Personal Bill Vault - Complete Database Setup
-- Run this ONCE in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- =============================================


-- =============================================
-- 1. TABLES
-- =============================================

-- Bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand TEXT,
  purchase_date DATE NOT NULL,
  warranty_period_months INTEGER NOT NULL DEFAULT 12,
  warranty_expiry DATE NOT NULL,
  invoice_number TEXT,
  store_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  bill_image_url TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'warranty_expiry',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  notify_30_days BOOLEAN NOT NULL DEFAULT true,
  notify_7_days BOOLEAN NOT NULL DEFAULT true,
  notify_1_day BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile_number TEXT,
  country TEXT DEFAULT 'India',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Drop legacy deleted_at column if it exists (app now hard-deletes)
ALTER TABLE public.bills DROP COLUMN IF EXISTS deleted_at;


-- =============================================
-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_warranty_expiry ON public.bills(warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_bills_category ON public.bills(category);
CREATE INDEX IF NOT EXISTS idx_bills_user_category ON public.bills(user_id, category);
CREATE INDEX IF NOT EXISTS idx_bills_user_created ON public.bills(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);


-- =============================================
-- 3. CONSTRAINTS
-- =============================================

ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_warranty_period_check;
ALTER TABLE public.bills ADD CONSTRAINT bills_warranty_period_check
  CHECK (warranty_period_months >= 0 AND warranty_period_months <= 240);

ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_price_check;
ALTER TABLE public.bills ADD CONSTRAINT bills_price_check
  CHECK (price >= 0);


-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;


-- =============================================
-- 5. RLS POLICIES (drop + recreate for clean state)
-- =============================================

-- Bills policies
DROP POLICY IF EXISTS "Users can select own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;

CREATE POLICY "Users can select own bills"
  ON public.bills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can select own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Notification settings policies
DROP POLICY IF EXISTS "Users can select own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.notification_settings;

CREATE POLICY "Users can select own settings"
  ON public.notification_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.notification_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.notification_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can select own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- =============================================
-- 6. FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bills_updated_at ON public.bills;
CREATE TRIGGER bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile + notification settings on signup
-- Handles both email/password and social login (Google, GitHub)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _avatar_url TEXT;
BEGIN
  -- Extract name: try multiple metadata fields used by different providers
  -- Google: full_name, name  |  GitHub: user_name, name, full_name
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    ''
  );

  -- Extract avatar from social providers
  -- Google: avatar_url, picture  |  GitHub: avatar_url
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Create notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user profile with social data if available
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================
-- 7. STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('bill-images', 'bill-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- =============================================
-- 8. STORAGE POLICIES (drop + recreate for clean state)
-- =============================================

-- Drop all existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bill images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Bill images: upload
CREATE POLICY "Users can upload own bill images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bill images: read (public)
CREATE POLICY "Anyone can view bill images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'bill-images');

-- Bill images: update
CREATE POLICY "Users can update own bill images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bill images: delete
CREATE POLICY "Users can delete own bill images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: upload
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: read (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Avatars: update
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

-- Avatars: delete
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
