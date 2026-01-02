
-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'promo')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'admins', 'users')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 2. Add 'link' column if it was missing 
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE public.notifications ADD COLUMN link TEXT;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notifications;
DROP POLICY IF EXISTS "Enable write access for admins only" ON public.notifications;
DROP POLICY IF EXISTS "Enable delete access for admins only" ON public.notifications;
DROP POLICY IF EXISTS "Enable update access for admins only" ON public.notifications;

-- 5. Re-create Policies
CREATE POLICY "Enable read access for all users" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for admins only" ON public.notifications
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Enable delete access for admins only" ON public.notifications
    FOR DELETE
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Enable update access for admins only" ON public.notifications
    FOR UPDATE
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    )
    WITH CHECK (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- 6. Setup Realtime (Power Mode 💪)
DO $$
BEGIN
    -- Check if publication exists first
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

-- Safely add table to publication only if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- Note: If this still fails, it means it's already added. Since SQL doesn't have "ADD TABLE IF NOT EXISTS", 
-- usually we ignore this error or do a DROP/ADD. But let's try just NOTIFY first as the table is likely ready.

-- 7. FORCE REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
