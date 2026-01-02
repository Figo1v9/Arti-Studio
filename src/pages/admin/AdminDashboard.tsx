import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Images,
    Eye,
    Copy,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Activity,
    Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
    totalUsers: number;
    totalImages: number;
    totalViews: number;
    totalCopies: number;
}

interface PeriodStats {
    current: Stats;
    previous: Stats;
}

interface RecentImage {
    id: string;
    url: string;
    prompt: string;
    category: string;
    views: number;
    created_at: string;
}

/**
 * Calculate percentage change between two values
 * Returns the percentage change or null if previous is 0
 */
function calculateTrend(current: number, previous: number): { value: string; isUp: boolean | null } {
    if (previous === 0) {
        if (current > 0) {
            return { value: '+100%', isUp: true };
        }
        return { value: '0%', isUp: null }; // No change possible
    }

    const change = ((current - previous) / previous) * 100;
    const rounded = Math.round(change);

    if (rounded === 0) {
        return { value: '0%', isUp: null };
    }

    return {
        value: `${rounded > 0 ? '+' : ''}${rounded}%`,
        isUp: rounded > 0
    };
}

export default function AdminDashboard() {
    const [periodStats, setPeriodStats] = useState<PeriodStats>({
        current: { totalUsers: 0, totalImages: 0, totalViews: 0, totalCopies: 0 },
        previous: { totalUsers: 0, totalImages: 0, totalViews: 0, totalCopies: 0 }
    });
    const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentImages();

        // Optimized: Single channel for both tables instead of 2 separate channels
        // Listen only to INSERT/DELETE events (not UPDATE which includes view count changes)
        const dashboardChannel = supabase
            .channel('admin-dashboard')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'profiles' },
                () => fetchStats()
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'profiles' },
                () => fetchStats()
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'gallery_images' },
                () => {
                    fetchStats();
                    fetchRecentImages();
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'gallery_images' },
                () => {
                    fetchStats();
                    fetchRecentImages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(dashboardChannel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            // Define time periods
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            // Fetch all data in parallel
            const [usersResult, imagesResult, allImagesResult] = await Promise.all([
                supabase.from('profiles').select('created_at'),
                supabase.from('gallery_images').select('created_at, views, copies'),
                supabase.from('gallery_images').select('views, copies').returns<{ views: number; copies: number }[]>()
            ]);

            const users = usersResult.data || [];
            const images = imagesResult.data || [];
            const allImages = allImagesResult.data || [];

            // Calculate current period stats (last 30 days)
            const currentPeriodUsers = users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length;
            const currentPeriodImages = images.filter(i => new Date(i.created_at) >= thirtyDaysAgo).length;

            // Calculate previous period stats (30-60 days ago)
            const previousPeriodUsers = users.filter(u => {
                const date = new Date(u.created_at);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            }).length;
            const previousPeriodImages = images.filter(i => {
                const date = new Date(i.created_at);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            }).length;

            // Total views and copies (these are cumulative, so we show totals)
            const totalViews = allImages.reduce((acc, img) => acc + (img.views || 0), 0);
            const totalCopies = allImages.reduce((acc, img) => acc + (img.copies || 0), 0);

            // For views/copies trends, we'd need historical data
            // Since we don't have that, we'll show the totals with neutral trend
            setPeriodStats({
                current: {
                    totalUsers: users.length,
                    totalImages: allImages.length,
                    totalViews,
                    totalCopies
                },
                previous: {
                    totalUsers: users.length - currentPeriodUsers,
                    totalImages: allImages.length - currentPeriodImages,
                    totalViews: 0, // No historical data available
                    totalCopies: 0
                }
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentImages = async () => {
        try {
            const { data } = await supabase
                .from('gallery_images')
                .select('id, url, prompt, category, views, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentImages(data || []);
        } catch (error) {
            console.error('Error fetching recent images:', error);
        }
    };

    // Calculate trends - memoized for performance
    const trends = useMemo(() => {
        return {
            users: calculateTrend(periodStats.current.totalUsers, periodStats.previous.totalUsers),
            images: calculateTrend(periodStats.current.totalImages, periodStats.previous.totalImages),
            // Views and copies don't have period comparison available
            views: { value: '-', isUp: null as boolean | null },
            copies: { value: '-', isUp: null as boolean | null }
        };
    }, [periodStats]);

    const statCards = [
        {
            title: 'Total Users',
            value: periodStats.current.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            iconColor: '#3b82f6',
            trend: trends.users.value,
            trendUp: trends.users.isUp,
        },
        {
            title: 'Total Images',
            value: periodStats.current.totalImages,
            icon: Images,
            color: 'from-violet-500 to-purple-500',
            bgColor: 'bg-violet-500/10',
            iconColor: '#8b5cf6',
            trend: trends.images.value,
            trendUp: trends.images.isUp,
        },
        {
            title: 'Total Views',
            value: periodStats.current.totalViews,
            icon: Eye,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-500/10',
            iconColor: '#10b981',
            trend: trends.views.value,
            trendUp: trends.views.isUp,
        },
        {
            title: 'Total Copies',
            value: periodStats.current.totalCopies,
            icon: Copy,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            iconColor: '#f59e0b',
            trend: trends.copies.value,
            trendUp: trends.copies.isUp,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-400" />
                        Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">Welcome to Prompt Gallery dashboard</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">System Online</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-colors"
                    >
                        {/* Background Gradient */}
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20",
                            `bg-gradient-to-br ${card.color}`
                        )} />

                        {/* Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                            card.bgColor
                        )}>
                            <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
                        </div>

                        {/* Content */}
                        <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? '...' : card.value.toLocaleString()}
                            </h3>
                            {card.trend !== '-' ? (
                                <div className={cn(
                                    "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                                    card.trendUp === true
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : card.trendUp === false
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-gray-500/10 text-gray-400"
                                )}>
                                    {card.trendUp === true ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : card.trendUp === false ? (
                                        <ArrowDownRight className="w-3 h-3" />
                                    ) : (
                                        <Minus className="w-3 h-3" />
                                    )}
                                    {card.trend}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-500">
                                    <Minus className="w-3 h-3" />
                                    Total
                                </div>
                            )}
                        </div>
                        {card.trend !== '-' && (
                            <p className="text-xs text-gray-500 mt-2">Compared to last 30 days</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Images */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Images className="w-5 h-5 text-violet-400" />
                        Recent Images
                    </h2>
                    <div className="space-y-3">
                        {loading ? (
                            // Skeleton loader
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 animate-pulse">
                                    <div className="w-12 h-12 rounded-lg bg-white/10" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-20 bg-white/5 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : recentImages.length > 0 ? (
                            recentImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <img
                                        src={image.url}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover"
                                        loading="lazy"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {image.prompt.slice(0, 50)}...
                                        </p>
                                        <p className="text-xs text-gray-400">{image.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm">{image.views}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">
                                No images yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="/admin-mk-dashboard/gallery"
                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:from-violet-500/20 hover:to-purple-500/20 transition-colors"
                        >
                            <Images className="w-8 h-8 text-violet-400" />
                            <span className="text-sm text-white">Add Image</span>
                        </a>
                        <a
                            href="/admin-mk-dashboard/users"
                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-cyan-500/20 transition-colors"
                        >
                            <Users className="w-8 h-8 text-blue-400" />
                            <span className="text-sm text-white">Manage Users</span>
                        </a>
                        <a
                            href="/admin-mk-dashboard/categories"
                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-green-500/20 transition-colors"
                        >
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                            <span className="text-sm text-white">Categories</span>
                        </a>
                        <a
                            href="/admin-mk-dashboard/settings"
                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-500/20 transition-colors"
                        >
                            <Sparkles className="w-8 h-8 text-amber-400" />
                            <span className="text-sm text-white">Settings</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
