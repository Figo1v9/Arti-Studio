
import { supabase, getCurrentFirebaseUid } from '@/lib/supabase';
import { Report } from '@/types/database.types';

// Profile data for reporters
interface ReporterProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
}

export const ModerationService = {
    /**
     * Submits a new report using RPC function.
     * Only authenticated users can submit reports.
     */
    submitReport: async (reporterId: string | null, targetId: string, targetType: 'image' | 'user', reason: string) => {
        // Use the stored Firebase UID for authentication
        const firebaseUid = getCurrentFirebaseUid();

        if (!firebaseUid) {
            throw new Error('You must be logged in to submit a report');
        }

        const { error } = await supabase.rpc('submit_report', {
            p_reporter_id: firebaseUid,
            p_target_id: targetId,
            p_target_type: targetType,
            p_reason: reason
        });

        if (error) throw error;
    },

    /**
     * Fetches reports using RPC function to bypass RLS.
     * MANUAL JOIN: Fetches reports then profiles to avoid foreign key issues.
     */
    getReports: async (status: 'pending' | 'resolved' | 'dismissed' = 'pending') => {
        // 1. Fetch reports using RPC function
        const { data: reports, error } = await supabase.rpc('get_pending_reports', {
            p_status: status
        });

        if (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
        if (!reports || reports.length === 0) return [];

        // 2. Fetch reporters
        const reporterIds = Array.from(new Set(reports.map(r => r.reporter_id).filter(Boolean))) as string[];

        let profilesMap: Record<string, ReporterProfile> = {};
        if (reporterIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .in('id', reporterIds);

            if (profiles) {
                profilesMap = profiles.reduce<Record<string, ReporterProfile>>((acc, profile) => {
                    acc[profile.id] = profile as ReporterProfile;
                    return acc;
                }, {});
            }
        }

        // 3. Attach reporter profile to report
        // The UI expects 'reporter' property
        return reports.map(report => ({
            ...report,
            reporter: report.reporter_id && profilesMap[report.reporter_id] ? profilesMap[report.reporter_id] : null
        }));
    },

    /**
     * Updates report status.
     * Uses RPC to bypass RLS policies that might block direct updates.
     */
    updateReportStatus: async (reportId: string, status: 'resolved' | 'dismissed') => {
        const { error } = await supabase.rpc('update_report_status', {
            p_report_id: reportId,
            p_status: status
        });

        if (error) throw error;
    },

    /**
     * Resolves a report by taking action (deleting the content).
     */
    resolveReport: async (reportId: string, targetType: 'image' | 'user', targetId: string) => {
        // 1. Delete the content
        const table = targetType === 'image' ? 'gallery_images' : 'profiles';
        const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('id', targetId);

        if (deleteError) throw deleteError;

        // 2. Mark report as resolved
        await ModerationService.updateReportStatus(reportId, 'resolved');
    }
};
