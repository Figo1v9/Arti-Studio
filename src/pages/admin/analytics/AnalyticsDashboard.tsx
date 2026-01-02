import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    Search,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    BarChart2,
    Users,
    Images,
    Calendar,
    Eye,
    Copy,
    RefreshCw,
    ChevronDown,
    Crown,
    Sparkles,
    Activity,
    Loader2,
    UserCheck,
    Heart
} from 'lucide-react';
import {
    AnalyticsService,
    DateRanges,
    DateRange,
    AnalyticsSummary,
    GrowthDataPoint,
    TopSearch,
    ActiveUser,
    CategoryStat,
    TopImage,
    ZeroResultSearch
} from '@/services/analytics.service';
import { cn, formatDate } from '@/lib/utils';

// ===========================================
// TYPES
// ===========================================

type DateRangePreset = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'last90Days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'allTime' | 'custom';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    iconColor: string;
    trend?: number | null;
    loading?: boolean;
    subtitle?: string;
}

// ===========================================
// CONSTANTS
// ===========================================

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last90Days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'allTime', label: 'All Time' },
];

const CHART_COLORS = [
    '#8b5cf6', // violet
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
];

// ===========================================
// STAT CARD COMPONENT
// ===========================================

const StatCard = React.memo(({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    iconColor,
    trend,
    loading,
    subtitle
}: StatCardProps) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/[0.07] transition-all duration-300 group">
        {/* Background Gradient */}
        <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity",
            `bg-gradient-to-br ${color}`
        )} />

        <div className="relative">
            {/* Icon */}
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                bgColor
            )}>
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
            </div>

            {/* Content */}
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-white">
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </span>
                        ) : (
                            value.toLocaleString()
                        )}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {trend !== undefined && trend !== null && !loading && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                        trend > 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : trend < 0
                                ? "bg-red-500/10 text-red-400"
                                : "bg-gray-500/10 text-gray-400"
                    )}>
                        {trend > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : trend < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {trend > 0 ? '+' : ''}{trend}%
                    </div>
                )}
            </div>
        </div>
    </div>
));
StatCard.displayName = 'StatCard';

// ===========================================
// LOADING SKELETON
// ===========================================

