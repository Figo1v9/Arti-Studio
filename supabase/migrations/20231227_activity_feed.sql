-- Activity Feed Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'follow', 
        'unfollow', 
        'like', 
        'view_milestone', 
        'copy_milestone', 
        'follower_milestone', 
        'upload'
    )),
    target_id TEXT,
    target_type TEXT CHECK (target_type IN ('user', 'image') OR target_type IS NULL),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(type);

-- RLS Policies
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
    ON public.activity_feed
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can view activities of users they follow
CREATE POLICY "Users can view following activities"
    ON public.activity_feed
    FOR SELECT
    USING (
        user_id IN (
            SELECT following_id 
            FROM public.follows 
            WHERE follower_id = auth.uid()::text
        )
    );

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
    ON public.activity_feed
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Service role can delete old activities
CREATE POLICY "Service can delete activities"
    ON public.activity_feed
    FOR DELETE
    USING (true);

-- Grant access
GRANT ALL ON public.activity_feed TO authenticated;
GRANT ALL ON public.activity_feed TO service_role;
