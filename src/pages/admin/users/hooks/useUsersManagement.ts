import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Profile } from '@/types/database.types';
import { SecurityService } from '@/services/security.service';
import { useAuth } from '@/components/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserWithStats,
    UserStats,
    UserSortField,
    SortDirection,
    USER_SORT_OPTIONS
} from '../types/user.types';

/**
 * Fetch all user profiles from the database
 */
async function fetchProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Fetch user statistics (followers, copies, favorites) for all users
 * Uses efficient batch queries instead of N+1 queries
 */
async function fetchUserStats(userIds: string[]): Promise<Map<string, UserStats>> {
    if (userIds.length === 0) return new Map();

    const statsMap = new Map<string, UserStats>();

    // Initialize all users with zero stats
    userIds.forEach(id => {
        statsMap.set(id, {
            followersCount: 0,
            totalCopies: 0,
            totalFavorites: 0,
            imagesCount: 0
        });
    });

    // Fetch all data in parallel for maximum performance
    // Note: Supabase default limit is 1000 rows, we use range to get more if needed
    const [followersResult, imagesResult, favoritesResult] = await Promise.all([
        // 1. Get followers count for each user
        supabase
            .from('follows')
            .select('following_id')
            .range(0, 9999),

        // 2. Get images with their copies for each user
        supabase
            .from('gallery_images')
            .select('author_id, copies')
            .range(0, 9999),

        // 3. Get favorites count for images (by image author)
        supabase
            .from('favorites')
            .select('image_id, gallery_images!inner(author_id)')
            .range(0, 9999)
    ]);

    // Log errors if any
    if (followersResult.error) console.error('Error fetching followers:', followersResult.error);
    if (imagesResult.error) console.error('Error fetching images:', imagesResult.error);
    if (favoritesResult.error) console.error('Error fetching favorites:', favoritesResult.error);

    // Process followers
    if (followersResult.data) {
        const followerCounts = new Map<string, number>();
        followersResult.data.forEach((row: { following_id: string }) => {
            const current = followerCounts.get(row.following_id) || 0;
            followerCounts.set(row.following_id, current + 1);
        });

        followerCounts.forEach((count, userId) => {
            const stats = statsMap.get(userId);
            if (stats) {
                stats.followersCount = count;
            }
        });
    }

    // Process images and copies
    if (imagesResult.data) {

        const imageCounts = new Map<string, number>();
        const copyCounts = new Map<string, number>();

        imagesResult.data.forEach((img: { author_id: string; copies: number | null }) => {
            // Count images
            const currentImages = imageCounts.get(img.author_id) || 0;
            imageCounts.set(img.author_id, currentImages + 1);

            // Sum copies - handle null/undefined values safely
            const copiesValue = typeof img.copies === 'number' ? img.copies : 0;
            const currentCopies = copyCounts.get(img.author_id) || 0;
            copyCounts.set(img.author_id, currentCopies + copiesValue);
        });

        imageCounts.forEach((count, userId) => {
            const stats = statsMap.get(userId);
            if (stats) {
                stats.imagesCount = count;
            }
        });

        copyCounts.forEach((count, userId) => {
            const stats = statsMap.get(userId);
            if (stats) {
                stats.totalCopies = count;
            }
        });


    }

    // Process favorites
    if (favoritesResult.data) {
        const favoriteCounts = new Map<string, number>();

        favoritesResult.data.forEach((fav: { image_id: string; gallery_images: { author_id: string } }) => {
            const authorId = fav.gallery_images?.author_id;
            if (authorId) {
                const current = favoriteCounts.get(authorId) || 0;
                favoriteCounts.set(authorId, current + 1);
            }
        });

        favoriteCounts.forEach((count, userId) => {
            const stats = statsMap.get(userId);
            if (stats) {
                stats.totalFavorites = count;
            }
        });
    }

    return statsMap;
}

/**
 * Combine profiles with their stats
 */
