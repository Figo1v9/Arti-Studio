-- Migration to add settings columns to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;

-- Update RLS if needed (Usually users can update their own rows so standard update policy covers this)
