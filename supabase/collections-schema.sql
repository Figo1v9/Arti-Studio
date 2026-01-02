-- =====================================
-- COLLECTIONS FEATURE
-- Run this in Supabase SQL Editor
-- =====================================

-- 1. Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique slug per user
    UNIQUE(user_id, slug)
);

-- 2. Create collection_images junction table
CREATE TABLE IF NOT EXISTS public.collection_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.gallery_images(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order INTEGER DEFAULT 0,
    
    -- Prevent duplicate images in same collection
    UNIQUE(collection_id, image_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON public.collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_image_id ON public.collection_images(image_id);

-- 4. Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for collections

-- Anyone can view public collections
CREATE POLICY "collections_public_read" ON public.collections
FOR SELECT TO public
USING (is_public = true);

-- Owner can view their own collections (including private)
CREATE POLICY "collections_owner_read" ON public.collections
FOR SELECT TO authenticated
USING (user_id = (select auth.uid())::text);

-- Owner can create collections
CREATE POLICY "collections_owner_insert" ON public.collections
FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid())::text);

-- Owner can update their collections
CREATE POLICY "collections_owner_update" ON public.collections
FOR UPDATE TO authenticated
USING (user_id = (select auth.uid())::text)
WITH CHECK (user_id = (select auth.uid())::text);

-- Owner can delete their collections
CREATE POLICY "collections_owner_delete" ON public.collections
FOR DELETE TO authenticated
USING (user_id = (select auth.uid())::text);

-- 6. RLS Policies for collection_images

-- Anyone can view images in public collections
CREATE POLICY "collection_images_public_read" ON public.collection_images
FOR SELECT TO public
USING (
    EXISTS (
        SELECT 1 FROM public.collections c 
        WHERE c.id = collection_id AND c.is_public = true
    )
);

-- Owner can view images in their collections
CREATE POLICY "collection_images_owner_read" ON public.collection_images
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.collections c 
        WHERE c.id = collection_id AND c.user_id = (select auth.uid())::text
    )
);

-- Owner can add images to their collections
CREATE POLICY "collection_images_owner_insert" ON public.collection_images
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.collections c 
        WHERE c.id = collection_id AND c.user_id = (select auth.uid())::text
    )
);

-- Owner can remove images from their collections
CREATE POLICY "collection_images_owner_delete" ON public.collection_images
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.collections c 
        WHERE c.id = collection_id AND c.user_id = (select auth.uid())::text
    )
);

-- 7. Function to update image_count automatically
CREATE OR REPLACE FUNCTION update_collection_image_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collections 
        SET image_count = image_count + 1, updated_at = NOW()
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collections 
        SET image_count = GREATEST(0, image_count - 1), updated_at = NOW()
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger
DROP TRIGGER IF EXISTS trigger_update_collection_image_count ON public.collection_images;
CREATE TRIGGER trigger_update_collection_image_count
AFTER INSERT OR DELETE ON public.collection_images
FOR EACH ROW EXECUTE FUNCTION update_collection_image_count();

-- 9. Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_collection_slug(p_name TEXT, p_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with dashes, remove special chars
    base_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- If empty, use 'collection'
    IF base_slug = '' THEN
        base_slug := 'collection';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add number if needed
    WHILE EXISTS (
        SELECT 1 FROM public.collections 
        WHERE user_id = p_user_id AND slug = final_slug
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Done!
-- Now you can create collections and add images to them.
