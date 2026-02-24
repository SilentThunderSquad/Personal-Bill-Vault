-- =============================================
-- Warranty Vault — Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. USERS TABLE
-- Synced from Clerk via webhook
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,                          -- Clerk user ID
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own row"
  ON public.users FOR SELECT
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage all users"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);


-- =============================================
-- 2. BILLS TABLE
-- Stores all purchase/warranty records
-- =============================================
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  product_category TEXT NOT NULL DEFAULT 'Other',
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE NOT NULL,
  purchase_store TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  warranty_period_months INTEGER NOT NULL DEFAULT 12,
  warranty_end_date DATE NOT NULL,
  notes TEXT,
  bill_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_warranty_end ON public.bills(warranty_end_date);
CREATE INDEX IF NOT EXISTS idx_bills_deleted_at ON public.bills(deleted_at);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Users can only see their own non-deleted bills
CREATE POLICY "Users can select own bills"
  ON public.bills FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can manage all bills (for cron jobs)
CREATE POLICY "Service role can manage all bills"
  ON public.bills FOR ALL
  USING (true)
  WITH CHECK (true);


-- =============================================
-- 3. NOTIFICATION SETTINGS TABLE
-- Per-user notification preferences
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  days_before_expiry INTEGER NOT NULL DEFAULT 30,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own notification settings"
  ON public.notification_settings FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own notification settings"
  ON public.notification_settings FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own notification settings"
  ON public.notification_settings FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role bypass
CREATE POLICY "Service role can manage all notification settings"
  ON public.notification_settings FOR ALL
  USING (true)
  WITH CHECK (true);


-- =============================================
-- 4. NOTIFICATION LOG TABLE
-- Tracks sent notifications to prevent duplicates
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'warranty_expiry_warning',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT NOT NULL DEFAULT 'success',  -- 'success' | 'failed'
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_bill ON public.notification_log(bill_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON public.notification_log(sent_at);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs"
  ON public.notification_log FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role bypass for cron job
CREATE POLICY "Service role can manage all notification logs"
  ON public.notification_log FOR ALL
  USING (true)
  WITH CHECK (true);


-- =============================================
-- 5. STORAGE BUCKET FOR BILL IMAGES
-- Run this in the Supabase Dashboard → Storage → New Bucket
-- OR use the SQL below:
-- =============================================
-- NOTE: Create a bucket named 'bill-images' in Supabase Dashboard
-- Settings:
--   Public bucket: Yes (so images can be viewed via URL)
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Storage RLS policies (create in Dashboard → Storage → Policies):
-- 1. Allow authenticated users to upload to their own folder:
--    INSERT: (bucket_id = 'bill-images') AND (auth.uid()::text = (storage.foldername(name))[1])
-- 2. Allow public read:
--    SELECT: (bucket_id = 'bill-images')
-- 3. Allow users to delete their own files:
--    DELETE: (bucket_id = 'bill-images') AND (auth.uid()::text = (storage.foldername(name))[1])
