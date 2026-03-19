# Database Migration Guide

## Apply Analytics Setting Migration

The analytics feature requires a database schema update. Follow these steps to apply the migration:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the SQL from `supabase/migrations/003_add_analytics_setting.sql`:
   ```sql
   -- Add analytics preferences to notification settings
   ALTER TABLE notification_settings
   ADD COLUMN analytics_enabled boolean DEFAULT true;
   ```
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify Success**
   - You should see "Success. No rows returned"
   - The `analytics_enabled` column has been added to `notification_settings` table

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd C:\Users\vivek\Documents\GitHub\Personal-Bill-Vault

# Apply pending migrations
npx supabase db push

# Or if you have Supabase CLI installed globally
supabase db push
```

### Verification

After applying the migration, verify it worked:

1. Go to Supabase Dashboard → Table Editor
2. Select `notification_settings` table
3. Check that `analytics_enabled` column exists (boolean type, default: true)

### Troubleshooting

**Error: column already exists**
- The migration was already applied. You're good to go!

**Error: permission denied**
- Make sure you're using the correct Supabase project
- Verify you have admin access to the database

**Error: table doesn't exist**
- Run the previous migrations first (001 and 002)
- Check that your database is properly set up

### After Migration

Once the migration is applied:
1. Refresh your application
2. Go to Settings → Analytics section
3. Toggle "Dashboard Analytics" - it should now work without errors!

---

## Previous Migrations

If you haven't run these yet, apply them in order:

1. `001_initial_schema.sql` - Creates core tables
2. `002_add_has_warranty.sql` - Adds warranty toggle field
3. `003_add_analytics_setting.sql` - Adds analytics preference (this migration)