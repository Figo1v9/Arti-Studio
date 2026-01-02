  -- ULTIMATE FIX V4: Drop ABSOLUTELY EVERYTHING related to policies before altering types
  -- The error "policy See reads ... depends on column id" implies we missed some policies.

  BEGIN;

  -- 1. Drop Policies on notification_reads (The source of the latest error)
  DROP POLICY IF EXISTS "See reads" ON notification_reads;
  DROP POLICY IF EXISTS "Enable read access for admins" ON notification_reads;
  DROP POLICY IF EXISTS "Enable insert for users" ON notification_reads;
  DROP POLICY IF EXISTS "Admins can view reads" ON notification_reads;

  -- 2. Drop Policies on notifications
  DROP POLICY IF EXISTS "Enable read access for all users" ON notifications;
  DROP POLICY IF EXISTS "Enable write access for admins only" ON notifications;
  DROP POLICY IF EXISTS "Enable insert access for admins only" ON notifications;
  DROP POLICY IF EXISTS "Enable update access for admins only" ON notifications;
  DROP POLICY IF EXISTS "Enable delete access for admins only" ON notifications;
  DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;

  -- 3. Drop Policies on profiles
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

  -- 4. Drop Policies on gallery_images (Just to be safe)
  DROP POLICY IF EXISTS "Public images are viewable by everyone" ON gallery_images;
  DROP POLICY IF EXISTS "Users can upload their own images" ON gallery_images;
  DROP POLICY IF EXISTS "Users can update their own images" ON gallery_images;
  DROP POLICY IF EXISTS "Users can delete their own images" ON gallery_images;

  -- 5. Drop Foreign Key Constraints
  ALTER TABLE gallery_images DROP CONSTRAINT IF EXISTS gallery_images_author_id_fkey;
  ALTER TABLE notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;

  -- 6. Alter Column Types to TEXT
  ALTER TABLE profiles ALTER COLUMN id TYPE text;
  ALTER TABLE gallery_images ALTER COLUMN author_id TYPE text;
  ALTER TABLE notification_reads ALTER COLUMN user_id TYPE text;

  -- 7. Re-add Foreign Keys
  ALTER TABLE gallery_images 
  ADD CONSTRAINT gallery_images_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES profiles(id);

  ALTER TABLE notification_reads 
  ADD CONSTRAINT notification_reads_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id);

  -- 8. Re-create Policies

  -- Notifications Policies
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

  -- Profiles Policies
  CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid()::text);
  CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid()::text);

  -- Gallery Images Policies (Simple defaults)
  CREATE POLICY "Public images are viewable by everyone" ON gallery_images FOR SELECT USING (true);
  CREATE POLICY "Users can upload their own images" ON gallery_images FOR INSERT WITH CHECK (author_id = auth.uid()::text);
  CREATE POLICY "Users can update their own images" ON gallery_images FOR UPDATE USING (author_id = auth.uid()::text);
  CREATE POLICY "Users can delete their own images" ON gallery_images FOR DELETE USING (author_id = auth.uid()::text);

  -- Notification Reads Policies
  CREATE POLICY "Admins can view reads" ON notification_reads FOR SELECT USING (
    exists (select 1 from profiles where profiles.id = auth.uid()::text and profiles.role = 'admin')
  );
  -- Allow users to mark as read (insert)
  CREATE POLICY "Users can mark read" ON notification_reads FOR INSERT WITH CHECK (user_id = auth.uid()::text);

  COMMIT;