async function fetchUsersWithStats(): Promise<UserWithStats[]> {
    const profiles = await fetchProfiles();
    const userIds = profiles.map(p => p.id);
    const statsMap = await fetchUserStats(userIds);

    return profiles.map(profile => ({
        ...profile,
        stats: statsMap.get(profile.id) || {
            followersCount: 0,
            totalCopies: 0,
            totalFavorites: 0,
            imagesCount: 0
        }
    }));
}

export function useUsersManagement() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Sort state - default to newest first
    const [sortField, setSortField] = useState<UserSortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Modal State
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // React Query for fetching users with stats
    const {
        data: users = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['admin-users-with-stats'],
        queryFn: fetchUsersWithStats,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Handle query errors
    useEffect(() => {
        if (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    }, [error]);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('users-management-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => {
                queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => {
                queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, () => {
                queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Mutation for Deleting Users
    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await SecurityService.banUser(currentUser?.uid || 'system', userId, 'Admin manual delete');
        },
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] });
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    });

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? Action cannot be undone.')) return;
        deleteMutation.mutate(userId);
    };

    // Stats Calculation (Memoized)
    const stats = useMemo(() => {
        if (!users) return { total: 0, admins: 0, newUsers: 0, chartData: [] };

        const total = users.length;
        const admins = users.filter(u => u.role === 'admin').length;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsers = users.filter(u => new Date(u.created_at) >= startOfMonth).length;

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const chartData = last7Days.map(date => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const count = users.filter(u => {
                const userDate = new Date(u.created_at);
                userDate.setHours(0, 0, 0, 0);
                return userDate.getTime() === date.getTime();
            }).length;
            return { name: dayName, count };
        });

        return { total, admins, newUsers, chartData };
    }, [users]);

    // Client-Side Filtering and Sorting
    const filteredUsers = useMemo(() => {
        if (!users) return [];

        // Step 1: Filter
        let result = users.filter((user) => {
            const query = searchQuery.toLowerCase().trim();
            const effectiveQuery = query.includes('/') ? query.split('/').pop() || query : query;

            const matchesSearch =
                (user.email?.toLowerCase().includes(effectiveQuery) || false) ||
                (user.full_name?.toLowerCase().includes(effectiveQuery) || false) ||
                (user.id?.toLowerCase().includes(effectiveQuery) || false) ||
                (user.username?.toLowerCase().includes(effectiveQuery) || false);

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });

        // Step 2: Sort
        result = [...result].sort((a, b) => {
            let valueA: number | string;
            let valueB: number | string;

            switch (sortField) {
                case 'followers':
                    valueA = a.stats.followersCount;
                    valueB = b.stats.followersCount;
                    break;
                case 'copies':
                    valueA = a.stats.totalCopies;
                    valueB = b.stats.totalCopies;
                    break;
                case 'favorites':
                    valueA = a.stats.totalFavorites;
                    valueB = b.stats.totalFavorites;
                    break;
                case 'images':
                    valueA = a.stats.imagesCount;
                    valueB = b.stats.imagesCount;
                    break;
                case 'created_at':
                default:
                    valueA = new Date(a.created_at).getTime();
                    valueB = new Date(b.created_at).getTime();
                    break;
            }

            // Compare values
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return 0;
        });

        return result;
    }, [users, searchQuery, roleFilter, sortField, sortDirection]);

    /**
     * Set sort by combining field and direction
     */
    const setSort = (field: UserSortField, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    /**
     * Get current sort key for Select component
     */
    const getCurrentSortKey = (): string => {
        return `${sortField}-${sortDirection}`;
    };

    /**
     * Parse sort key from Select component
     */
    const handleSortChange = (value: string) => {
        const option = USER_SORT_OPTIONS.find(
            opt => `${opt.field}-${opt.direction}` === value
        );
        if (option) {
            setSort(option.field, option.direction);
        }
    };

    return {
        users,
        loading,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        sortField,
        sortDirection,
        setSort,
        getCurrentSortKey,
        handleSortChange,
        selectedUser,
        setSelectedUser,
        detailsOpen,
        setDetailsOpen,
        fetchUsers: () => queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] }),
        handleDeleteUser,
        stats,
        filteredUsers
    };
}
