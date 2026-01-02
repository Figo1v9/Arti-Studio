import { supabase } from '@/lib/supabase';
import { Announcement } from '@/types/database.types';

export const MarketingService = {
    /**
     * Get the current active announcement (if any).
     */
    getActiveAnnouncement: async () => {
        const now = new Date().toISOString();
        // Return array to avoid 406 Not Acceptable errors with single()/maybeSingle()
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`)
            .limit(1);

        if (error) {
            console.error('Error fetching announcement:', error);
            return null;
        }
        return (data && data.length > 0) ? (data[0] as Announcement) : null;
    },

    /**
     * Get all announcements for admin.
     */
    getAnnouncements: async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Announcement[];
    },

    /**
     * Create or update announcement.
     */
    upsertAnnouncement: async (announcement: Partial<Announcement>) => {
        const { error } = await supabase
            .from('announcements')
            .upsert(announcement)
            .select()
            .single();

        if (error) throw error;
    },

    /**
     * Toggle active status.
     */
    toggleActive: async (id: string, requestStatus: boolean) => {
        // If activating, we might want to deactivate others if we only support one at a time.
        // For now, let's assume one main banner.
        if (requestStatus) {
            await supabase.from('announcements').update({ is_active: false }).neq('id', id);
        }

        const { error } = await supabase
            .from('announcements')
            .update({ is_active: requestStatus })
            .eq('id', id);

        if (error) throw error;
    },

    deleteAnnouncement: async (id: string) => {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
    }
};
