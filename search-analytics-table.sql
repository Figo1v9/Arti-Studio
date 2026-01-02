-- =============================================
-- SEARCH ANALYTICS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create search_analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Anyone can view search analytics" ON public.search_analytics;

-- 4. Create Policies - Allow insert from anyone and read from anyone
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view search analytics" ON public.search_analytics
    FOR SELECT USING (true);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON public.search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_results ON public.search_analytics(results_count);

-- 6. Notify schema reload
NOTIFY pgrst, 'reload schema';

-- =============================================
-- DONE! Now search queries will be logged.
-- =============================================
