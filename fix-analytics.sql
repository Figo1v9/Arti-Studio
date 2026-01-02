
-- 1. Create table IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.notification_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID NOT NULL, 
    user_id TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(notification_id, user_id)
);

-- 2. Force Enable RLS
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- 3. Clear ALL old policies to start fresh
DROP POLICY IF EXISTS "Users can mark notifications as read" ON public.notification_reads;
DROP POLICY IF EXISTS "Users can see own reads" ON public.notification_reads;
DROP POLICY IF EXISTS "Admins can view all reads" ON public.notification_reads;
DROP POLICY IF EXISTS "Allow insert for all authenticated" ON public.notification_reads;
DROP POLICY IF EXISTS "Allow update for all authenticated" ON public.notification_reads;
DROP POLICY IF EXISTS "Allow select for all" ON public.notification_reads;

-- 4. Create PERMISSIVE policies (Fix for Firebase UID mismatch)
-- Allow ANY insert (we trust the client logic for now to send correct user_id)
CREATE POLICY "Allow insert for everyone" ON public.notification_reads
    FOR INSERT 
    WITH CHECK (true);

-- Allow ANY update (needed for upsert conflicts)
CREATE POLICY "Allow update for everyone" ON public.notification_reads
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow ANY select (needed for counting reads)
CREATE POLICY "Allow select for everyone" ON public.notification_reads
    FOR SELECT
    USING (true);

-- 5. Notify Schema Reload
NOTIFY pgrst, 'reload schema';
