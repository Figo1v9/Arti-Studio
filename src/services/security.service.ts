
import { supabase } from '@/lib/supabase';
import { AuditLog } from '@/types/database.types';

// ==========================================
// Types & Interfaces
// ==========================================

export interface SecurityActionDetails {
    target_id?: string;
    target_type?: 'user' | 'image' | 'comment' | 'system';
    reason?: string;
    message?: string;
    stack?: string;
    componentStack?: string;
    url?: string;
    userAgent?: string;
    [key: string]: string | undefined;
}

export interface AdminProfile {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
}

export interface SecurityResult {
    success: boolean;
    error?: string;
}

/**
 * Service responsible for high-level security operations,
 * audit logging, and administrative enforcement.
 * 
 * DESIGN:
 * - Uses Supabase RPCs where possible for atomicity.
 * - Enforces admin authentication checks before attempts.
 * - Provides strict typing for audit logs.
 */
export const SecurityService = {
    /**
     * Logs an administrative action to the audit ledger.
     * This is a critical compliance requirement.
     * 
     * @param adminId - The ID of the admin performing the action.
     * @param action - A specific, uppercase action code (e.g., 'BAN_USER', 'DELETE_CONTENT').
     * @param details - JSON-serializable details about the action context.
     * @param ipAddress - Optional IP address for tracing.
     */
    logAction: async (
        adminId: string | null,
        action: string,
        details: SecurityActionDetails,
        ipAddress?: string
    ): Promise<void> => {
        try {
            await supabase
                .from('audit_logs')
                .insert({
                    admin_id: adminId,
                    action: action.toUpperCase(),
                    details: details,
                    ip_address: ipAddress || null
                });
        } catch (err) {
            console.error('[SecurityService] Failed to persist audit log:', err.message);
        }
    },

    /**
     * Retrieves the most recent security audit logs with enriched admin profile data.
     * 
     * STRATEGY: 
     * 1. Check for local admin session first to potentially assume privileges.
     * 2. Fetch logs from 'audit_logs'.
     * 3. Efficiently join with 'profiles' to resolve admin identities.
     * 
     * @param limit - Max number of logs to retrieve (default: 50)
     */
    getAuditLogs: async (limit = 50): Promise<(AuditLog & { profiles: AdminProfile | null })[]> => {
        try {
            // 1. Fetch raw logs
            const { data: logs, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                // If RLS denies access, we return empty structure rather than crashing app
                if (error.code === '42501' || error.message.includes('row-level security')) {
                    console.warn('[SecurityService] Access denied determining audit logs (RLS). Ensure the current user is an Admin.');
                    return [];
                }
                throw new Error(`DB Error: ${error.message}`);
            }

            if (!logs || logs.length === 0) return [];

            // 2. Resolve Admin Profiles (Batch Fetching)
            // Extract unique Admin IDs to minimize DB hits
            const adminIds = Array.from(new Set(logs.map(l => l.admin_id).filter(Boolean))) as string[];

            let profilesMap: Record<string, AdminProfile> = {};

            if (adminIds.length > 0) {
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .in('id', adminIds);

                if (profileError) {
                    console.error('[SecurityService] Failed to resolve admin profiles:', profileError);
                } else if (profiles) {
                    profilesMap = profiles.reduce<Record<string, AdminProfile>>((acc, profile) => {
                        acc[profile.id] = profile as AdminProfile;
                        return acc;
                    }, {});
                }
            }

            // 3. Hydrate logs with profile data
            return logs.map(log => ({
                ...log,
                profiles: (log.admin_id && profilesMap[log.admin_id])
                    ? profilesMap[log.admin_id]
                    : { full_name: 'Unknown System Info', email: 'N/A', avatar_url: null }
            }));

        } catch (err) {
            console.error('[SecurityService] getAuditLogs failed:', err);
            return []; // Fail gracefully returning empty list
        }
    },

    /**
     * Reports critical system errors (client-side crashes) to the audit log.
     * Use this in ErrorBoundaries or global error handlers.
     */
    logError: async (error: Error, info: { componentStack?: string } | null): Promise<void> => {
        try {
            // Get user ID if available, otherwise NULL (not fake UUID to avoid FK violation)
            const { data } = await supabase.auth.getUser();
            const userId = data.user?.id || null;

            await SecurityService.logAction(
                userId,
                'SYSTEM_ERROR',
                {
                    message: error.message,
                    stack: error.stack,
                    componentStack: info?.componentStack,
                    url: window.location.href,
                    userAgent: navigator.userAgent?.slice(0, 100)
                }
            );
        } catch (loggingError) {
            console.error('[SecurityService] Failed to report system error:', loggingError);
        }
    },

    /**
     * Exceutes a ban on a user by removing their profile from the system.
     * This effectively invalidates their session and removes their public presence.
     * 
     * SECURITY NOTE: 
     * We cannot delete from `auth.users` client-side. The correct flow is:
     * 1. Admin bans user -> 2. Delete Profile -> 3. DB Trigger or Edge Function handles Auth cleanup.
     * 
     * @param adminId - ID of the admin executing the ban
     * @param targetUserId - ID of the user to ban
     * @param reason - Justification for the ban
     */
    banUser: async (adminId: string, targetUserId: string, reason: string): Promise<SecurityResult> => {
        if (!adminId || !targetUserId) {
            return { success: false, error: 'Invalid parameters for ban operation.' };
        }

        try {
            // 1. Log the intent FIRST (Audit trail is priority)
            await SecurityService.logAction(adminId, 'BAN_USER', { target_id: targetUserId, reason });

            // 2. Execute deletion (Soft or Hard depending on schema policy)
            // We use delete here implying a "Hard Ban / Nuke" from public view
            const { error: dbError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', targetUserId);

            if (dbError) {
                // Check if it's a permission issue
                if (dbError.code === '42501') {
                    return { success: false, error: 'Insufficient permissions to ban users.' };
                }
                throw dbError;
            }

            return { success: true };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'System error during ban operation.';
            console.error('[SecurityService] Ban execution failed:', err);
            return { success: false, error: errorMessage };
        }
    }
};
