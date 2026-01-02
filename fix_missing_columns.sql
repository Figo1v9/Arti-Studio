-- FIX: Ensure essential columns exist in profiles table
-- It seems the 'username' column (and possibly others) might be missing or not recognized.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS email text;

-- Force PostgREST schema cache reload (CRITICAL for API to see new/modified columns)
NOTIFY pgrst, 'reload schema';
