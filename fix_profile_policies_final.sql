-- 🔥 GLOBAL RESET & FIX for Profile Permissions 🔥
-- This script will wipe strict policies and rebuild them correctly to solve 401/500 errors.

-- 1. Reset: Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can always view their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id or admin status" ON profiles;
DROP POLICY IF EXISTS "Enable update for users and admins" ON profiles;

-- 2. Security Function: Ensure is_admin exists and is safe (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SELECT Policy (Viewing)
-- Everyone can view Public profiles.
-- Users can view their OWN profile (even if private).
-- Admins can view ALL profiles.
CREATE POLICY "Visualize Profiles"
ON profiles
FOR SELECT
USING (
    is_public = true          -- Public profiles
    OR
    auth.uid()::text = id     -- Own profile
    OR
    is_admin()                -- Admin access
);

-- 4. UPDATE Policy (Editing)
-- Users can edit their OWN profile.
-- Admins can edit ANY profile.
CREATE POLICY "Edit Profiles"
ON profiles
FOR UPDATE
USING (
    auth.uid()::text = id     -- Own profile
    OR
    is_admin()                -- Admin access
);

-- 5. INSERT Policy (Signup)
-- Allow users to insert their own profile during signup.
CREATE POLICY "Insert Profile"
ON profiles
FOR INSERT
WITH CHECK (
    auth.uid()::text = id
);

-- ⚠️ Verification: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
