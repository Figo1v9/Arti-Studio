-- Force fix for ID column migration
-- This script drops conflicting policies and constraints, alters the column types to TEXT to support Firebase UIDs, and recreates them.

BEGIN;

-- 1. Drop conflicting policies
DROP POLICY IF EXISTS "Enable write access for admins only" ON notifications;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Drop Foreign Key Constraints that depend on profiles.id
ALTER TABLE gallery_images DROP CONSTRAINT IF EXISTS gallery_images_author_id_fkey;
ALTER TABLE notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;

-- 3. Alter Column Types to TEXT
-- We need to change both the primary key and the foreign keys to match
ALTER TABLE profiles ALTER COLUMN id TYPE text;
ALTER TABLE gallery_images ALTER COLUMN author_id TYPE text;
ALTER TABLE notification_reads ALTER COLUMN user_id TYPE text;

-- 4. Re-add Foreign Keys
-- Note: We assume the data in tables is consistent or empty. If there are orphan records, this might fail, but usually fine for dev.
ALTER TABLE gallery_images 
ADD CONSTRAINT gallery_images_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id);

ALTER TABLE notification_reads 
ADD CONSTRAINT notification_reads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id);

-- 5. Re-create Policies with proper casting
-- We cast auth.uid() to text because it returns uuid by default in Supabase

-- Notifications Policy
CREATE POLICY "Enable write access for admins only" ON notifications
FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()::text
    and profiles.role = 'admin'
  )
);

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (id = auth.uid()::text);

COMMIT;
