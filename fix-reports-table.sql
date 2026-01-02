-- =====================================================
-- FIX: Reports Table - Change reporter_id from UUID to TEXT
-- =====================================================
-- 
-- This migration fixes the 400 Bad Request error:
-- "invalid input syntax for type uuid: 'YVbchcfLnHZ259CxbrRsj05hxNI3'"
--
-- The issue: Firebase uses string UIDs (not UUIDs), but the reports table
-- expects UUID type for reporter_id column.
--
-- Run this in Supabase SQL Editor:
-- =====================================================

-- Step 1: Drop the foreign key constraint
ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;

-- Step 2: Change column type from UUID to TEXT
ALTER TABLE reports 
ALTER COLUMN reporter_id TYPE TEXT USING reporter_id::TEXT;

-- Step 3: Re-add the foreign key constraint (pointing to profiles.id which is TEXT)
ALTER TABLE reports
ADD CONSTRAINT reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =====================================================
-- Done! The reports table now accepts Firebase UIDs
-- =====================================================
