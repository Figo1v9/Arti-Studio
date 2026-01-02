-- FINAL POLISH SCRIPT
-- Resolves the remaining function security issue and optimizes 'profiles' table performance.

-- 1. SECURITY: Fix Mutable Search Path for is_admin
-- This prevents the function from being hijacked by malicious schemas.
ALTER FUNCTION public.is_admin() SET search_path = public;

-- 2. PERFORMANCE: Optimize 'profiles' table policies
-- Just like we did for gallery_images, we cache the auth.uid() call.

-- Profiles: Update Policy
DROP POLICY IF EXISTS "Update Own Profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles; -- Remove if exists under this name
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  id = (select auth.uid()::text) -- CACHED EXECUTION
);

-- Profiles: Select Policy (Public Read)
-- Usually profiles are public, but if you have a "Users see own profile" specific policy:
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
CREATE POLICY "Users can see own profile"
ON profiles FOR SELECT
USING (
  id = (select auth.uid()::text)
);

-- Profiles: Insert Policy
DROP POLICY IF EXISTS "Insert Own Profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (
  id = (select auth.uid()::text)
);
