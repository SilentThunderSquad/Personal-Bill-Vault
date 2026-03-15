-- =============================================
-- Personal Bill Vault - Storage Policies
-- Run this in Supabase SQL Editor
-- =============================================

-- NOTE: The 'avatars' bucket must be created manually first in the
-- Supabase Dashboard > Storage section. Make sure it's set to PUBLIC.

-- 1. AVATARS BUCKET POLICIES

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. BILL-IMAGES BUCKET POLICIES (if not already created)

-- Allow authenticated users to upload their own bill images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Users can upload own bill images'
  ) THEN
    CREATE POLICY "Users can upload own bill images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'bill-images'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow anyone to view bill images (if public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Anyone can view bill images'
  ) THEN
    CREATE POLICY "Anyone can view bill images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'bill-images');
  END IF;
END $$;

-- Allow users to delete their own bill images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Users can delete own bill images'
  ) THEN
    CREATE POLICY "Users can delete own bill images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'bill-images'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
