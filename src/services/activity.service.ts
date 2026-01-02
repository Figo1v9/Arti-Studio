import { supabase } from '@/lib/supabase';

export type ActivityType =
    | 'follow'
    | 'unfollow'
    | 'like'
    | 'view_milestone'      // 100, 500, 1000 views
    | 'copy_milestone'      // 50, 100, 500 copies
    | 'follower_milestone'  // 10, 50, 100 followers
    | 'upload';

// Metadata structure for activities
interface ActivityMetadata {
    milestone?: number;
    currentCount?: number;
    [key: string]: string | number | undefined;
}

// Follow data from Supabase
interface FollowRecord {
    following_id: string;
}

export interface ActivityItem {
    id: string;
    user_id: string;
    type: ActivityType;
    target_id: string | null;      // image_id, user_id, etc.
    target_type: string | null;    // 'image', 'user', etc.
    metadata: ActivityMetadata; // Additional context
    created_at: string;
    // Joined data
    actor_name?: string;
    actor_avatar?: string;
    target_name?: string;
    target_image_url?: string;
}

/**
 * Activity Service - Tracks user activities for feed
 */
export const ActivityService = {
    /**
     * Log an activity event
     */
    logActivity: async (
        userId: string,
        type: ActivityType,
        targetId?: string,
        targetType?: string,
        metadata?: ActivityMetadata
    ): Promise<void> => {
        try {
            const { error } = await supabase
                .from('activity_feed')
                .insert({
                    user_id: userId,
                    type,
                    target_id: targetId || null,
                    target_type: targetType || null,
                    metadata: metadata || {}
                } as ActivityMetadata);

            if (error) {
                console.error('Error logging activity:', error);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    /**
     * Get activity feed for a user (their own activities)
     */
    getUserActivities: async (userId: string, limit: number = 20): Promise<ActivityItem[]> => {
        try {
            const { data, error } = await supabase
                .from('activity_feed')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data || []) as ActivityItem[];
        } catch (error) {
            console.error('Error fetching user activities:', error);
            return [];
        }
    },

    /**
     * Get activity feed for users that the current user follows
     */
    getFollowingActivities: async (userId: string, limit: number = 50): Promise<ActivityItem[]> => {
        try {
            // First get list of users this user follows
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId);

            if (!follows || follows.length === 0) {
                return [];
            }

            const followingIds = (follows as FollowRecord[]).map(f => f.following_id);

            // Get activities from followed users
            const { data, error } = await supabase
                .from('activity_feed')
                .select('*')
                .in('user_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data || []) as ActivityItem[];
        } catch (error) {
            console.error('Error fetching following activities:', error);
            return [];
        }
    },

    /**
     * Check and log milestone achievements
     */
    checkMilestones: async (
        userId: string,
        type: 'views' | 'copies' | 'followers',
        currentCount: number
    ): Promise<void> => {
        const milestones = {
            views: [100, 500, 1000, 5000, 10000],
            copies: [50, 100, 500, 1000],
            followers: [10, 50, 100, 500, 1000]
        };

        const activityType: ActivityType =
            type === 'views' ? 'view_milestone' :
                type === 'copies' ? 'copy_milestone' : 'follower_milestone';

        const relevantMilestones = milestones[type].filter(m => currentCount >= m);

        if (relevantMilestones.length === 0) return;

        try {
            // Optimization: Fetch all already logged milestones of this type in one go
            // instead of checking one by one in a loop
            const { data: existingData } = await supabase
                .from('activity_feed')
                .select('metadata')
                .eq('user_id', userId)
                .eq('type', activityType);

            const existingMilestones = new Set(
                (existingData || []).map((row) => (row.metadata as ActivityMetadata)?.milestone)
            );

            // Filter out already achieved milestones
            const newMilestones = relevantMilestones.filter(m => !existingMilestones.has(m));

            if (newMilestones.length === 0) return;

            // Log all new milestones in parallel
            await Promise.all(newMilestones.map(milestone =>
                ActivityService.logActivity(
                    userId,
                    activityType,
                    undefined,
                    undefined,
                    { milestone, currentCount }
                )
            ));
        } catch (error) {
            console.error('Error checking milestones:', error);
        }
    },

    /**
     * Log a follow event
     */
    logFollow: async (followerId: string, followingId: string): Promise<void> => {
        await ActivityService.logActivity(
            followerId,
            'follow',
            followingId,
            'user'
        );
    },

    /**
     * Log an image upload event
     */
    logUpload: async (userId: string, imageId: string): Promise<void> => {
        await ActivityService.logActivity(
            userId,
            'upload',
            imageId,
            'image'
        );
    },

    /**
     * Delete old activities (cleanup - keep last 90 days)
     */
    cleanupOldActivities: async (): Promise<void> => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        try {
            await supabase
                .from('activity_feed')
                .delete()
                .lt('created_at', cutoffDate.toISOString());
        } catch (error) {
            console.error('Error cleaning up activities:', error);
        }
    }
};
