-- 🔥🔥 FINAL FIX: AUTH HEADER STRATEGY 🔥🔥
-- This script updates the RLS policies to respect the X-Firebase-ID header.
-- This bridges the gap between the Client (sending the header) and the DB.

-- 1. Reset Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can always view their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id or admin status" ON profiles;
DROP POLICY IF EXISTS "Enable update for users and admins" ON profiles;
DROP POLICY IF EXISTS "Visualize Profiles" ON profiles;
DROP POLICY IF EXISTS "Edit Profiles" ON profiles;
DROP POLICY IF EXISTS "Insert Profile" ON profiles;

-- 2. Enhanced Admin Function (Check Header OR Auth UID)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_id text;
BEGIN
  -- Try to get ID from Header, fallback to auth.uid()
  current_id := COALESCE(
    current_setting('request.headers', true)::json->>'X-Firebase-ID',
    auth.uid()::text
  );

  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = current_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. SELECT Policy (Viewing)
CREATE POLICY "Visualize Profiles"
ON profiles
FOR SELECT
USING (
    is_public = true          -- Public profiles
    OR
    id = COALESCE(current_setting('request.headers', true)::json->>'X-Firebase-ID', auth.uid()::text) -- Own profile
    OR
    is_admin()                -- Admin access
);

-- 4. UPDATE Policy (Editing)
CREATE POLICY "Edit Profiles"
ON profiles
FOR UPDATE
USING (
    id = COALESCE(current_setting('request.headers', true)::json->>'X-Firebase-ID', auth.uid()::text) -- Own profile
    OR
    is_admin()                -- Admin access
);

-- 5. INSERT Policy (Signup)
CREATE POLICY "Insert Profile"
ON profiles
FOR INSERT
WITH CHECK (
    id = COALESCE(current_setting('request.headers', true)::json->>'X-Firebase-ID', auth.uid()::text)
);
