-- Add user activities table for tracking user actions
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_title text NOT NULL,
  activity_description text,
  related_entity_id uuid, -- Could be bill_id, profile_id, etc.
  related_entity_type text, -- 'bill', 'profile', etc.
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS user_activities_user_id_created_at_idx
  ON public.user_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_activities_entity_idx
  ON public.user_activities(related_entity_id, related_entity_type);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activities
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;

CREATE POLICY "Users can view own activities"
  ON public.user_activities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.user_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: No updated_at trigger needed for activity logs (immutable records)