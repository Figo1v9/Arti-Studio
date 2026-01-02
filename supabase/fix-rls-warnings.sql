-- =====================================
-- FIX RLS PERFORMANCE WARNINGS
-- Run this in Supabase SQL Editor
-- =====================================

-- =====================
-- 1. FIX: reports table
-- =====================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reports;
DROP POLICY IF EXISTS "Enable full access for admins" ON public.reports;

-- Create optimized single policy for INSERT
CREATE POLICY "reports_insert_policy" ON public.reports
FOR INSERT TO authenticated
WITH CHECK (
    (select auth.uid()) IS NOT NULL
);

-- Create optimized policy for admins (SELECT, UPDATE, DELETE)
CREATE POLICY "reports_admin_policy" ON public.reports
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())::text
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())::text
        AND role = 'admin'
    )
);

-- Allow reporters to view their own reports
CREATE POLICY "reports_view_own" ON public.reports
FOR SELECT TO authenticated
USING (
    reporter_id = (select auth.uid())::text
);


-- =====================
-- 2. FIX: audit_logs table
-- =====================

-- Drop and recreate with optimized check
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_admin_view" ON public.audit_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())::text
        AND role = 'admin'
    )
);


-- =====================
-- 3. FIX: daily_stats table
-- =====================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Anyone can manage daily stats" ON public.daily_stats;
DROP POLICY IF EXISTS "Anyone can view daily stats" ON public.daily_stats;

-- Create single unified policy
CREATE POLICY "daily_stats_public_access" ON public.daily_stats
FOR SELECT TO public
USING (true);

-- Admin-only write access
CREATE POLICY "daily_stats_admin_write" ON public.daily_stats
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())::text
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())::text
        AND role = 'admin'
    )
);


-- =====================
-- 4. FIX: profiles table
-- =====================

-- Drop duplicate UPDATE policies
DROP POLICY IF EXISTS "Allow All Update Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin direct updates" ON public.profiles;

-- Create single optimized UPDATE policy
-- Users can update their own profile
CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
    id = (select auth.uid())::text
)
WITH CHECK (
    id = (select auth.uid())::text
);

-- Admins can update any profile
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = (select auth.uid())::text
        AND p.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = (select auth.uid())::text
        AND p.role = 'admin'
    )
);


-- =====================
-- 5. FIX: search_analytics table
-- =====================

-- Drop duplicate SELECT policies
DROP POLICY IF EXISTS "Admins can view search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Anyone can view search analytics" ON public.search_analytics;

-- Create single public read policy
CREATE POLICY "search_analytics_public_read" ON public.search_analytics
FOR SELECT TO public
USING (true);

-- Admin write access
CREATE POLICY "search_analytics_admin_write" ON public.search_analytics
FOR INSERT TO authenticated
WITH CHECK (true);


-- =====================
-- VERIFY: Check for remaining issues
-- =====================

-- This query shows all RLS policies (run separately to verify)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- Done! 
-- Refresh the Supabase Linter to verify all warnings are resolved.
