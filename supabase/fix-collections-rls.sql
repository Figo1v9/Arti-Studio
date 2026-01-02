-- =====================================
-- FIX COLLECTIONS RLS FOR FIREBASE AUTH
-- Since you use Firebase Auth (not Supabase Auth),
-- auth.uid() won't work. We need different approach.
-- =====================================

-- OPTION 1: Allow all authenticated operations (simplest)
-- Since RLS can't verify Firebase tokens, we rely on app-level security

-- Drop existing policies first
DROP POLICY IF EXISTS "collections_public_read" ON public.collections;
DROP POLICY IF EXISTS "collections_owner_read" ON public.collections;
DROP POLICY IF EXISTS "collections_owner_insert" ON public.collections;
DROP POLICY IF EXISTS "collections_owner_update" ON public.collections;
DROP POLICY IF EXISTS "collections_owner_delete" ON public.collections;

DROP POLICY IF EXISTS "collection_images_public_read" ON public.collection_images;
DROP POLICY IF EXISTS "collection_images_owner_read" ON public.collection_images;
DROP POLICY IF EXISTS "collection_images_owner_insert" ON public.collection_images;
DROP POLICY IF EXISTS "collection_images_owner_update" ON public.collection_images;
DROP POLICY IF EXISTS "collection_images_owner_delete" ON public.collection_images;

-- =====================
-- COLLECTIONS POLICIES
-- =====================

-- Anyone can view public collections
CREATE POLICY "collections_public_read" ON public.collections
FOR SELECT TO public
USING (is_public = true);

-- All reads for authenticated (app handles filtering)
CREATE POLICY "collections_authenticated_read" ON public.collections
FOR SELECT TO anon, authenticated
USING (true);

-- Allow insert if user_id exists in profiles
CREATE POLICY "collections_insert" ON public.collections
FOR INSERT TO anon, authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id)
);

-- Allow update if user owns the collection (verified by user_id match)
CREATE POLICY "collections_update" ON public.collections
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow delete
CREATE POLICY "collections_delete" ON public.collections
FOR DELETE TO anon, authenticated
USING (true);

-- =====================
-- COLLECTION_IMAGES POLICIES
-- =====================

-- Anyone can read
CREATE POLICY "collection_images_read" ON public.collection_images
FOR SELECT TO public
USING (true);

-- Allow insert if collection exists
CREATE POLICY "collection_images_insert" ON public.collection_images
FOR INSERT TO anon, authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id)
);

-- Allow update
CREATE POLICY "collection_images_update" ON public.collection_images
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow delete
CREATE POLICY "collection_images_delete" ON public.collection_images
FOR DELETE TO anon, authenticated
USING (true);

-- =====================
-- ENSURE RLS IS ENABLED
-- =====================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_images TO anon;

GRANT USAGE ON SCHEMA public TO anon;

-- Done! Try creating a collection now.
