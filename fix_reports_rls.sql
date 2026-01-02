-- =====================================================
-- FIX: Reports Table (Type & Security & Performance)
-- =====================================================

-- 1. DROP ALL EXISTING POLICIES FIRST
DROP POLICY IF EXISTS "Enable insert for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reports;
DROP POLICY IF EXISTS "Enable full access for admins" ON reports;
DROP POLICY IF EXISTS "Enable read access for own reports" ON reports;

-- 2. Fix Column Type (UUID -> TEXT for Firebase IDs)
-- Ensure reporter_id matches profiles.id type (Text)
-- Drop the constraint first to allow type change
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;

-- Change column type (Idempotent-ish: if text, stays text)
ALTER TABLE reports ALTER COLUMN reporter_id TYPE TEXT USING reporter_id::TEXT;

-- Re-establish the Foreign Key
ALTER TABLE reports 
  ADD CONSTRAINT reports_reporter_id_fkey 
  FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;


-- 3. Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;


-- 4. Policy: Allow Insert for Authenticated Users ONLY
-- Optimized: Uses (SELECT auth.uid()) explicitly for performance caching
CREATE POLICY "Enable insert for authenticated users only"
ON reports FOR INSERT
WITH CHECK (
  (SELECT auth.role()) = 'authenticated' 
  AND 
  reporter_id = (SELECT auth.uid()::text)
);


-- 5. Policy: Full Access for Admins
-- Optimized: Uses (SELECT auth.uid()) explicitly for performance caching
CREATE POLICY "Enable full access for admins"
ON reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid()::text)
    AND profiles.role = 'admin'
  )
);
