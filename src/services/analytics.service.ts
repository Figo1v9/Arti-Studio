import { supabase } from '@/lib/supabase';

/**
 * Comprehensive Analytics Service
 * Provides all analytics functionality for the admin dashboard
 * 
 * Features:
 * - Date range filtering (永久保存、可按任意时间段筛选)
 * - Batched search logging for performance
 * - RPC-based aggregations for speed
 */

// ===========================================
// TYPES
// ===========================================

export interface DateRange {
    start: Date;
    end: Date;
}

export interface AnalyticsSummary {
    newUsers: number;
    newImages: number;
    totalViews: number;
    totalCopies: number;
    periodViews: number;
    totalSearches: number;
}

export interface GrowthDataPoint {
    date: string;
    day: string;
    users: number;
    images: number;
}

export interface TopSearch {
    term: string;
    count: number;
}

export interface ActiveUser {
    userId: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    imagesCount: number;
    followersCount: number;
    followingCount: number;
    totalViews: number;
    totalCopies: number;
}

export interface CategoryStat {
    category: string;
    imagesCount: number;
    totalViews: number;
    totalCopies: number;
}

export interface TopImage {
    id: string;
    url: string;
    prompt: string;
    category: string;
    views: number;
    copies: number;
    createdAt: string;
    authorUsername: string | null;
    authorAvatar: string | null;
}

export interface ZeroResultSearch {
    query: string;
    createdAt: string;
}

// ===========================================
// BATCHED SEARCH LOGGING (Performance Optimized)
// ===========================================

const searchBatch: Array<{ query: string; userId: string | null; resultsCount: number }> = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const flushSearchBatch = async () => {
    if (searchBatch.length === 0) return;

    const toFlush = [...searchBatch];
    searchBatch.length = 0;

    const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    try {
        const records = toFlush.map(s => ({
            query: s.query.trim(),
            user_id: s.userId && isValidUuid(s.userId) ? s.userId : null,
            results_count: s.resultsCount
        }));

        await supabase.from('search_analytics').insert(records);
    } catch (err) {
        console.warn('Error batch logging searches:', err);
    }
};

// Setup flush on interval and page unload
if (typeof window !== 'undefined') {
    setInterval(flushSearchBatch, 10000); // Every 10 seconds
    window.addEventListener('beforeunload', flushSearchBatch);
}

// ===========================================
// PREDEFINED DATE RANGES
// ===========================================

export const DateRanges = {
    today: (): DateRange => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },

    yesterday: (): DateRange => {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },

    last7Days: (): DateRange => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    },

    last30Days: (): DateRange => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    },

    last90Days: (): DateRange => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(start.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    },

    thisMonth: (): DateRange => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
    },

    lastMonth: (): DateRange => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { start, end };
    },

    thisYear: (): DateRange => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
    },

    lastYear: (): DateRange => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return { start, end };
    },

    allTime: (): DateRange => {
        const start = new Date(2020, 0, 1, 0, 0, 0, 0); // Platform launch date
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
    },

    custom: (start: Date, end: Date): DateRange => {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        return { start: startDate, end: endDate };
    }
};

// ===========================================
// ANALYTICS SERVICE
// ===========================================

