-- =============================================
-- ADVANCED TRENDING ALGORITHM FOR ARTI STUDIO
-- Inspired by: Reddit, Hacker News, YouTube, TikTok
-- 
-- Features:
-- 1. Wilson Score (Reddit) - للتعامل مع العينات الصغيرة
-- 2. Time Decay (HN) - الصور القديمة تتراجع
-- 3. Velocity Score (TikTok) - سرعة التفاعل
-- 4. Engagement Weighting (YouTube) - أوزان مختلفة للتفاعلات
-- 5. Recency Boost - دفعة للمحتوى الجديد
--
-- OPTIMIZATION: Pre-computed scores updated every 15-30 minutes
-- Result: Single simple SELECT instead of complex calculations
-- =============================================

-- =============================================
-- 1. TRENDING CACHE TABLE
-- Stores pre-computed trending scores
-- =============================================
CREATE TABLE IF NOT EXISTS public.trending_cache (
    image_id UUID PRIMARY KEY REFERENCES public.gallery_images(id) ON DELETE CASCADE,
    
    -- Core metrics (snapshot)
    views INTEGER DEFAULT 0,
    copies INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- Velocity metrics (last 24h interactions)
    views_24h INTEGER DEFAULT 0,
    copies_24h INTEGER DEFAULT 0,
    
    -- Computed scores
    engagement_score DECIMAL DEFAULT 0,
    velocity_score DECIMAL DEFAULT 0,
    recency_score DECIMAL DEFAULT 0,
    wilson_score DECIMAL DEFAULT 0,
    
    -- Final combined score
    trending_score DECIMAL DEFAULT 0,
    
    -- Ranking
    rank INTEGER,
    
    -- Metadata
    age_hours DECIMAL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.trending_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view trending cache" ON public.trending_cache;
DROP POLICY IF EXISTS "Anyone can manage trending cache" ON public.trending_cache;
DROP POLICY IF EXISTS "Service can manage trending cache" ON public.trending_cache;
DROP POLICY IF EXISTS "Only system can modify trending cache" ON public.trending_cache;

-- =============================================
-- SECURE POLICIES
-- =============================================

-- Policy 1: Everyone can READ trending data (public data for gallery display)
CREATE POLICY "Anyone can view trending cache" ON public.trending_cache
    FOR SELECT USING (true);

-- Policy 2: NO direct INSERT/UPDATE/DELETE from clients
-- Modifications only happen through SECURITY DEFINER functions:
--   - update_trending_cache() runs as the function owner (postgres)
--   - This bypasses RLS completely for that function
-- 
-- IMPORTANT: We intentionally do NOT create INSERT/UPDATE/DELETE policies
-- This means:
--   ✅ SECURITY DEFINER functions can still modify (they bypass RLS)
--   ❌ Direct API calls from users CANNOT modify
--   ❌ Anon/Authenticated users CANNOT modify via PostgREST
--
-- If you need admin access, use service_role key or SQL Editor

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_trending_cache_score ON public.trending_cache(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_cache_rank ON public.trending_cache(rank ASC);
CREATE INDEX IF NOT EXISTS idx_trending_cache_updated ON public.trending_cache(last_updated DESC);

-- =============================================
-- 2. WILSON SCORE FUNCTION
-- Reddit's confidence interval for ranking
-- Handles small sample sizes fairly
-- =============================================
CREATE OR REPLACE FUNCTION wilson_score(positive INTEGER, total INTEGER)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    n DECIMAL;
    p_hat DECIMAL;
    z DECIMAL := 1.96; -- 95% confidence
    denominator DECIMAL;
    lower_bound DECIMAL;
BEGIN
    -- Handle edge cases
    IF total = 0 OR total IS NULL THEN
        RETURN 0;
    END IF;
    
    n := total::DECIMAL;
    p_hat := positive::DECIMAL / n;
    
    denominator := 1 + (z * z / n);
    
    lower_bound := (
        p_hat + (z * z / (2 * n)) - z * SQRT((p_hat * (1 - p_hat) + z * z / (4 * n)) / n)
    ) / denominator;
    
    -- Return as percentage (0-100)
    RETURN GREATEST(0, lower_bound * 100);
END;
$$;

-- =============================================
-- 3. VELOCITY SCORE FUNCTION
-- Measures engagement speed (TikTok/YouTube style)
-- Higher score = faster engagement relative to age
-- =============================================
CREATE OR REPLACE FUNCTION velocity_score(
    total_engagement INTEGER,
    recent_engagement INTEGER,
    age_hours DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    velocity DECIMAL;
    recency_weight DECIMAL;
BEGIN
    -- Avoid division by zero
    IF age_hours < 1 THEN
        age_hours := 1;
    END IF;
    
    -- Calculate base velocity (engagements per hour)
    velocity := recent_engagement::DECIMAL / age_hours;
    
    -- Apply logarithmic scaling to prevent extreme values
    velocity := LN(velocity + 1) * 10;
    
    -- Bonus for high concentration of recent activity
    IF total_engagement > 0 THEN
        recency_weight := recent_engagement::DECIMAL / total_engagement::DECIMAL;
        velocity := velocity * (1 + recency_weight);
    END IF;
    
    RETURN LEAST(100, GREATEST(0, velocity));
END;
$$;

-- =============================================
-- 4. RECENCY SCORE FUNCTION
-- Gives boost to fresh content (Hacker News style)
-- Uses gravity-based decay
-- =============================================
CREATE OR REPLACE FUNCTION recency_score(
    age_hours DECIMAL,
    gravity DECIMAL DEFAULT 1.5
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    score DECIMAL;
    boost DECIMAL := 0;
BEGIN
    -- Base score using HN-style decay
    -- Score decreases as age increases
    IF age_hours < 1 THEN
        age_hours := 1;
    END IF;
    
    score := 100 / POWER(age_hours + 2, gravity);
    
    -- Bonus boosts for very fresh content
    IF age_hours <= 6 THEN
        boost := 30;  -- Very fresh (< 6 hours)
    ELSIF age_hours <= 24 THEN
        boost := 20;  -- Fresh (< 24 hours)
    ELSIF age_hours <= 72 THEN
        boost := 10;  -- Recent (< 3 days)
    ELSIF age_hours <= 168 THEN
        boost := 5;   -- This week
    END IF;
    
    RETURN LEAST(100, GREATEST(0, (score * 100) + boost));
END;
$$;

-- =============================================
-- 5. ENGAGEMENT SCORE FUNCTION
-- Weighted engagement (YouTube/TikTok style)
-- Different actions have different values
-- =============================================
CREATE OR REPLACE FUNCTION engagement_score(
    views INTEGER,
    copies INTEGER,
    favorites INTEGER
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    -- Weights inspired by TikTok's perceived model
    view_weight DECIMAL := 1;
    copy_weight DECIMAL := 5;      -- Copies are high intent
    favorite_weight DECIMAL := 3;   -- Favorites show interest
    
    raw_score DECIMAL;
    normalized_score DECIMAL;
BEGIN
    -- Calculate weighted sum
    raw_score := (COALESCE(views, 0) * view_weight) + 
                 (COALESCE(copies, 0) * copy_weight) + 
                 (COALESCE(favorites, 0) * favorite_weight);
    
    -- Logarithmic normalization to prevent extreme scores
    -- This ensures high-engagement items don't dominate completely
    normalized_score := LN(raw_score + 1) * 10;
    
    RETURN LEAST(100, GREATEST(0, normalized_score));
END;
$$;

-- =============================================
-- 6. COMBINED TRENDING SCORE FUNCTION
-- The master algorithm combining all factors
-- =============================================
CREATE OR REPLACE FUNCTION calculate_trending_score(
    p_engagement_score DECIMAL,
    p_velocity_score DECIMAL,
    p_recency_score DECIMAL,
    p_wilson_score DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    -- Weight distribution (total = 100%)
    engagement_weight DECIMAL := 0.30;  -- 30% - Total engagement
    velocity_weight DECIMAL := 0.35;    -- 35% - Speed of engagement (most important)
    recency_weight DECIMAL := 0.20;     -- 20% - How fresh the content is
    wilson_weight DECIMAL := 0.15;      -- 15% - Statistical confidence
    
    final_score DECIMAL;
BEGIN
    final_score := (COALESCE(p_engagement_score, 0) * engagement_weight) +
                   (COALESCE(p_velocity_score, 0) * velocity_weight) +
                   (COALESCE(p_recency_score, 0) * recency_weight) +
                   (COALESCE(p_wilson_score, 0) * wilson_weight);
    
    RETURN ROUND(final_score, 4);
END;
$$;

-- =============================================
-- 7. MAIN UPDATE FUNCTION
-- Updates the entire trending cache
-- Call this every 15-30 minutes via cron or manually
-- SECURITY: Only admins or service_role can execute
-- =============================================
CREATE OR REPLACE FUNCTION update_trending_cache()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count INTEGER;
    start_time TIMESTAMP := clock_timestamp();
    end_time TIMESTAMP;
    execution_ms INTEGER;
    caller_role TEXT;
    caller_id TEXT;
    is_admin BOOLEAN := FALSE;
BEGIN
    -- =============================================
    -- SECURITY CHECK: Only allow admins or service_role
    -- =============================================
    
    -- Get the caller's role from JWT (if called via PostgREST)
    BEGIN
        caller_role := current_setting('request.jwt.claims', true)::json->>'role';
        caller_id := current_setting('request.jwt.claims', true)::json->>'sub';
    EXCEPTION WHEN OTHERS THEN
        -- If no JWT, might be internal call (cron, SQL editor)
        caller_role := NULL;
        caller_id := NULL;
    END;
    
    -- Allow if:
    -- 1. Service role (backend/cron)
    -- 2. Internal postgres call (SQL editor, pg_cron)
    -- 3. Admin user
    IF caller_role = 'service_role' OR caller_role IS NULL THEN
        is_admin := TRUE;
    ELSIF caller_id IS NOT NULL THEN
        -- Check if user is admin in profiles table
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE id = caller_id AND role = 'admin'
        ) INTO is_admin;
    END IF;
    
    IF NOT is_admin THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Only admins can update trending cache'
        );
    END IF;
    
    -- =============================================
    -- MAIN LOGIC: Update trending cache
    -- =============================================
    
    -- Step 1: Insert or Update all images with computed scores
    INSERT INTO public.trending_cache (
        image_id,
        views,
        copies,
        favorites_count,
        views_24h,
        copies_24h,
        engagement_score,
        velocity_score,
        recency_score,
        wilson_score,
        trending_score,
        age_hours,
        last_updated
    )
    SELECT 
        gi.id as image_id,
        gi.views,
        gi.copies,
        COALESCE(fav.fav_count, 0) as favorites_count,
        
        -- Views in last 24 hours (approximation from page_views if available)
        COALESCE(pv.views_24h, LEAST(gi.views, 50)) as views_24h,
        
        -- Copies in last 24 hours (approximation)
        COALESCE(ua.copies_24h, LEAST(gi.copies, 10)) as copies_24h,
        
        -- Calculate individual scores
        engagement_score(
            gi.views, 
            gi.copies, 
            COALESCE(fav.fav_count, 0)
        ) as engagement_score,
        
        velocity_score(
            gi.views + gi.copies,
            COALESCE(pv.views_24h, LEAST(gi.views, 50)) + COALESCE(ua.copies_24h, LEAST(gi.copies, 10)),
            EXTRACT(EPOCH FROM (NOW() - gi.created_at)) / 3600
        ) as velocity_score,
        
        recency_score(
            EXTRACT(EPOCH FROM (NOW() - gi.created_at)) / 3600,
            1.5  -- gravity factor
        ) as recency_score,
        
        wilson_score(
            gi.copies + COALESCE(fav.fav_count, 0),  -- positive signals
            gi.views  -- total exposure
        ) as wilson_score,
        
        -- Combined score (calculated after)
        0 as trending_score,
        
        EXTRACT(EPOCH FROM (NOW() - gi.created_at)) / 3600 as age_hours,
        NOW() as last_updated
        
    FROM public.gallery_images gi
    
    -- Join favorites count
    LEFT JOIN (
        SELECT image_id, COUNT(*) as fav_count
        FROM public.favorites
        GROUP BY image_id
    ) fav ON fav.image_id = gi.id
    
    -- Join page views last 24h (if table exists)
    LEFT JOIN (
        SELECT target_id::uuid as image_id, COUNT(*) as views_24h
        FROM public.page_views
        WHERE page_type = 'image' 
          AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY target_id
    ) pv ON pv.image_id = gi.id
    
    -- Join user activity last 24h
    LEFT JOIN (
        SELECT image_id, COUNT(*) as copies_24h
        FROM public.user_activity
        WHERE action = 'copy' 
          AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY image_id
    ) ua ON ua.image_id = gi.id
    
    ON CONFLICT (image_id) DO UPDATE SET
        views = EXCLUDED.views,
        copies = EXCLUDED.copies,
        favorites_count = EXCLUDED.favorites_count,
        views_24h = EXCLUDED.views_24h,
        copies_24h = EXCLUDED.copies_24h,
        engagement_score = EXCLUDED.engagement_score,
        velocity_score = EXCLUDED.velocity_score,
        recency_score = EXCLUDED.recency_score,
        wilson_score = EXCLUDED.wilson_score,
        age_hours = EXCLUDED.age_hours,
        last_updated = NOW();
    
    -- Step 2: Calculate final trending score
    UPDATE public.trending_cache
    SET trending_score = calculate_trending_score(
        engagement_score,
        velocity_score,
        recency_score,
        wilson_score
    );
    
    -- Step 3: Assign ranks
    WITH ranked AS (
        SELECT image_id, ROW_NUMBER() OVER (ORDER BY trending_score DESC) as new_rank
        FROM public.trending_cache
    )
    UPDATE public.trending_cache tc
    SET rank = r.new_rank
    FROM ranked r
    WHERE tc.image_id = r.image_id;
    
    -- Step 4: Clean up old entries (images that no longer exist)
    DELETE FROM public.trending_cache
    WHERE image_id NOT IN (SELECT id FROM public.gallery_images);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    end_time := clock_timestamp();
    execution_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
    
    RETURN json_build_object(
        'success', true,
        'images_processed', (SELECT COUNT(*) FROM public.trending_cache),
        'execution_ms', execution_ms,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 8. GET TRENDING IMAGES FUNCTION
-- Super fast retrieval - just a simple SELECT
-- =============================================
CREATE OR REPLACE FUNCTION get_trending_images_v2(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    url TEXT,
    prompt TEXT,
    category TEXT,
    tags TEXT[],
    author_id TEXT,
    author_name TEXT,
    views INTEGER,
    copies INTEGER,
    aspect_ratio DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE,
    trending_score DECIMAL,
    trending_rank INTEGER,
    velocity_score DECIMAL,
    engagement_score DECIMAL,
    author_username TEXT,
    author_avatar TEXT,
    author_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gi.id,
        gi.url,
        gi.prompt,
        gi.category,
        gi.tags,
        gi.author_id,
        gi.author_name,
        gi.views,
        gi.copies,
        gi.aspect_ratio,
        gi.created_at,
        tc.trending_score,
        tc.rank as trending_rank,
        tc.velocity_score,
        tc.engagement_score,
        p.username as author_username,
        p.avatar_url as author_avatar,
        p.full_name as author_full_name
    FROM public.trending_cache tc
    INNER JOIN public.gallery_images gi ON gi.id = tc.image_id
    LEFT JOIN public.profiles p ON p.id = gi.author_id
    WHERE (p_category IS NULL OR gi.category = p_category)
    ORDER BY tc.rank ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================
-- 9. GET TRENDING STATS FUNCTION
-- Returns metadata about the trending cache
-- =============================================
CREATE OR REPLACE FUNCTION get_trending_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_images', (SELECT COUNT(*) FROM public.trending_cache),
        'last_updated', (SELECT MAX(last_updated) FROM public.trending_cache),
        'avg_trending_score', (SELECT ROUND(AVG(trending_score), 2) FROM public.trending_cache),
        'max_trending_score', (SELECT ROUND(MAX(trending_score), 2) FROM public.trending_cache),
        'top_category', (
            SELECT gi.category 
            FROM public.trending_cache tc
            JOIN public.gallery_images gi ON gi.id = tc.image_id
            GROUP BY gi.category
            ORDER BY SUM(tc.trending_score) DESC
            LIMIT 1
        ),
        'fresh_content_count', (
            SELECT COUNT(*) FROM public.trending_cache WHERE age_hours <= 24
        ),
        'velocity_avg', (SELECT ROUND(AVG(velocity_score), 2) FROM public.trending_cache)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =============================================
-- 10. INITIAL POPULATION
-- Run once to populate the cache
-- =============================================
-- SELECT update_trending_cache();

-- =============================================
-- USAGE EXAMPLES:
-- 
-- 1. Update trending cache (run every 15-30 min):
--    SELECT update_trending_cache();
--
-- 2. Get top 50 trending images:
--    SELECT * FROM get_trending_images_v2(50, 0);
--
-- 3. Get trending by category:
--    SELECT * FROM get_trending_images_v2(20, 0, 'design');
--
-- 4. Get trending stats:
--    SELECT get_trending_stats();
--
-- 5. Direct simple query (fastest):
--    SELECT gi.*, tc.trending_score, tc.rank
--    FROM trending_cache tc
--    JOIN gallery_images gi ON gi.id = tc.image_id
--    ORDER BY tc.rank
--    LIMIT 50;
-- =============================================

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
