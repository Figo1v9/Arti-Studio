-- Create a table to store FCM tokens for users
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fcm_token TEXT NOT NULL,
    device_type TEXT DEFAULT 'web',
    platform TEXT,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one token is only stored once per user (prevent duplicates)
    UNIQUE(user_id, fcm_token)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can insert their own tokens
CREATE POLICY "Users can insert their own devices" 
ON public.user_devices FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own devices
CREATE POLICY "Users can view their own devices" 
ON public.user_devices FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Users can update their own devices (e.g., last_active)
CREATE POLICY "Users can update their own devices" 
ON public.user_devices FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own devices (e.g., logout)
CREATE POLICY "Users can delete their own devices" 
ON public.user_devices FOR DELETE 
USING (auth.uid() = user_id);

-- Create an index on fcm_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_devices_token ON public.user_devices(fcm_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);

-- Optional: Function to update last_active automatically
CREATE OR REPLACE FUNCTION update_last_active_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_active_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_devices_last_active
BEFORE UPDATE ON public.user_devices
FOR EACH ROW
EXECUTE PROCEDURE update_last_active_column();
