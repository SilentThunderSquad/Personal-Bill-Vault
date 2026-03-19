-- =============================================
-- DATABASE DIAGNOSTIC - Check current state
-- Run this to see what columns exist and what needs to be fixed
-- =============================================

SELECT 'BILLS TABLE COLUMNS:' as diagnostic_section;

-- Check bills table columns
SELECT
  column_name,
  data_type,
  CASE
    WHEN column_name = 'bill_image_url' THEN 'OLD - Should be migrated to bill_file_url'
    WHEN column_name = 'bill_file_url' THEN 'NEW - Correct column'
    WHEN column_name = 'vendor_name' THEN 'REQUIRED - Added in migrations'
    WHEN column_name = 'has_warranty' THEN 'REQUIRED - Added in migrations'
    ELSE 'Standard column'
  END as status
FROM information_schema.columns
WHERE table_name = 'bills'
AND table_schema = 'public'
AND column_name IN ('bill_image_url', 'bill_file_url', 'product_name', 'price', 'vendor_name', 'has_warranty')
ORDER BY
  CASE column_name
    WHEN 'product_name' THEN 1
    WHEN 'price' THEN 2
    WHEN 'bill_image_url' THEN 3
    WHEN 'bill_file_url' THEN 4
    WHEN 'vendor_name' THEN 5
    WHEN 'has_warranty' THEN 6
  END;

SELECT 'USER_PROFILES TABLE COLUMNS:' as diagnostic_section;

-- Check user_profiles table columns
SELECT
  column_name,
  data_type,
  CASE
    WHEN column_name = 'status' THEN 'ADMIN - Required for admin system'
    WHEN column_name = 'suspended_at' THEN 'ADMIN - Required for admin system'
    WHEN column_name = 'suspended_reason' THEN 'ADMIN - Required for admin system'
    WHEN column_name = 'suspended_by' THEN 'ADMIN - Required for admin system'
    WHEN column_name = 'deleted_at' THEN 'ADMIN - Required for admin system'
    ELSE 'Standard column'
  END as status
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND table_schema = 'public'
AND column_name IN ('user_id', 'full_name', 'status', 'suspended_at', 'suspended_reason', 'suspended_by', 'deleted_at')
ORDER BY
  CASE column_name
    WHEN 'user_id' THEN 1
    WHEN 'full_name' THEN 2
    WHEN 'status' THEN 3
    WHEN 'suspended_at' THEN 4
    WHEN 'suspended_reason' THEN 5
    WHEN 'suspended_by' THEN 6
    WHEN 'deleted_at' THEN 7
  END;

SELECT 'MIGRATION STATUS CHECK:' as diagnostic_section;

-- Check what needs to be done
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_image_url' AND table_schema = 'public')
      THEN 'NEEDS MIGRATION: bill_image_url column still exists'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_file_url' AND table_schema = 'public')
      THEN 'NEEDS MIGRATION: bill_file_url column missing'
    ELSE 'OK: Bill file columns properly migrated'
  END as bill_columns_status;

SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status' AND table_schema = 'public')
      THEN 'NEEDS FIX: Admin columns missing from user_profiles'
    ELSE 'OK: Admin columns exist in user_profiles'
  END as admin_columns_status;

SELECT 'RECOMMENDED ACTION:' as diagnostic_section;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_image_url' AND table_schema = 'public')
      OR NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status' AND table_schema = 'public')
      THEN 'RUN: fix_columns.sql (then admin.sql)'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_file_url' AND table_schema = 'public')
      THEN 'RUN: fix_columns.sql (then admin.sql)'
    ELSE 'RUN: admin.sql (should work now)'
  END as recommended_action;