const ChartSkeleton = () => (
    <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            <span className="text-gray-500 text-sm">Loading data...</span>
        </div>
    </div>
);

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function AnalyticsDashboard() {
    // State
    const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last30Days');
    const [dateRange, setDateRange] = useState<DateRange>(DateRanges.last30Days());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data State
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [previousSummary, setPreviousSummary] = useState<AnalyticsSummary | null>(null);
    const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
    const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
    const [zeroResultSearches, setZeroResultSearches] = useState<ZeroResultSearch[]>([]);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
    const [topImages, setTopImages] = useState<TopImage[]>([]);
    const [totalCounts, setTotalCounts] = useState<{ users: number; images: number; views: number; copies: number } | null>(null);

    // Calculate previous period for comparison
    const getPreviousPeriod = useCallback((current: DateRange): DateRange => {
        const duration = current.end.getTime() - current.start.getTime();
        const prevEnd = new Date(current.start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);
        return { start: prevStart, end: prevEnd };
    }, []);

    // Fetch all data
    const fetchData = useCallback(async (range: DateRange, isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const previousRange = getPreviousPeriod(range);

            const [
                summaryData,
                prevSummaryData,
                growth,
                searches,
                zeroSearches,
                users,
                categories,
                images,
                totals
            ] = await Promise.all([
                AnalyticsService.getAnalyticsSummary(range),
                AnalyticsService.getAnalyticsSummary(previousRange),
                AnalyticsService.getGrowthData(range),
                AnalyticsService.getTopSearches(range, 10),
                AnalyticsService.getZeroResultSearches(range, 10),
                AnalyticsService.getMostActiveUsers(10),
                AnalyticsService.getCategoryStats(),
                AnalyticsService.getTopImages('views', 10),
                AnalyticsService.getTotalCounts()
            ]);

            setSummary(summaryData);
            setPreviousSummary(prevSummaryData);
            setGrowthData(growth);
            setTopSearches(searches);
            setZeroResultSearches(zeroSearches);
            setActiveUsers(users);
            setCategoryStats(categories);
            setTopImages(images);
            setTotalCounts(totals);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getPreviousPeriod]);

    // Handle date range change
    const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
        setSelectedPreset(preset);
        const newRange = DateRanges[preset]();
        setDateRange(newRange);
        fetchData(newRange);
    }, [fetchData]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchData(dateRange, true);
    }, [fetchData, dateRange]);

    // Initial fetch
    useEffect(() => {
        fetchData(dateRange);
    }, []);

    // Calculate trends
    const trends = useMemo(() => {
        if (!summary || !previousSummary) return null;

        const calc = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        return {
            users: calc(summary.newUsers, previousSummary.newUsers),
            images: calc(summary.newImages, previousSummary.newImages),
            searches: calc(summary.totalSearches, previousSummary.totalSearches),
        };
    }, [summary, previousSummary]);

    // Stat cards configuration
    const statCards = useMemo(() => {
        if (!summary || !totalCounts) return [];

        return [
            {
                title: 'Total Users',
                value: totalCounts.users,
                icon: Users,
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-500/10',
                iconColor: '#3b82f6',
                trend: trends?.users,
                subtitle: `+${summary.newUsers} in period`
            },
            {
                title: 'Total Images',
                value: totalCounts.images,
                icon: Images,
                color: 'from-violet-500 to-purple-500',
                bgColor: 'bg-violet-500/10',
                iconColor: '#8b5cf6',
                trend: trends?.images,
                subtitle: `+${summary.newImages} in period`
            },
            {
                title: 'Total Views',
                value: totalCounts.views,
                icon: Eye,
                color: 'from-emerald-500 to-green-500',
                bgColor: 'bg-emerald-500/10',
                iconColor: '#10b981',
                trend: null,
                subtitle: 'All time views'
            },
            {
                title: 'Total Copies',
                value: totalCounts.copies,
                icon: Copy,
                color: 'from-amber-500 to-orange-500',
                bgColor: 'bg-amber-500/10',
                iconColor: '#f59e0b',
                trend: null,
                subtitle: 'All time copies'
            },
            {
                title: 'Search Queries',
                value: summary.totalSearches,
                icon: Search,
                color: 'from-pink-500 to-rose-500',
                bgColor: 'bg-pink-500/10',
                iconColor: '#ec4899',
                trend: trends?.searches,
                subtitle: 'In selected period'
            },
        ];
    }, [summary, totalCounts, trends]);

    // Pie chart data for categories
    const pieChartData = useMemo(() => {
        return categoryStats.slice(0, 8).map((cat, index) => ({
            name: cat.category,
            value: cat.imagesCount,
            color: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [categoryStats]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-violet-400" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Comprehensive insights into platform performance
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <select
                            value={selectedPreset}
                            onChange={(e) => handleDateRangeChange(e.target.value as DateRangePreset)}
                            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            {DATE_RANGE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="bg-slate-900">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                            "bg-violet-500/10 border border-violet-500/20 text-violet-400",
                            "hover:bg-violet-500/20 disabled:opacity-50"
                        )}
                    >
                        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        Refresh
                    </button>

                    {/* Period Info */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-gray-400">
                            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="rounded-2xl bg-white/5 border border-white/10 p-5 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
                            <div className="h-4 w-20 bg-white/10 rounded mb-2" />
                            <div className="h-8 w-24 bg-white/10 rounded" />
                        </div>
                    ))
                ) : (
                    statCards.map((card) => (
                        <StatCard
                            key={card.title}
                            {...card}
                            loading={loading}
                        />
                    ))
                )}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Platform Growth
                        <span className="ml-auto text-xs font-normal text-gray-500">
                            Users & Images over time
                        </span>
                    </h3>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <ChartSkeleton />
                        ) : growthData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data available for this period
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#ffffff50"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff50"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '8px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#colorUsers)"
                                        name="New Users"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="images"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#colorImages)"
                                        name="New Images"
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Category Distribution
                        <span className="ml-auto text-xs font-normal text-gray-500">
                            Images per category
                        </span>
                    </h3>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <ChartSkeleton />
                        ) : pieChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No categories found
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                        }}
                                        formatter={(value: number, name: string) => [
                                            `${value} images`,
                                            name
                                        ]}
                                    />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        formatter={(value) => (
                                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 - Search Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Searches Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        Top Search Terms
                    </h3>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <ChartSkeleton />
                        ) : topSearches.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No search data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topSearches.slice(0, 7)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                                    <YAxis
                                        dataKey="term"
                                        type="category"
                                        stroke="#ffffff50"
                                        fontSize={11}
                                        width={100}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{
                                            backgroundColor: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                        }}
                                        formatter={(value: number) => [`${value} searches`, 'Count']}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                        {topSearches.slice(0, 7).map((entry, index) => (
                                            <Cell
                                                key={`cell-${entry.term}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Zero Results / Content Gaps */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Content Gaps (Zero Results)
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                What users couldn't find
                            </span>
                        </h3>
                    </div>
                    <div className="divide-y divide-white/10 max-h-[340px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
                            </div>
                        ) : zeroResultSearches.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="text-2xl mb-2 block">🎉</span>
                                No content gaps found!
                            </div>
                        ) : (
                            zeroResultSearches.map((item, i) => (
                                <div
                                    key={`zero-${item.query}-${i}`}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="text-gray-300 font-medium">"{item.query}"</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                    <span className="text-xs text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                        Missing
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Active Users */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            Most Active Users
                        </h3>
                    </div>
                    <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={`user-skeleton-${i}`} className="flex items-center gap-4 p-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-white/10" />
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-16 bg-white/5 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : activeUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No users found
                            </div>
                        ) : (
                            activeUsers.map((user, index) => (
                                <div
                                    key={user.userId}
                                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                        index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                            index === 1 ? "bg-gray-400/20 text-gray-300" :
                                                index === 2 ? "bg-amber-600/20 text-amber-500" :
                                                    "bg-white/5 text-gray-500"
                                    )}>
                                        {index + 1}
                                    </div>

                                    {/* Avatar */}
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.username || 'User'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {user.fullName || user.username || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            @{user.username || 'no-username'}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1" title="Images">
                                            <Images className="w-3.5 h-3.5" />
                                            <span>{user.imagesCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Followers">
                                            <UserCheck className="w-3.5 h-3.5" />
                                            <span>{user.followersCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Views">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{user.totalViews}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Images */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-emerald-400" />
                            Most Viewed Images
                        </h3>
                    </div>
                    <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={`image-skeleton-${i}`} className="flex items-center gap-4 p-4 animate-pulse">
                                    <div className="w-14 h-14 rounded-lg bg-white/10" />
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-20 bg-white/5 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : topImages.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No images found
                            </div>
                        ) : (
                            topImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                        index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                            index === 1 ? "bg-gray-400/20 text-gray-300" :
                                                index === 2 ? "bg-amber-600/20 text-amber-500" :
                                                    "bg-white/5 text-gray-500"
                                    )}>
                                        {index + 1}
                                    </div>

                                    {/* Thumbnail */}
                                    <img
                                        src={image.url}
                                        alt=""
                                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                        loading="lazy"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {image.prompt.slice(0, 50)}...
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{image.category}</span>
                                            {image.authorUsername && (
                                                <>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500">@{image.authorUsername}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                                        <div className="flex items-center gap-1" title="Views">
                                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{image.views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Copies">
                                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{image.copies.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Category Stats Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-violet-400" />
                        Category Performance
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Category</th>
                                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Images</th>
                                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Total Views</th>
                                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Total Copies</th>
                                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Avg Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`cat-skeleton-${i}`} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                                        <td className="p-4 text-right"><div className="h-4 w-12 bg-white/10 rounded ml-auto" /></td>
                                        <td className="p-4 text-right"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                                        <td className="p-4 text-right"><div className="h-4 w-12 bg-white/10 rounded ml-auto" /></td>
                                        <td className="p-4 text-right"><div className="h-4 w-12 bg-white/10 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : categoryStats.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No category data found
                                    </td>
                                </tr>
                            ) : (
                                categoryStats.map((cat, index) => (
                                    <tr key={cat.category} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                />
                                                <span className="text-white font-medium capitalize">{cat.category}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{cat.imagesCount.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-300">{cat.totalViews.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-300">{cat.totalCopies.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-300">
                                            {cat.imagesCount > 0
                                                ? Math.round(cat.totalViews / cat.imagesCount).toLocaleString()
                                                : 0
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
