-- =============================================
-- PERFORMANCE INDEXES FOR 1M CONCURRENT USERS
-- Arti Studio High-Scale Optimization
-- =============================================

-- =============================================
-- 1. GALLERY IMAGES - Most queried table
-- =============================================

-- Feed queries: ORDER BY created_at DESC WHERE category = X
CREATE INDEX IF NOT EXISTS idx_gallery_images_category_created 
    ON public.gallery_images(category, created_at DESC);

-- User profile images: WHERE author_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_gallery_images_author_created 
    ON public.gallery_images(author_id, created_at DESC);

-- Trending/Popular queries
CREATE INDEX IF NOT EXISTS idx_gallery_images_views 
    ON public.gallery_images(views DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_images_copies 
    ON public.gallery_images(copies DESC);

-- Search by tags (GIN index for array contains)
CREATE INDEX IF NOT EXISTS idx_gallery_images_tags 
    ON public.gallery_images USING GIN(tags);

-- =============================================
-- 2. FOLLOWS - Critical for social features
-- =============================================

-- Get followers of a user
CREATE INDEX IF NOT EXISTS idx_follows_following 
    ON public.follows(following_id);

-- Get who a user follows
CREATE INDEX IF NOT EXISTS idx_follows_follower 
    ON public.follows(follower_id);

-- Combined index for checking if A follows B
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_pair 
    ON public.follows(follower_id, following_id);

-- =============================================
-- 3. FAVORITES - User saved items
-- =============================================

-- User's favorites list
CREATE INDEX IF NOT EXISTS idx_favorites_user 
    ON public.favorites(user_id, created_at DESC);

-- Check if specific image is favorited by user
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_image 
    ON public.favorites(user_id, image_id);

-- Count favorites per image
CREATE INDEX IF NOT EXISTS idx_favorites_image 
    ON public.favorites(image_id);

-- =============================================
-- 4. SEARCH ANALYTICS - Admin dashboard
-- =============================================

-- Date range queries for analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_created 
    ON public.search_analytics(created_at DESC);

-- Zero results queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_results 
    ON public.search_analytics(results_count, created_at DESC);

-- =============================================
-- 5. PROFILES - User lookups
-- =============================================

-- Username lookups (public profiles)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username 
    ON public.profiles(username) WHERE username IS NOT NULL;

-- Public profiles filtering
CREATE INDEX IF NOT EXISTS idx_profiles_public 
    ON public.profiles(is_public) WHERE is_public = true;

-- =============================================
-- 6. NOTIFICATIONS - Real-time features
-- =============================================

-- Active notifications for users
CREATE INDEX IF NOT EXISTS idx_notifications_audience_created 
    ON public.notifications(target_audience, created_at DESC);

-- User read status
CREATE INDEX IF NOT EXISTS idx_notification_reads_user 
    ON public.notification_reads(user_id, notification_id);

-- =============================================
-- 7. COLLECTIONS - User galleries
-- =============================================

-- User's collections
CREATE INDEX IF NOT EXISTS idx_collections_user 
    ON public.collections(user_id, created_at DESC);

-- Public collections
CREATE INDEX IF NOT EXISTS idx_collections_public 
    ON public.collections(is_public, created_at DESC) WHERE is_public = true;

-- Collection images ordering
CREATE INDEX IF NOT EXISTS idx_collection_images_collection 
    ON public.collection_images(collection_id, sort_order);

-- =============================================
-- 8. TRENDING CACHE - Already has indexes
-- Verified in trending-algorithm.sql:
-- - idx_trending_cache_score
-- - idx_trending_cache_rank  
-- - idx_trending_cache_updated
-- =============================================

-- =============================================
-- ANALYZE TABLES
-- Run after creating indexes to update statistics
-- =============================================
ANALYZE public.gallery_images;
ANALYZE public.follows;
ANALYZE public.favorites;
ANALYZE public.profiles;
ANALYZE public.search_analytics;
ANALYZE public.notifications;
ANALYZE public.notification_reads;
ANALYZE public.collections;
ANALYZE public.collection_images;

-- =============================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA
-- =============================================
NOTIFY pgrst, 'reload schema';
