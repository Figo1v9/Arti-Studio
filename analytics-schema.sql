-- =============================================
-- ANALYTICS SCHEMA FOR ARTI STUDIO
-- Comprehensive analytics tracking system
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Search Analytics Table (For tracking search queries)
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Admins can view search analytics" ON public.search_analytics;

-- Policies
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view search analytics" ON public.search_analytics
    FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON public.search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);

-- 2. Page Views Analytics (For tracking page/image views over time)
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL, -- 'image', 'profile', 'category', 'home'
    target_id TEXT, -- image_id, profile_id, category_id depending on page_type
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;

CREATE POLICY "Anyone can insert page views" ON public.page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view page views" ON public.page_views
    FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type ON public.page_views(page_type);
CREATE INDEX IF NOT EXISTS idx_page_views_target_id ON public.page_views(target_id);

-- 3. User Activity Summary (Aggregated daily stats for performance)
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    new_users INTEGER DEFAULT 0,
    new_images INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_copies INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view daily stats" ON public.daily_stats;
DROP POLICY IF EXISTS "Anyone can manage daily stats" ON public.daily_stats;

CREATE POLICY "Anyone can view daily stats" ON public.daily_stats
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage daily stats" ON public.daily_stats
    FOR ALL USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.daily_stats(date DESC);

-- =============================================
-- RPC FUNCTIONS FOR OPTIMIZED ANALYTICS QUERIES
-- =============================================

-- Function: Get aggregated stats for a date range
CREATE OR REPLACE FUNCTION get_analytics_summary(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'new_users', (
            SELECT COUNT(*) FROM public.profiles 
            WHERE created_at >= start_date AND created_at <= end_date
        ),
        'new_images', (
            SELECT COUNT(*) FROM public.gallery_images 
            WHERE created_at >= start_date AND created_at <= end_date
        ),
        'total_views', (
            SELECT COALESCE(SUM(views), 0) FROM public.gallery_images
        ),
        'total_copies', (
            SELECT COALESCE(SUM(copies), 0) FROM public.gallery_images
        ),
        'period_views', (
            SELECT COUNT(*) FROM public.page_views
            WHERE created_at >= start_date AND created_at <= end_date
        ),
        'total_searches', (
            SELECT COUNT(*) FROM public.search_analytics
            WHERE created_at >= start_date AND created_at <= end_date
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function: Get top searches for a period
CREATE OR REPLACE FUNCTION get_top_searches_in_period(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(term TEXT, search_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LOWER(query) as term, 
        COUNT(*) as search_count
    FROM public.search_analytics
    WHERE created_at >= start_date AND created_at <= end_date
    GROUP BY LOWER(query)
    ORDER BY search_count DESC
    LIMIT limit_count;
END;
$$;

-- Function: Get growth data (daily aggregation)
CREATE OR REPLACE FUNCTION get_growth_data(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
    day DATE,
    users_count BIGINT,
    images_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            start_date::DATE,
            end_date::DATE,
            '1 day'::INTERVAL
        )::DATE as day
    ),
    users_per_day AS (
        SELECT 
            created_at::DATE as day,
            COUNT(*) as count
        FROM public.profiles
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY created_at::DATE
    ),
    images_per_day AS (
        SELECT 
            created_at::DATE as day,
            COUNT(*) as count
        FROM public.gallery_images
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY created_at::DATE
    )
    SELECT 
        ds.day,
        COALESCE(u.count, 0) as users_count,
        COALESCE(i.count, 0) as images_count
    FROM date_series ds
    LEFT JOIN users_per_day u ON ds.day = u.day
    LEFT JOIN images_per_day i ON ds.day = i.day
    ORDER BY ds.day;
END;
$$;

-- Function: Get most active users
CREATE OR REPLACE FUNCTION get_most_active_users(
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    user_id TEXT,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    images_count BIGINT,
    followers_count BIGINT,
    following_count BIGINT,
    total_views BIGINT,
    total_copies BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        COALESCE((SELECT COUNT(*) FROM public.gallery_images gi WHERE gi.author_id = p.id), 0) as images_count,
        COALESCE((SELECT COUNT(*) FROM public.follows f WHERE f.following_id = p.id), 0) as followers_count,
        COALESCE((SELECT COUNT(*) FROM public.follows f WHERE f.follower_id = p.id), 0) as following_count,
        COALESCE((SELECT SUM(views) FROM public.gallery_images gi WHERE gi.author_id = p.id), 0) as total_views,
        COALESCE((SELECT SUM(copies) FROM public.gallery_images gi WHERE gi.author_id = p.id), 0) as total_copies
    FROM public.profiles p
    ORDER BY images_count DESC, total_views DESC
    LIMIT limit_count;
END;
$$;

-- Function: Get category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE(
    category TEXT,
    images_count BIGINT,
    total_views BIGINT,
    total_copies BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gi.category,
        COUNT(*) as images_count,
        COALESCE(SUM(gi.views), 0) as total_views,
        COALESCE(SUM(gi.copies), 0) as total_copies
    FROM public.gallery_images gi
    GROUP BY gi.category
    ORDER BY images_count DESC;
END;
$$;

-- Function: Get top images by views/copies
CREATE OR REPLACE FUNCTION get_top_images(
    order_by_field TEXT DEFAULT 'views',
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    url TEXT,
    prompt TEXT,
    category TEXT,
    views INTEGER,
    copies INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    author_username TEXT,
    author_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF order_by_field = 'copies' THEN
        RETURN QUERY
        SELECT 
            gi.id,
            gi.url,
            gi.prompt,
            gi.category,
            gi.views,
            gi.copies,
            gi.created_at,
            p.username as author_username,
            p.avatar_url as author_avatar
        FROM public.gallery_images gi
        LEFT JOIN public.profiles p ON gi.author_id = p.id
        ORDER BY gi.copies DESC
        LIMIT limit_count;
    ELSE
        RETURN QUERY
        SELECT 
            gi.id,
            gi.url,
            gi.prompt,
            gi.category,
            gi.views,
            gi.copies,
            gi.created_at,
            p.username as author_username,
            p.avatar_url as author_avatar
        FROM public.gallery_images gi
        LEFT JOIN public.profiles p ON gi.author_id = p.id
        ORDER BY gi.views DESC
        LIMIT limit_count;
    END IF;
END;
$$;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
