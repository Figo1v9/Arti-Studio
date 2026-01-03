-- ==============================================================================
-- 🛠️ ARTI STUDIO ADMIN RPC MIGRATION (FINAL WORKING VERSION)
-- ==============================================================================

-- Create admin_update_profile function
-- This allows admins to bypass RLS safely
-- INCLUDES SPECIAL BYPASS FOR LOCAL ADMINS ('admin-manual-id')

CREATE OR REPLACE FUNCTION public.admin_update_profile(
    p_admin_id text,
    p_target_user_id text,
    p_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_role text;
BEGIN
    -- 1. Security Check
    -- 🚨 BYPASS FOR LOCAL ADMIN: If manual admin ID, skip DB check
    IF p_admin_id = 'admin-manual-id' THEN
        -- Force verify passed (Proceed to update immediately)
        NULL; 
    ELSE
        -- Normal Check for Real Users (Firebase Auth Admins)
        SELECT role INTO v_admin_role
        FROM public.profiles
        WHERE id = p_admin_id;

        IF v_admin_role IS DISTINCT FROM 'admin' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Requester is not an admin');
        END IF;
    END IF;

    -- 2. Perform Update
    UPDATE public.profiles
    SET 
        role = COALESCE((p_updates->>'role')::text, role),
        verification_tier = COALESCE((p_updates->>'verification_tier')::text, verification_tier),
        is_premium = COALESCE((p_updates->>'is_premium')::boolean, is_premium),
        full_name = COALESCE((p_updates->>'full_name')::text, full_name),
        bio = COALESCE((p_updates->>'bio')::text, bio)
    WHERE id = p_target_user_id;

    RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
