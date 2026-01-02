-- 🚨 IMMEDIATE FIX: DROP RECURSIVE POLICIES
-- This script fixes the "500 Internal Server Error" caused by infinite recursion.

-- 1. First, remove the problematic policies acting like mirrors facing each other
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 2. Create a Secure Function to check Admin status without triggering RLS loops
-- "SECURITY DEFINER" allows this function to peek at the table without being blocked by the policies it's trying to enforce
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

-- 3. Re-apply the Admin permissions using the Safe Function
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (
  is_admin()
);

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  is_admin() OR
  is_public = true OR
  auth.uid()::text = id
);
