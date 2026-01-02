-- =================================================================
-- PERFORMANCE CLEANUP V2 (FINAL)
-- =================================================================
-- This script removes the remaining 16 duplicate policies.
-- These are "SELECT" policies that are Redundant because you already 
-- have a "Manage" (FOR ALL) policy that covers everything.
-- =================================================================

-- 1. CATEGORIES
-- "Anyone can manage categories" (FOR ALL) exists, so we don't need a separate SELECT policy.
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

-- 2. FAVORITES
-- "Anyone can manage favorites" (FOR ALL) exists.
DROP POLICY IF EXISTS "Favorites are viewable by everyone" ON public.favorites;

-- 3. NOTIFICATIONS
-- "Anyone can manage notifications" (FOR ALL) exists.
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON public.notifications;

-- 4. GALLERY IMAGES
-- You have two identical SELECT policies. We remove the older/duplicate one.
-- We keep "Gallery images are viewable by everyone" and remove "Public images..."
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON public.gallery_images;

-- 5. NOTIFICATION READS
-- Just in case there are duplicates here too (based on previous logs)
DROP POLICY IF EXISTS "Admins can view reads" ON public.notification_reads;
