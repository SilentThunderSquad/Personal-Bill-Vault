-- =============================================
-- Fix Storage Policies for bill-images bucket
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Ensure the bill-images bucket exists (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bill-images', 'bill-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop ALL existing storage policies for bill-images to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bill images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own bill images" ON storage.objects;

-- Step 3: Recreate clean storage policies

-- INSERT: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own bill images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: Anyone can view bill images (public bucket)
CREATE POLICY "Anyone can view bill images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bill-images');

-- UPDATE: Users can update their own bill images
CREATE POLICY "Users can update own bill images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Users can delete their own bill images
CREATE POLICY "Users can delete own bill images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bill-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
