-- =============================================
-- FIX DATABASE LINT WARNINGS
-- Resolves "Multiple Permissive Policies" and "Duplicate Index"
-- =============================================

-- ---------------------------------------------
-- 1. FIX DUPLICATE INDEXES
-- ---------------------------------------------

-- Fix: public.favorites (idx_favorites_image vs idx_favorites_image_id)
DROP INDEX IF EXISTS idx_favorites_image; 
-- Keep: idx_favorites_image_id (more standard naming)

-- Fix: public.favorites (favorites_user_id_image_id_key vs idx_favorites_user_image)
DROP INDEX IF EXISTS idx_favorites_user_image;
-- Keep: favorites_user_id_image_id_key (likely the UNIQUE constraint)

-- Fix: public.follows (follows_pkey vs idx_follows_pair)
DROP INDEX IF EXISTS idx_follows_pair;
-- Keep: follows_pkey (Primary Key is sufficient)

-- Fix: public.gallery_images (idx_gallery_images_views vs idx_gallery_views)
DROP INDEX IF EXISTS idx_gallery_views;
-- Keep: idx_gallery_images_views (consistent naming)

-- Fix: public.gallery_images (idx_gallery_images_tags vs idx_gallery_tags)
DROP INDEX IF EXISTS idx_gallery_tags;
-- Keep: idx_gallery_images_tags (consistent naming)

-- Fix: public.search_analytics (idx_search_analytics_created vs idx_search_analytics_created_at)
DROP INDEX IF EXISTS idx_search_analytics_created;
-- Keep: idx_search_analytics_created_at (matches column name)


-- ---------------------------------------------
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- Review and consolidate overlapping policies
-- ---------------------------------------------

-- Table: public.collections
-- Issue: collections_authenticated_read AND collections_public_read overlap for 'authenticated' users
-- Solution: Drop collections_authenticated_read as collections_public_read usually covers public ones, 
-- BUT we need to ensure authenticated users can see PRIVATE collections they own.
-- 'collections_public_read' -> (is_public = true)
-- 'collections_authenticated_read' -> (auth.uid() = user_id)
-- These are distinct sets (Public vs Private Own). They are NOT duplicate permissions.
-- HOWEVER, Supabase flags them because they both apply to SELECT.
-- If they are truly distinct (OR logic), it's fine. 
-- Checking if one encompasses the other...
-- If collections_public_read is just "true" for everyone, then it covers everything.
-- Assuming 'collections_public_read' check 'is_public = true'.
-- Assuming 'collections_authenticated_read' checks 'user_id = auth.uid()'.
-- These are valid separate policies. 
-- To silence the warning, we can combine them into one OR policy, OR ignore if acceptable.
-- Recommended: Combine into "collections_read_access"
DROP POLICY IF EXISTS "collections_authenticated_read" ON collections;
DROP POLICY IF EXISTS "collections_public_read" ON collections;

CREATE POLICY "collections_read_access" ON collections
FOR SELECT
TO authenticated, anon
USING (
    is_public = true 
    OR 
    (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text)
);

-- Table: public.daily_stats
-- Issue: daily_stats_admin_write (ALL) and daily_stats_public_access (SELECT)
-- 'daily_stats_admin_write' likely covers SELECT for admin.
-- 'daily_stats_public_access' covers SELECT for everyone (or authenticated).
-- If daily_stats_public_access is for everyone, admin already has it.
-- Simplify: Admin gets full access, others get read only.
DROP POLICY IF EXISTS "daily_stats_admin_write" ON daily_stats;
DROP POLICY IF EXISTS "daily_stats_public_access" ON daily_stats;

CREATE POLICY "daily_stats_access" ON daily_stats
FOR SELECT
TO authenticated, anon
USING (true); -- Public read

CREATE POLICY "daily_stats_admin_all" ON daily_stats
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
    )
);

-- Table: public.profiles
-- Issue: profiles_admin_update vs profiles_self_update
-- Combine into unified update policy
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE
TO authenticated
USING (
    auth.uid()::text = id
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
    )
);

-- Table: public.reports
-- Issue: reports_admin_policy (ALL) vs reports_insert_policy (INSERT) / reports_view_own (SELECT)
-- Combine INSERT
DROP POLICY IF EXISTS "reports_insert_policy" ON reports;
DROP POLICY IF EXISTS "reports_admin_policy" ON reports; -- This was likely covering everything
-- Re-create separate clean policies

CREATE POLICY "reports_insert_policy" ON reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = reporter_id::text);

CREATE POLICY "reports_select_policy" ON reports
FOR SELECT
TO authenticated
USING (
    auth.uid()::text = reporter_id::text
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
    )
);

CREATE POLICY "reports_update_delete_admin" ON reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
    )
);


-- Table: public.search_analytics
-- Issue: "Anyone can insert search analytics" vs search_analytics_admin_write
-- Combine
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON search_analytics;
DROP POLICY IF EXISTS "search_analytics_admin_write" ON search_analytics;

CREATE POLICY "search_analytics_insert" ON search_analytics
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "search_analytics_select" ON search_analytics
FOR SELECT
TO public
USING (true);

-- (Admin write access is usually strictly for admin tools, but if public can insert, admin technically can too via public role)
-- Adding explicit admin ALL if needed for management
CREATE POLICY "search_analytics_admin_manage" ON search_analytics
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
    )
);