export const AnalyticsService = {
    /**
     * Log a search query (batched for performance)
     */
    logSearch: async (query: string, userId: string | null, resultsCount: number) => {
        if (!query.trim()) return;

        searchBatch.push({ query, userId, resultsCount });

        if (flushTimeout) clearTimeout(flushTimeout);
        flushTimeout = setTimeout(flushSearchBatch, 3000);
    },

    /**
     * Get analytics summary for a date range
     */
    getAnalyticsSummary: async (dateRange: DateRange): Promise<AnalyticsSummary> => {
        try {
            // Try RPC first (faster if available)
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_analytics_summary', {
                start_date: dateRange.start.toISOString(),
                end_date: dateRange.end.toISOString()
            });

            if (!rpcError && rpcData) {
                return {
                    newUsers: rpcData.new_users || 0,
                    newImages: rpcData.new_images || 0,
                    totalViews: rpcData.total_views || 0,
                    totalCopies: rpcData.total_copies || 0,
                    periodViews: rpcData.period_views || 0,
                    totalSearches: rpcData.total_searches || 0
                };
            }

            // Fallback to client-side queries
            const [usersResult, imagesResult, statsResult, searchResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', dateRange.start.toISOString())
                    .lte('created_at', dateRange.end.toISOString()),
                supabase
                    .from('gallery_images')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', dateRange.start.toISOString())
                    .lte('created_at', dateRange.end.toISOString()),
                supabase
                    .from('gallery_images')
                    .select('views, copies'),
                supabase
                    .from('search_analytics')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', dateRange.start.toISOString())
                    .lte('created_at', dateRange.end.toISOString())
            ]);

            const stats = statsResult.data || [];
            const totalViews = stats.reduce((acc, img) => acc + (img.views || 0), 0);
            const totalCopies = stats.reduce((acc, img) => acc + (img.copies || 0), 0);

            return {
                newUsers: usersResult.count || 0,
                newImages: imagesResult.count || 0,
                totalViews,
                totalCopies,
                periodViews: 0,
                totalSearches: searchResult.count || 0
            };
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            return {
                newUsers: 0,
                newImages: 0,
                totalViews: 0,
                totalCopies: 0,
                periodViews: 0,
                totalSearches: 0
            };
        }
    },

    /**
     * Get growth data (users and images per day)
     */
    getGrowthData: async (dateRange: DateRange): Promise<GrowthDataPoint[]> => {
        try {
            // Try RPC first
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_growth_data', {
                start_date: dateRange.start.toISOString(),
                end_date: dateRange.end.toISOString()
            });

            if (!rpcError && rpcData && Array.isArray(rpcData)) {
                return rpcData.map((row: { day: string; users_count: number; images_count: number }) => ({
                    date: row.day,
                    day: new Date(row.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    users: row.users_count || 0,
                    images: row.images_count || 0
                }));
            }

            // Fallback: Client-side aggregation
            const [usersResult, imagesResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('created_at')
                    .gte('created_at', dateRange.start.toISOString())
                    .lte('created_at', dateRange.end.toISOString())
                    .order('created_at', { ascending: true }),
                supabase
                    .from('gallery_images')
                    .select('created_at')
                    .gte('created_at', dateRange.start.toISOString())
                    .lte('created_at', dateRange.end.toISOString())
                    .order('created_at', { ascending: true })
            ]);

            const users = usersResult.data || [];
            const images = imagesResult.data || [];

            // Generate day-by-day data
            const days: GrowthDataPoint[] = [];
            const currentDate = new Date(dateRange.start);

            while (currentDate <= dateRange.end) {
                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);

                const usersCount = users.filter(u => {
                    const d = new Date(u.created_at);
                    return d >= dayStart && d <= dayEnd;
                }).length;

                const imagesCount = images.filter(i => {
                    const d = new Date(i.created_at);
                    return d >= dayStart && d <= dayEnd;
                }).length;

                days.push({
                    date: currentDate.toISOString().split('T')[0],
                    day: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    users: usersCount,
                    images: imagesCount
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return days;
        } catch (error) {
            console.error('Error fetching growth data:', error);
            return [];
        }
    },

    /**
     * Get top search terms for a period
     */
    getTopSearches: async (dateRange: DateRange, limit = 10): Promise<TopSearch[]> => {
        try {
            // Try RPC first
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_top_searches_in_period', {
                start_date: dateRange.start.toISOString(),
                end_date: dateRange.end.toISOString(),
                limit_count: limit
            });

            if (!rpcError && rpcData && Array.isArray(rpcData)) {
                return rpcData.map((row: { term: string; search_count: number }) => ({
                    term: row.term,
                    count: row.search_count
                }));
            }

            // Fallback
            const { data, error } = await supabase
                .from('search_analytics')
                .select('query')
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString())
                .limit(1000);

            if (error) throw error;

            const counts: Record<string, number> = {};
            data?.forEach((item) => {
                const q = item.query.toLowerCase();
                counts[q] = (counts[q] || 0) + 1;
            });

            return Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([term, count]) => ({ term, count }));
        } catch (error) {
            console.error('Error fetching top searches:', error);
            return [];
        }
    },

    /**
     * Get searches with zero results
     */
    getZeroResultSearches: async (dateRange: DateRange, limit = 10): Promise<ZeroResultSearch[]> => {
        try {
            const { data, error } = await supabase
                .from('search_analytics')
                .select('query, created_at')
                .eq('results_count', 0)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString())
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(item => ({
                query: item.query,
                createdAt: item.created_at
            }));
        } catch (error) {
            console.error('Error fetching zero result searches:', error);
            return [];
        }
    },

    /**
     * Get most active users
     */
    getMostActiveUsers: async (limit = 10): Promise<ActiveUser[]> => {
        try {
            // Try RPC first
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_most_active_users', {
                limit_count: limit
            });

            if (!rpcError && rpcData && Array.isArray(rpcData)) {
                return rpcData.map((row: {
                    user_id: string;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    images_count: number;
                    followers_count: number;
                    following_count: number;
                    total_views: number;
                    total_copies: number;
                }) => ({
                    userId: row.user_id,
                    username: row.username,
                    fullName: row.full_name,
                    avatarUrl: row.avatar_url,
                    imagesCount: row.images_count,
                    followersCount: row.followers_count,
                    followingCount: row.following_count,
                    totalViews: row.total_views,
                    totalCopies: row.total_copies
                }));
            }

            // Fallback: Basic query
            const { data: users, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .limit(limit);

            if (error) throw error;

            // Get images count per user
            const results: ActiveUser[] = [];
            for (const user of users || []) {
                const [imagesResult, followersResult, followingResult] = await Promise.all([
                    supabase
                        .from('gallery_images')
                        .select('views, copies', { count: 'exact' })
                        .eq('author_id', user.id),
                    supabase
                        .from('follows')
                        .select('id', { count: 'exact', head: true })
                        .eq('following_id', user.id),
                    supabase
                        .from('follows')
                        .select('id', { count: 'exact', head: true })
                        .eq('follower_id', user.id)
                ]);

                const images = imagesResult.data || [];
                results.push({
                    userId: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    avatarUrl: user.avatar_url,
                    imagesCount: imagesResult.count || 0,
                    followersCount: followersResult.count || 0,
                    followingCount: followingResult.count || 0,
                    totalViews: images.reduce((acc, img) => acc + (img.views || 0), 0),
                    totalCopies: images.reduce((acc, img) => acc + (img.copies || 0), 0)
                });
            }

            return results.sort((a, b) => b.imagesCount - a.imagesCount);
        } catch (error) {
            console.error('Error fetching most active users:', error);
            return [];
        }
    },

    /**
     * Get category statistics
     */
    getCategoryStats: async (): Promise<CategoryStat[]> => {
        try {
            // Try RPC first
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_category_stats');

            if (!rpcError && rpcData && Array.isArray(rpcData)) {
                return rpcData.map((row: {
                    category: string;
                    images_count: number;
                    total_views: number;
                    total_copies: number;
                }) => ({
                    category: row.category,
                    imagesCount: row.images_count,
                    totalViews: row.total_views,
                    totalCopies: row.total_copies
                }));
            }

            // Fallback
            const { data, error } = await supabase
                .from('gallery_images')
                .select('category, views, copies');

            if (error) throw error;

            const stats: Record<string, CategoryStat> = {};
            (data || []).forEach(img => {
                if (!stats[img.category]) {
                    stats[img.category] = {
                        category: img.category,
                        imagesCount: 0,
                        totalViews: 0,
                        totalCopies: 0
                    };
                }
                stats[img.category].imagesCount++;
                stats[img.category].totalViews += img.views || 0;
                stats[img.category].totalCopies += img.copies || 0;
            });

            return Object.values(stats).sort((a, b) => b.imagesCount - a.imagesCount);
        } catch (error) {
            console.error('Error fetching category stats:', error);
            return [];
        }
    },

    /**
     * Get top images by views or copies
     */
    getTopImages: async (orderBy: 'views' | 'copies' = 'views', limit = 10): Promise<TopImage[]> => {
        try {
            // Try RPC first
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_top_images', {
                order_by_field: orderBy,
                limit_count: limit
            });

            if (!rpcError && rpcData && Array.isArray(rpcData)) {
                return rpcData.map((row: {
                    id: string;
                    url: string;
                    prompt: string;
                    category: string;
                    views: number;
                    copies: number;
                    created_at: string;
                    author_username: string | null;
                    author_avatar: string | null;
                }) => ({
                    id: row.id,
                    url: row.url,
                    prompt: row.prompt,
                    category: row.category,
                    views: row.views,
                    copies: row.copies,
                    createdAt: row.created_at,
                    authorUsername: row.author_username,
                    authorAvatar: row.author_avatar
                }));
            }

            // Fallback
            const { data, error } = await supabase
                .from('gallery_images')
                .select(`
                    id, url, prompt, category, views, copies, created_at,
                    author:profiles(username, avatar_url)
                `)
                .order(orderBy, { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(img => ({
                id: img.id,
                url: img.url,
                prompt: img.prompt,
                category: img.category,
                views: img.views || 0,
                copies: img.copies || 0,
                createdAt: img.created_at,
                authorUsername: (img.author as { username: string | null } | null)?.username || null,
                authorAvatar: (img.author as { avatar_url: string | null } | null)?.avatar_url || null
            }));
        } catch (error) {
            console.error('Error fetching top images:', error);
            return [];
        }
    },

    /**
     * Get total counts (all time)
     */
    getTotalCounts: async (): Promise<{ users: number; images: number; views: number; copies: number }> => {
        try {
            const [usersResult, imagesResult] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('gallery_images').select('views, copies')
            ]);

            const images = imagesResult.data || [];
            const totalViews = images.reduce((acc, img) => acc + (img.views || 0), 0);
            const totalCopies = images.reduce((acc, img) => acc + (img.copies || 0), 0);

            return {
                users: usersResult.count || 0,
                images: images.length,
                views: totalViews,
                copies: totalCopies
            };
        } catch (error) {
            console.error('Error fetching total counts:', error);
            return { users: 0, images: 0, views: 0, copies: 0 };
        }
    },

    /**
     * Compare two periods
     */
    comparePeriods: async (current: DateRange, previous: DateRange): Promise<{
        current: AnalyticsSummary;
        previous: AnalyticsSummary;
        changes: {
            users: number;
            images: number;
            views: number;
            copies: number;
            searches: number;
        };
    }> => {
        const [currentStats, previousStats] = await Promise.all([
            AnalyticsService.getAnalyticsSummary(current),
            AnalyticsService.getAnalyticsSummary(previous)
        ]);

        const calculateChange = (curr: number, prev: number): number => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        return {
            current: currentStats,
            previous: previousStats,
            changes: {
                users: calculateChange(currentStats.newUsers, previousStats.newUsers),
                images: calculateChange(currentStats.newImages, previousStats.newImages),
                views: calculateChange(currentStats.totalViews, previousStats.totalViews),
                copies: calculateChange(currentStats.totalCopies, previousStats.totalCopies),
                searches: calculateChange(currentStats.totalSearches, previousStats.totalSearches)
            }
        };
    }
};
