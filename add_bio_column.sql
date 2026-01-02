-- Add bio column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
