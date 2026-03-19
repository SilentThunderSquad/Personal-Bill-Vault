-- =============================================
-- Add vendor_name, bill_number and update file URL column
-- Migration: 001_add_vendor_bill_fields.sql
-- =============================================

-- Add vendor_name field to bills table
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Add bill_number field to bills table
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS bill_number TEXT;

-- Rename bill_image_url to bill_file_url to support both images and PDFs
-- This is handled as a safe migration that preserves existing data
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
    END IF;
END
$$;

-- Add indexes for the new fields to improve query performance
CREATE INDEX IF NOT EXISTS idx_bills_vendor_name ON public.bills(vendor_name);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON public.bills(bill_number);

-- Update existing bills to populate vendor_name from store_name where vendor_name is null
UPDATE public.bills
SET vendor_name = store_name
WHERE vendor_name IS NULL AND store_name IS NOT NULL;