
-- Fix Follows Table RLS Policies
-- The previous policies relied on auth.uid() which is not available with Firebase Auth (client-side only).
-- This update aligns the follows table policies with the rest of the application (using relaxed RLS).

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON follows;
DROP POLICY IF EXISTS "Enable insert for authenticated users as themselves" ON follows;
DROP POLICY IF EXISTS "Enable delete for users to unfollow" ON follows;

-- 2. Create new relaxed policies (matches profiles/gallery_images security level)

-- READ: Everyone can see follows
CREATE POLICY "Enable read access for all users" ON follows
    FOR SELECT USING (true);

-- INSERT: Allow insert (Application handles auth check)
CREATE POLICY "Enable insert for authenticated users" ON follows
    FOR INSERT WITH CHECK (true);

-- DELETE: Allow delete (Application handles auth check)
CREATE POLICY "Enable delete for users" ON follows
    FOR DELETE USING (true);
