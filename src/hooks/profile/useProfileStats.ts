import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useProfileStats = (profileId: string | undefined, currentUserId: string | undefined) => {
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

    const fetchFollowStats = useCallback(async () => {
        if (!profileId) return;

        try {
            // If viewing own profile, skip the isFollowing check entirely
            const isViewingOwn = currentUserId === profileId;

            // Base queries - always needed
            const followersQuery = supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', profileId);

            const followingQuery = supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', profileId);

            // Execute base queries in parallel
            const [followersResult, followingResult] = await Promise.all([
                followersQuery,
                followingQuery
            ]);

            setFollowersCount(followersResult.count || 0);
            setFollowingCount(followingResult.count || 0);

            // Only check isFollowing if user is logged in AND viewing someone else
            if (currentUserId && !isViewingOwn) {
                const { count } = await supabase
                    .from('follows')
                    .select('follower_id', { count: 'exact', head: true })
                    .eq('follower_id', currentUserId)
                    .eq('following_id', profileId);

                setIsFollowing((count || 0) > 0);
            } else {
                setIsFollowing(false);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [profileId, currentUserId]);

    // Initial fetch when profileId changes
    useEffect(() => {
        setFollowersCount(0);
        setFollowingCount(0);
        setIsFollowing(null);
        fetchFollowStats();
    }, [fetchFollowStats]);

    return {
        followersCount,
        setFollowersCount,
        followingCount,
        setFollowingCount,
        isFollowing,
        setIsFollowing,
        fetchFollowStats // exposed to allow manual refresh
    };
};
