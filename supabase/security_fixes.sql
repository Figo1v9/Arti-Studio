-- =================================================================
-- SECURITY & PERFORMANCE FIXES
-- =================================================================
-- Run this script in your Supabase SQL Editor to fix the reported issues.
--
-- This script does the following:
-- 1. Secures functions by fixing their search_path (prevents hijacking).
-- 2. Moves pg_trgm extension to 'extensions' schema (Best Practice).
-- =================================================================

-- 1. FIX FUNCTION SEARCH PATHS
-- The error "Function has a role mutable search_path" means malicious users
-- could potentially override operators/functions if they can create objects in public.
-- We fix this by explicitly setting the search_path for these Security Definer functions.

DO $$
BEGIN
    -- Fix: get_notification_stats
    -- Checks if function exists before altering to prevent errors
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_notification_stats') THEN
        ALTER FUNCTION public.get_notification_stats() SET search_path = public, pg_temp;
    END IF;

    -- Fix: handle_updated_at (Trigger)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
    END IF;

    -- Fix: update_last_active_column (Trigger)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_last_active_column') THEN
        ALTER FUNCTION public.update_last_active_column() SET search_path = public, pg_temp;
    END IF;

    -- Fix: handle_new_user (Trigger)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
    END IF;

    -- Fix: increment_views (RPC)
    -- Assuming argument is UUID based on table schema
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_views') THEN
        ALTER FUNCTION public.increment_views(uuid) SET search_path = public, pg_temp;
    END IF;

    -- Fix: increment_copies (RPC)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_copies') THEN
        ALTER FUNCTION public.increment_copies(uuid) SET search_path = public, pg_temp;
    END IF;
END $$;


-- 2. MOVE PG_TRGM EXTENSION
-- "Extension pg_trgm is installed in the public schema. Move it to another schema."
-- This isolates extensions from user tables.

-- A. Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- B. Move the extension
-- If this fails, it might be because other objects depend on it being in public.
-- In that case, you might need to drop dependent objects first, but usually ALTER works.
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- C. Update search path
-- ensuring 'extensions' is in the path so queries like 'similarity()' still work
-- without needing 'extensions.similarity()'
ALTER DATABASE postgres SET search_path TO public, extensions;

-- =================================================================
-- MANUAL STEP REQUIRED FOR "HaveIBeenPwned"
-- =================================================================
-- This cannot be fixed via SQL.
-- 1. Go to your Supabase Dashboard.
-- 2. Click on "Authentication" (Icon on the left).
-- 3. Go to "Policies" or "Security" under Configuration.
-- 4. Enable "Enable HaveIBeenPwned Check" or similar toggle.
-- =================================================================
