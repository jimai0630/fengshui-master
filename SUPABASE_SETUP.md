# Supabase Configuration Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

## 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase_schema.sql`
5. Click "Run" to execute the schema

## 3. Get API Credentials

1. Go to "Project Settings" → "API"
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Test the Connection

After configuration, the app will:
- ✅ Automatically save consultation results to Supabase
- ✅ Load previous results when user returns (same email + birth info + floor plan)
- ✅ Fall back to localStorage if Supabase is unavailable

## Database Structure

The `consultations` table stores:
- User identification (email, birth_date, gender, house_type)
- Floor plan hash (to detect if user uploaded different images)
- Agent 1 results (layout grid)
- Agent 2 results (energy summary)
- Full report (after payment)
- Payment status

## Key Features

### Smart Caching
- Uses `floor_plans_hash` to detect if user uploaded the same floor plan
- If hash matches, loads cached results instantly
- If hash differs, triggers new analysis

### Dual Storage
- **Supabase**: Persistent cloud storage, accessible across devices
- **localStorage**: Instant local cache, works offline

### Privacy
- Row Level Security (RLS) enabled
- Users can only access their own data
- No authentication required (uses email as identifier)

## Troubleshooting

### "Failed to save to Supabase"
- Check if `.env` variables are set correctly
- Verify Supabase project is active
- Check browser console for detailed error messages

### "No data loaded"
- Ensure email, birth_date, gender, and house_type match exactly
- Check if floor plan files are the same (hash comparison)
- Verify data exists in Supabase dashboard (Table Editor)

## Migration from localStorage

Existing users with localStorage data will:
1. Continue to see their local data
2. Have data automatically synced to Supabase on next save
3. Benefit from cloud backup going forward
