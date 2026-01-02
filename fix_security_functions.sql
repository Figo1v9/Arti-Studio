-- =============================================
-- FIX SECURITY FUNCTIONS SEARCH PATH
-- Resolves Supabase Security Linter Errors: "Function has a role mutable search_path"
-- Sets explicit search_path=public for SECURITY DEFINER functions
-- =============================================

-- 1. get_growth_data
ALTER FUNCTION get_growth_data(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE)
SET search_path = public;

-- 2. get_most_active_users
ALTER FUNCTION get_most_active_users(INTEGER)
SET search_path = public;

-- 3. get_trending_stats
ALTER FUNCTION get_trending_stats()
SET search_path = public;

-- 4. velocity_score
-- Ensure it is secure regardless of how it was defined
ALTER FUNCTION velocity_score(INTEGER, INTEGER, DECIMAL)
SET search_path = public;

-- 5. engagement_score
ALTER FUNCTION engagement_score(INTEGER, INTEGER, INTEGER)
SET search_path = public;

-- 6. get_analytics_summary (Proactive Fix)
ALTER FUNCTION get_analytics_summary(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE)
SET search_path = public;

-- 7. get_top_searches_in_period (Proactive Fix)
ALTER FUNCTION get_top_searches_in_period(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INTEGER)
SET search_path = public;

-- 8. get_category_stats (Proactive Fix)
ALTER FUNCTION get_category_stats()
SET search_path = public;

-- 9. get_top_images (Proactive Fix)
ALTER FUNCTION get_top_images(TEXT, INTEGER)
SET search_path = public;

-- 10. get_trending_images_v2 (Proactive Fix)
ALTER FUNCTION get_trending_images_v2(INTEGER, INTEGER, TEXT)
SET search_path = public;

-- 11. update_trending_cache (Proactive Fix)
ALTER FUNCTION update_trending_cache()
SET search_path = public;
