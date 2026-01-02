-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Read: Everyone can see who follows who (needed for counts and checks)
CREATE POLICY "Enable read access for all users" ON follows
    FOR SELECT USING (true);

-- 2. Insert: Users can only follow others as themselves
CREATE POLICY "Enable insert for authenticated users as themselves" ON follows
    FOR INSERT WITH CHECK (auth.uid()::text = follower_id);

-- 3. Delete: Users can only unfollow (delete their own rows)
CREATE POLICY "Enable delete for users to unfollow" ON follows
    FOR DELETE USING (auth.uid()::text = follower_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
