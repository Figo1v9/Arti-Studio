import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Firebase UID storage for RLS (Row Level Security)
 * This is used by RPC functions to identify the current user
 */
let currentFirebaseUid: string | null = null;

/**
 * Supabase Client Configuration - Optimized for Scale (1M+ users)
 * 
 * CRITICAL SETUP REQUIRED IN SUPABASE DASHBOARD:
 * ================================================
 * 1. Go to: Project Settings → Database → Connection Pooling
 * 2. Enable "Transaction Mode" (NOT Session Mode)
 * 3. Use the "Pooler" connection string in production
 * 
 * WHY THIS MATTERS:
 * - Postgres has a max connection limit (~60-500 depending on plan)
 * - Transaction Mode: Each request uses a connection briefly, then releases it
 * - Without pooling: 5000 concurrent users will exhaust connections
 * - With pooling: 1M+ concurrent users can share the pool efficiently
 * 
 * IMPORTANT: The frontend client uses the REST API via PostgREST,
 * which already handles connection pooling. Direct connections 
 * (via Edge Functions) need explicit pooler configuration.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Set the Firebase UID for authenticated operations
 * Call this when Firebase auth state changes
 */
export const setSupabaseAuthHeader = (uid: string | null) => {
    currentFirebaseUid = uid;
    // Firebase UID stored for RLS
};

/**
 * Get the currently stored Firebase UID
 */
export const getCurrentFirebaseUid = (): string | null => currentFirebaseUid;

// ============================================
// RPC WRAPPER FUNCTIONS FOR PROFILE OPERATIONS
// ============================================

// Profile update types based on database schema
type ProfileUpdates = Partial<Database['public']['Tables']['profiles']['Update']>;

interface RpcResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Update own profile using RPC function
 * This bypasses RLS issues by using a SECURITY DEFINER function
 */
export const updateOwnProfile = async (
    updates: ProfileUpdates
): Promise<RpcResult> => {
    if (!currentFirebaseUid) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase.rpc('update_own_profile', {
            p_user_id: currentFirebaseUid,
            p_updates: updates as unknown as Record<string, unknown>
        });

        if (error) {
            console.error('RPC update_own_profile error:', error);
            return { success: false, error: error.message };
        }

        return data as unknown as RpcResult;
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error('RPC call failed:', err);
        return { success: false, error };
    }
};

/**
 * Admin update any profile using RPC function OR direct update
 * Supports both Firebase-authenticated admins and local admin sessions
 */
export const adminUpdateProfile = async (
    targetUserId: string,
    updates: ProfileUpdates
): Promise<RpcResult> => {
    // 1. Check for local admin session
    const adminSession = localStorage.getItem('admin_session');
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

    let isLocalAdmin = false;

    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            if (ADMIN_EMAIL && ADMIN_PASSWORD) {
                const expectedSignature = btoa(`${session.email}-${session.timestamp}-${ADMIN_PASSWORD}`);
                isLocalAdmin =
                    session.isAdmin &&
                    session.email === ADMIN_EMAIL &&
                    session.signature === expectedSignature &&
                    (Date.now() - session.timestamp < 24 * 60 * 60 * 1000); // 24h expiry
            }
        } catch (e) {
            // Invalid session
        }
    }

    // 2. Try RPC FIRST if authenticated (Best for Firebase Admins)
    // This uses SECURITY DEFINER privileges on the server
    if (currentFirebaseUid) {
        try {
            const { data, error } = await supabase.rpc('admin_update_profile', {
                p_admin_id: currentFirebaseUid,
                p_target_user_id: targetUserId,
                p_updates: updates as unknown as Record<string, unknown>
            });

            // If successful, we are done
            if (!error) {
                return data as unknown as RpcResult;
            }

            // If RPC failed but we are a Local Admin, we might try the fallback
            // (Only if the error suggests authorization failure, but let's try fallback regardless if Local Admin)
            if (!isLocalAdmin) {
                console.error('RPC admin_update_profile error:', error);
                return { success: false, error: error.message };
            }

            console.warn('RPC failed, falling back to Local Admin Direct Update:', error.message);
        } catch (err) {
            console.error('RPC call failed:', err);
            // Continue to fallback if local admin...
        }
    }

    // 3. Fallback: Local Admin Direct Update
    // This runs as 'anon' role (standard client key), so it relies on specific RLS policies
    if (isLocalAdmin) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', targetUserId)
                .select(); // CRITICAL: Select to verify update happened

            if (error) {
                console.error('Direct admin update error:', error);
                return { success: false, error: error.message };
            }

            // Check if any rows were actually touched
            if (!data || data.length === 0) {
                console.error('Direct update returned 0 rows. RLS likely blocked it.');
                return {
                    success: false,
                    error: 'Update failed. Database permissions (RLS) prevented this change.'
                };
            }

            return { success: true, data: updates };
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            console.error('Direct update failed:', err);
            return { success: false, error };
        }
    }

    return { success: false, error: 'Not authorized' };
};

// Legacy export for backward compatibility
export const getAuthenticatedSupabase = (): SupabaseClient<Database> => {
    console.warn('⚠️ getAuthenticatedSupabase is deprecated. Use RPC functions instead.');
    return supabase;
};

