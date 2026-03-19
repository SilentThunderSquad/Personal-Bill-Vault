-- Add admin bills overview view
CREATE OR REPLACE VIEW public.admin_bills_overview AS
SELECT
  b.id,
  b.user_id,
  u.email as user_email,
  up.full_name as user_full_name,
  b.title,
  b.total_amount,
  b.currency,
  b.date,
  b.category,
  b.vendor,
  b.description,
  b.has_warranty,
  b.warranty_expires_on,
  b.tags,
  b.file_url,
  b.file_size,
  b.file_type,
  b.thumbnail_url,
  b.created_at,
  b.updated_at,
  COALESCE(
    CASE
      WHEN b.ocr_text IS NOT NULL AND b.ocr_text != '' THEN 'completed'
      WHEN b.file_url IS NOT NULL THEN 'processing'
      ELSE 'pending'
    END,
    'pending'
  ) as processing_status,
  b.ocr_text
FROM public.bills b
  LEFT JOIN auth.users u ON b.user_id = u.id
  LEFT JOIN public.user_profiles up ON b.user_id = up.user_id
ORDER BY b.created_at DESC;

-- Grant access to admin roles
GRANT SELECT ON public.admin_bills_overview TO authenticated;

-- Add RLS policy for admin access only
CREATE POLICY "Admin bills overview access" ON public.admin_bills_overview
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Enable RLS on the view
ALTER VIEW public.admin_bills_overview ENABLE ROW LEVEL SECURITY;