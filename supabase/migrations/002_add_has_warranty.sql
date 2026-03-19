-- =============================================
-- Add has_warranty field to bills table
-- Migration: 002_add_has_warranty.sql
-- =============================================

-- Add has_warranty boolean field to bills table (defaults to true for backward compatibility)
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS has_warranty BOOLEAN NOT NULL DEFAULT true;

-- Update existing bills to set has_warranty based on whether they have warranty data
-- Bills with warranty_period_months > 0 are considered to have warranty
UPDATE public.bills
SET has_warranty = (warranty_period_months > 0)
WHERE has_warranty IS NULL;

-- Add index for filtering by warranty status (optional performance optimization)
CREATE INDEX IF NOT EXISTS idx_bills_has_warranty ON public.bills(has_warranty);

-- Add comment to document the field
COMMENT ON COLUMN public.bills.has_warranty IS 'Indicates whether the product has a warranty period';
