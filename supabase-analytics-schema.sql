
-- 1. Create a table to track which user read which notification
CREATE TABLE IF NOT EXISTS public.notification_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Firebase UID (user_id from auth)
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(notification_id, user_id) -- Prevent duplicate reads per user
);

-- 2. Enable RLS
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Users can insert their OWN read receipts
CREATE POLICY "Users can mark notifications as read" ON public.notification_reads
    FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

-- Users can see their own read receipts (to know what they read)
CREATE POLICY "Users can see own reads" ON public.notification_reads
    FOR SELECT
    USING (user_id = auth.uid()::text);

-- Admins can see ALL read receipts (for analytics)
CREATE POLICY "Admins can view all reads" ON public.notification_reads
    FOR SELECT
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- 4. Helper Function to get read counts easily (Optional but faster for admin dashboard)
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
    notification_id UUID,
    read_count BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        notification_id, 
        COUNT(*) as read_count 
    FROM 
        public.notification_reads 
    GROUP BY 
        notification_id;
$$;
