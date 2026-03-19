# Database Migration Guide

## Apply All Pending Migrations

The latest features require database schema updates. Follow these steps to apply all migrations:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Each Migration**
   Apply these migrations in order:

   **Migration 003: Analytics Setting**
   ```sql
   -- Add analytics preferences to notification settings
   ALTER TABLE notification_settings
   ADD COLUMN analytics_enabled boolean DEFAULT true;
   ```

   **Migration 004: User Activities**
   ```sql
   -- Add user activities table for tracking user actions
   CREATE TABLE IF NOT EXISTS public.user_activities (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     activity_type text NOT NULL,
     activity_title text NOT NULL,
     activity_description text,
     related_entity_id uuid,
     related_entity_type text,
     metadata jsonb DEFAULT '{}',
     created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create indexes for performance
   CREATE INDEX IF NOT EXISTS user_activities_user_id_created_at_idx
     ON public.user_activities(user_id, created_at DESC);

   CREATE INDEX IF NOT EXISTS user_activities_entity_idx
     ON public.user_activities(related_entity_id, related_entity_type);

   -- Enable RLS
   ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

   -- RLS policies
   DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
   DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;

   CREATE POLICY "Users can view own activities"
     ON public.user_activities FOR SELECT TO authenticated
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own activities"
     ON public.user_activities FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = user_id);
   ```

4. **Verify Success**
   - Check that new columns/tables exist in your database
   - Verify RLS policies are applied

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
cd C:\Users\vivek\Documents\GitHub\Personal-Bill-Vault

# Apply all pending migrations
npx supabase db push
```

### What's New After Migrations

✅ **Analytics Dashboard** - Visual charts and insights
✅ **User Profile Page** - Dedicated profile management
✅ **Activity Tracking** - Complete user action logging
✅ **Enhanced Settings** - Clean, organized settings page

### Troubleshooting

**Error: column already exists**
- Migration already applied, you're good to go!

**Error: table exists**
- The user_activities table was already created

**Error: permission denied**
- Verify you have admin access to the database

---

## Features Overview

### Dashboard Analytics
- Monthly bill upload trends
- Category distribution charts
- Toggleable via Settings → Analytics

### Profile & Activity System
- **Profile Page** (`/profile`): Complete user profile management
- **Settings Page** (`/settings`): Account security and preferences only
- **Activity Tracking**: All user actions logged automatically
- **Activity Dropdown**: Recent activities in header navigation

### Page Structure Changes
- **Before**: Settings page contained profile information
- **After**: Profile information moved to dedicated `/profile` page
- **Settings**: Now focused only on account settings, notifications, and preferences