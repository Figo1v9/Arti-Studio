-- FIX: Change id column type from UUID to TEXT to support Firebase UIDs
-- This is necessary because Firebase uses string IDs (e.g., '7Fj39...') while Supabase defaults to UUID.
-- Without this, profiles cannot be created for Firebase users.

ALTER TABLE profiles ALTER COLUMN id TYPE text;

-- ALSO: Ensure column owners exist if not already (just in case)
-- ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS author_name text;
