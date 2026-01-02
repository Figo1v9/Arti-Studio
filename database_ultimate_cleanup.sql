-- ULTIMATE CLEANUP & OPTIMIZATION SCRIPT
-- This script replaces ALL multiple/conflicting policies with merged, high-performance versions.
-- It resolves "Multiple Permissive Policies" and "Auth RLS Init Plan" warnings.

-- ==========================================
-- 1. GALLERY IMAGES: CONSOLIDATION
-- ==========================================

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Anyone can insert images" ON gallery_images;
DROP POLICY IF EXISTS "Anyone can update images" ON gallery_images;
DROP POLICY IF EXISTS "Anyone can delete images" ON gallery_images;
DROP POLICY IF EXISTS "Gallery images are viewable by everyone" ON gallery_images;
DROP POLICY IF EXISTS "Public images are visible to everyone" ON gallery_images;
DROP POLICY IF EXISTS "Users can see own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can upload own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can update own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can delete own images" ON gallery_images;

-- 1.1 SELECT (Read): Merge Public + Private visibility
-- Logic: Show if (Owner is Public) OR (Viewer is Owner)
CREATE POLICY "Unified Read Access"
ON gallery_images FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = gallery_images.author_id
    AND profiles.is_public = true
  ))
  OR
  (author_id = (SELECT auth.uid()::text)) -- Optimized Auth Call
);

-- 1.2 INSERT: Owner only
CREATE POLICY "Owner Insert"
ON gallery_images FOR INSERT
WITH CHECK (
  author_id = (SELECT auth.uid()::text)
);

-- 1.3 UPDATE: Owner only
CREATE POLICY "Owner Update"
ON gallery_images FOR UPDATE
USING (
  author_id = (SELECT auth.uid()::text)
);

-- 1.4 DELETE: Owner only
CREATE POLICY "Owner Delete"
ON gallery_images FOR DELETE
USING (
  author_id = (SELECT auth.uid()::text)
);


-- ==========================================
-- 2. PROFILES: CONSOLIDATION
-- ==========================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow Select Profiles" ON profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON profiles;
DROP POLICY IF EXISTS "Insert Own Profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can update profile" ON profiles;
DROP POLICY IF EXISTS "Update Profiles via RPC" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2.1 SELECT: Public Read (Required for fetching author names/avatars)
-- If your app requires reading ALL profiles (for searching users, feeds, etc.), use TRUE.
-- If strict privacy is needed, logic would be more complex.
-- Based on "Allow Select Profiles" existence, we assume public read is intended.
CREATE POLICY "Public Profiles Read"
ON profiles FOR SELECT
USING (true);

-- 2.2 INSERT: Owner only (On signup)
CREATE POLICY "Owner Insert"
ON profiles FOR INSERT
WITH CHECK (
  id = (SELECT auth.uid()::text)
);

-- 2.3 UPDATE: Owner only
CREATE POLICY "Owner Update"
ON profiles FOR UPDATE
USING (
  id = (SELECT auth.uid()::text)
);

-- ==========================================
-- 3. FINAL SECURITY CHECK
-- ==========================================
-- Ensure is_admin is secure (Double check)
ALTER FUNCTION public.is_admin() SET search_path = public;
