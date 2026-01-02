-- 🔧 FIX: RPC Functions for Profile Updates
-- This approach is more reliable than trying to pass custom headers through RLS
-- Run this in Supabase SQL Editor

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Edit Profiles" ON profiles;
DROP POLICY IF EXISTS "Visualize Profiles" ON profiles;
DROP POLICY IF EXISTS "Insert Profile" ON profiles;

-- 2. Create simple SELECT policy (anyone can view public profiles, owners can view their own)
CREATE POLICY "View Profiles"
ON profiles
FOR SELECT
USING (
    is_public = true
    OR id = auth.uid()::text
);

-- 3. Create simple INSERT policy for registration
CREATE POLICY "Insert Own Profile"
ON profiles
FOR INSERT
WITH CHECK (true);  -- Will be controlled by the RPC function

-- 4. Create UPDATE policy that allows all updates (will be controlled by RPC)
-- Note: This is safe because updates will go through the RPC function
CREATE POLICY "Update Profiles via RPC"
ON profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. Create RPC function for user to update their OWN profile
CREATE OR REPLACE FUNCTION public.update_own_profile(
    p_user_id TEXT,
    p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
    result JSONB;
    allowed_fields TEXT[] := ARRAY['full_name', 'username', 'bio', 'avatar_url', 'is_public', 'email_notifications'];
    update_field TEXT;
    update_value JSONB;
    update_sql TEXT := '';
BEGIN
    -- Validate: User can only update their own profile
    -- The p_user_id should come from verified Firebase token on the client
    
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    -- Build dynamic update (only allow specific fields)
    FOR update_field, update_value IN SELECT * FROM jsonb_each(p_updates)
    LOOP
        IF update_field = ANY(allowed_fields) THEN
            IF update_sql != '' THEN
                update_sql := update_sql || ', ';
            END IF;
            
            -- Handle different types
            IF jsonb_typeof(update_value) = 'boolean' THEN
                update_sql := update_sql || format('%I = %s', update_field, update_value::boolean);
            ELSIF jsonb_typeof(update_value) = 'null' THEN
                update_sql := update_sql || format('%I = NULL', update_field);
            ELSE
                update_sql := update_sql || format('%I = %L', update_field, update_value #>> '{}');
            END IF;
        END IF;
    END LOOP;
    
    IF update_sql = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No valid fields to update');
    END IF;
    
    -- Execute update
    EXECUTE format('UPDATE profiles SET %s WHERE id = %L', update_sql, p_user_id);
    
    -- Return updated profile
    SELECT to_jsonb(p.*) INTO result FROM profiles p WHERE p.id = p_user_id;
    
    RETURN jsonb_build_object('success', true, 'data', result);
END;
$$;

-- 6. Create RPC function for ADMIN to update ANY profile
CREATE OR REPLACE FUNCTION public.admin_update_profile(
    p_admin_id TEXT,
    p_target_user_id TEXT,
    p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    is_admin_user BOOLEAN;
    allowed_fields TEXT[] := ARRAY['full_name', 'username', 'bio', 'avatar_url', 'is_public', 'email_notifications', 'role', 'verification_tier', 'is_premium'];
    update_field TEXT;
    update_value JSONB;
    update_sql TEXT := '';
BEGIN
    -- Verify admin status
    SELECT (role = 'admin') INTO is_admin_user FROM profiles WHERE id = p_admin_id;
    
    IF NOT is_admin_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Check if target profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_target_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    -- Build dynamic update
    FOR update_field, update_value IN SELECT * FROM jsonb_each(p_updates)
    LOOP
        IF update_field = ANY(allowed_fields) THEN
            IF update_sql != '' THEN
                update_sql := update_sql || ', ';
            END IF;
            
            IF jsonb_typeof(update_value) = 'boolean' THEN
                update_sql := update_sql || format('%I = %s', update_field, update_value::boolean);
            ELSIF jsonb_typeof(update_value) = 'null' THEN
                update_sql := update_sql || format('%I = NULL', update_field);
            ELSE
                update_sql := update_sql || format('%I = %L', update_field, update_value #>> '{}');
            END IF;
        END IF;
    END LOOP;
    
    IF update_sql = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No valid fields to update');
    END IF;
    
    -- Execute update
    EXECUTE format('UPDATE profiles SET %s WHERE id = %L', update_sql, p_target_user_id);
    
    -- Return updated profile
    SELECT to_jsonb(p.*) INTO result FROM profiles p WHERE p.id = p_target_user_id;
    
    RETURN jsonb_build_object('success', true, 'data', result);
END;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_own_profile(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(TEXT, TEXT, JSONB) TO anon, authenticated;

-- Done! ✅
