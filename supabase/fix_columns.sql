-- =============================================
-- QUICK FIX - Add missing columns and handle migrations
-- Run this if you get column errors when running admin.sql
-- =============================================

-- Add missing admin management columns to user_profiles table
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'));

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Handle bill_image_url to bill_file_url migration if it wasn't completed
DO $$
BEGIN
    -- Check if the old column exists and new one doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'bills' AND column_name = 'bill_image_url' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'bills' AND column_name = 'bill_file_url' AND table_schema = 'public') THEN
        -- Add the new column
        ALTER TABLE public.bills ADD COLUMN bill_file_url TEXT;

        -- Copy data from old column to new column
        UPDATE public.bills SET bill_file_url = bill_image_url WHERE bill_image_url IS NOT NULL;

        -- Drop the old column
        ALTER TABLE public.bills DROP COLUMN bill_image_url;

        RAISE NOTICE 'Migrated bill_image_url to bill_file_url successfully';
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'bills' AND column_name = 'bill_file_url' AND table_schema = 'public') THEN
        -- If neither column exists, create bill_file_url
        ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS bill_file_url TEXT;
        RAISE NOTICE 'Created bill_file_url column';
    ELSE
        RAISE NOTICE 'bill_file_url column already exists and migration appears complete';
    END IF;
END
$$;

-- Ensure other required columns exist
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS bill_number TEXT;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS has_warranty BOOLEAN NOT NULL DEFAULT true;

-- Verify columns were added successfully
SELECT 'User Profile Columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND table_schema = 'public'
AND column_name IN ('status', 'suspended_at', 'suspended_reason', 'suspended_by', 'deleted_at');

SELECT 'Bills Columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bills'
AND table_schema = 'public'
AND column_name IN ('bill_file_url', 'vendor_name', 'bill_number', 'has_warranty');

-- Success message
SELECT 'All columns fixed successfully! You can now run admin.sql' as message;