-- =============================================
-- PERSONAL BILL VAULT - DATABASE VALIDATION
-- Run this script BEFORE admin.sql to check for issues
-- =============================================

-- Check if user.sql was run successfully and migrations completed
DO $$
BEGIN
  -- Check if bills table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bills' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Table bills does not exist. Please run user.sql first.';
  END IF;

  -- Check if user_profiles table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Table user_profiles does not exist. Please run user.sql first.';
  END IF;

  -- Check required columns in bills table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'product_name' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.product_name does not exist. Please ensure user.sql completed successfully.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'price' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.price does not exist. Please ensure user.sql completed successfully.';
  END IF;

  -- Check migration from bill_image_url to bill_file_url
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_image_url' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.bill_image_url still exists. The migration to bill_file_url was not completed. Please run fix_columns.sql or ensure user.sql migration completed.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_file_url' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.bill_file_url does not exist. Please run fix_columns.sql or ensure user.sql migration completed.';
  END IF;

  -- Check vendor_name column was added
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'vendor_name' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.vendor_name does not exist. Please run fix_columns.sql or ensure user.sql completed successfully.';
  END IF;

  -- Check has_warranty column was added
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'has_warranty' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column bills.has_warranty does not exist. Please run fix_columns.sql or ensure user.sql completed successfully.';
  END IF;

  -- Check required columns in user_profiles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column user_profiles.user_id does not exist. Please ensure user.sql completed successfully.';
  END IF;

  -- Check admin management columns in user_profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Column user_profiles.status does not exist. Please run fix_columns.sql first.';
  END IF;

  -- Success message
  RAISE NOTICE 'Database validation passed! All required tables and columns exist.';
  RAISE NOTICE 'You can now run admin.sql safely.';
END
$$;