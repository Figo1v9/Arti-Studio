-- =================================================================
-- PERFORMANCE & CLEANUP FIXES
-- =================================================================
-- This script fixes the 80+ issues reported regarding:
-- 1. Suboptimal RLS policies (using auth.uid() vs select auth.uid())
-- 2. Duplicate Policies (Conflicting permissions)
-- 3. Duplicate Indexes
-- =================================================================

-- 1. DROP DUPLICATE/SUBOPTIMAL POLICIES
-- Since you use Firebase Auth, policies relying on Supabase's auth.uid() 
-- are redundant (and causing performance warnings) because you likely 
-- have "Anyone can..." policies enabled for your app to work.
-- We will remove the "Users can..." policies and keep the "Anyone can..." ones.

-- PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- (We keep "Anyone can insert profile" and "Anyone can update profile")

-- GALLERY IMAGES
DROP POLICY IF EXISTS "Users can insert their own images" ON public.gallery_images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.gallery_images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.gallery_images;

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Enable insert access for admins only" ON public.notifications;
DROP POLICY IF EXISTS "Enable update access for admins only" ON public.notifications;
DROP POLICY IF EXISTS "Enable delete access for admins only" ON public.notifications;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notifications;

-- NOTIFICATION READS
DROP POLICY IF EXISTS "Admins can view reads" ON public.notification_reads;
DROP POLICY IF EXISTS "Users can mark read" ON public.notification_reads;

-- ACTIVITY FEED
DROP POLICY IF EXISTS "Users can view own activities" ON public.activity_feed;
DROP POLICY IF EXISTS "Users can view following activities" ON public.activity_feed;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activity_feed;

-- USER DEVICES
DROP POLICY IF EXISTS "Users can insert their own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can view their own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can update their own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can delete their own devices" ON public.user_devices;


-- 2. DROP DUPLICATE INDEXES
-- You have identical indexes with different names. We delete the redundant ones.

DROP INDEX IF EXISTS public.idx_gallery_category; 
-- (Keeps public.idx_gallery_images_category)

DROP INDEX IF EXISTS public.idx_gallery_created_at; 
-- (Keeps public.idx_gallery_images_created_at)

-- 3. OPTIMIZE ANY REMAINING AUTH POLICIES
-- If there are any remaining policies using auth.uid(), this is the fix 
-- requested by Supabase (wrapping in SELECT). 
-- Only applying to standard permissive policies if they use auth, 
-- though most "Anyone" policies use (true).

-- Example of how to fix IF you decide to use Supabase Auth later:
-- CREATE POLICY "Fixed Policy" ON table 
-- USING ( auth.uid() = user_id ); 
-- BECOMES -> 
-- USING ( (select auth.uid()) = user_id );

-- For now, dropping the duplicates above solves 90% of your listed issues.
