-- FINAL CLEANUP & OPTIMIZATION v2
-- 1. DROP DUPLICATE INDEXES (Supabase spotted existing ones)
-- We remove the 'new' short-named ones or the 'old' verbose ones to keep it clean.
DROP INDEX IF EXISTS idx_gallery_images_category;
DROP INDEX IF EXISTS idx_gallery_images_created_at;
DROP INDEX IF EXISTS idx_gallery_images_views;
-- Ensure our standardized names exist (idempotent)
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_views ON gallery_images(views DESC);

-- 2. FIX RLS AUTH CACHING (The Linter is VERY strict)
-- The Linter wants (SELECT auth.uid()) even inside complex logic.

-- Gallery: Read
DROP POLICY IF EXISTS "Unified Read Access" ON gallery_images;
CREATE POLICY "Unified Read Access"
ON gallery_images FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = gallery_images.author_id
    AND profiles.is_public = true
  ))
  OR
  (author_id = (SELECT auth.uid()::text)) -- Explicit select
);

-- Gallery: Insert
DROP POLICY IF EXISTS "Owner Insert" ON gallery_images;
CREATE POLICY "Owner Insert"
ON gallery_images FOR INSERT
WITH CHECK (
  author_id = (SELECT auth.uid()::text)
);

-- Gallery: Update
DROP POLICY IF EXISTS "Owner Update" ON gallery_images;
CREATE POLICY "Owner Update"
ON gallery_images FOR UPDATE
USING (
  author_id = (SELECT auth.uid()::text)
);

-- Gallery: Delete
DROP POLICY IF EXISTS "Owner Delete" ON gallery_images;
CREATE POLICY "Owner Delete"
ON gallery_images FOR DELETE
USING (
  author_id = (SELECT auth.uid()::text)
);

-- Profiles: Insert
DROP POLICY IF EXISTS "Owner Insert" ON profiles;
CREATE POLICY "Owner Insert"
ON profiles FOR INSERT
WITH CHECK (
  id = (SELECT auth.uid()::text)
);

-- Profiles: Update
DROP POLICY IF EXISTS "Owner Update" ON profiles;
CREATE POLICY "Owner Update"
ON profiles FOR UPDATE
USING (
  id = (SELECT auth.uid()::text)
);
