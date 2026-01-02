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
    // Check for local admin session first
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

    // If local admin, perform direct update (bypasses RPC)
    if (isLocalAdmin) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', targetUserId);

            if (error) {
                console.error('Direct admin update error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: updates };
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            console.error('Direct update failed:', err);
            return { success: false, error };
        }
    }

    // Fallback to RPC for Firebase-authenticated admins
    if (!currentFirebaseUid) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase.rpc('admin_update_profile', {
            p_admin_id: currentFirebaseUid,
            p_target_user_id: targetUserId,
            p_updates: updates as unknown as Record<string, unknown>
        });

        if (error) {
            console.error('RPC admin_update_profile error:', error);
            return { success: false, error: error.message };
        }

        return data as unknown as RpcResult;
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error('RPC call failed:', err);
        return { success: false, error };
    }
};

// Legacy export for backward compatibility
export const getAuthenticatedSupabase = (): SupabaseClient<Database> => {
    console.warn('⚠️ getAuthenticatedSupabase is deprecated. Use RPC functions instead.');
    return supabase;
};

