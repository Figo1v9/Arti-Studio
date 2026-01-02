-- ULTIMATE FIX V5 NUCLEAR: Drop EVERY possible policy variant
-- The error "policy Users can insert their own images ... depends on column author_id" confirms name mismatches.

BEGIN;

-- ----------------------------------------------------------------
-- 1. DROP ALL POLICIES (Aggressive List)
-- ----------------------------------------------------------------

-- GALLERY IMAGES
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON gallery_images;
DROP POLICY IF EXISTS "Users can upload their own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can insert their own images" ON gallery_images; -- The one causing error
DROP POLICY IF EXISTS "Users can update their own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can delete their own images" ON gallery_images;
DROP POLICY IF EXISTS "Enable read access for all users" ON gallery_images;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON gallery_images;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON gallery_images;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON gallery_images;

-- NOTIFICATION READS
DROP POLICY IF EXISTS "See reads" ON notification_reads;
DROP POLICY IF EXISTS "Enable read access for admins" ON notification_reads;
DROP POLICY IF EXISTS "Enable insert for users" ON notification_reads;
DROP POLICY IF EXISTS "Admins can view reads" ON notification_reads;
DROP POLICY IF EXISTS "Users can mark read" ON notification_reads;
DROP POLICY IF EXISTS "Users can mark as read" ON notification_reads;

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Enable read access for all users" ON notifications;
DROP POLICY IF EXISTS "Enable write access for admins only" ON notifications;
DROP POLICY IF EXISTS "Enable insert access for admins only" ON notifications;
DROP POLICY IF EXISTS "Enable update access for admins only" ON notifications;
DROP POLICY IF EXISTS "Enable delete access for admins only" ON notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- ----------------------------------------------------------------
-- 2. DROP CONSTRAINTS
-- ----------------------------------------------------------------
ALTER TABLE gallery_images DROP CONSTRAINT IF EXISTS gallery_images_author_id_fkey;
ALTER TABLE notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;

-- ----------------------------------------------------------------
-- 3. ALTER COLUMN TYPES (The Goal)
-- ----------------------------------------------------------------
ALTER TABLE profiles ALTER COLUMN id TYPE text;
ALTER TABLE gallery_images ALTER COLUMN author_id TYPE text;
ALTER TABLE notification_reads ALTER COLUMN user_id TYPE text;

-- ----------------------------------------------------------------
-- 4. RE-ADD CONSTRAINTS
-- ----------------------------------------------------------------
ALTER TABLE gallery_images 
ADD CONSTRAINT gallery_images_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id);

ALTER TABLE notification_reads 
ADD CONSTRAINT notification_reads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id);

-- ----------------------------------------------------------------
-- 5. RE-CREATE POLICIES
-- ----------------------------------------------------------------

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid()::text);

-- GALLERY IMAGES
CREATE POLICY "Public images are viewable by everyone" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Users can insert their own images" ON gallery_images FOR INSERT WITH CHECK (author_id = auth.uid()::text);
CREATE POLICY "Users can update their own images" ON gallery_images FOR UPDATE USING (author_id = auth.uid()::text);
CREATE POLICY "Users can delete their own images" ON gallery_images FOR DELETE USING (author_id = auth.uid()::text);

-- NOTIFICATIONS
CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for admins only" ON notifications FOR INSERT WITH CHECK (
  exists (select 1 from profiles where profiles.id = auth.uid()::text and profiles.role = 'admin')
);
CREATE POLICY "Enable update access for admins only" ON notifications FOR UPDATE USING (
  exists (select 1 from profiles where profiles.id = auth.uid()::text and profiles.role = 'admin')
);
CREATE POLICY "Enable delete access for admins only" ON notifications FOR DELETE USING (
  exists (select 1 from profiles where profiles.id = auth.uid()::text and profiles.role = 'admin')
);

-- NOTIFICATION READS
CREATE POLICY "Admins can view reads" ON notification_reads FOR SELECT USING (
  exists (select 1 from profiles where profiles.id = auth.uid()::text and profiles.role = 'admin')
);
CREATE POLICY "Users can mark read" ON notification_reads FOR INSERT WITH CHECK (user_id = auth.uid()::text);

COMMIT;
