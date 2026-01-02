import React from 'react';
import { Eye, Heart, Sparkles, TrendingUp, Calendar, Award, Zap, Copy } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { GalleryImage } from '@/types/gallery';
import { UserProfile } from '../types';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
    userCreations: GalleryImage[];
    viewedProfile: UserProfile;
    isOwner: boolean;
    handleImageSelect: (image: GalleryImage) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
    userCreations,
    viewedProfile,
    isOwner,
    handleImageSelect
}) => {
    // Calculate stats
    const totalViews = userCreations.reduce((acc, img) => acc + (img.views || 0), 0);
    const totalLikes = userCreations.reduce((acc, img) => acc + (img.likes || 0), 0);
    const totalCopies = userCreations.reduce((acc, img) => acc + (img.copies || 0), 0);
    const avgEngagement = userCreations.length > 0
        ? Math.round((totalLikes / userCreations.length) * 10) / 10
        : 0;

    // Get top performing
    const topCreations = [...userCreations]
        .sort((a, b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0)))
        .slice(0, 4);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Stats Cards */}
            <div className="lg:col-span-1 space-y-4">
                {/* Quick Stats */}
                <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Quick Stats
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02]">
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Total Views
                            </span>
                            <span className="text-white font-semibold">{totalViews.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02]">
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                                <Copy className="w-4 h-4" />
                                Total Copies
                            </span>
                            <span className="text-white font-semibold">{totalCopies.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02]">
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Total Likes
                            </span>
                            <span className="text-white font-semibold">{totalLikes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02]">
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Avg. Engagement
                            </span>
                            <span className="text-white font-semibold">{avgEngagement}</span>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Account Info
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-muted-foreground text-sm">Joined</span>
                            <span className="text-white text-sm">{formatDate(viewedProfile.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground text-sm">Plan</span>
                            <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-md border",
                                viewedProfile.is_premium
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}>
                                {viewedProfile.is_premium ? 'Premium' : 'Free Tier'}
                            </span>
                        </div>
                        {isOwner && viewedProfile.email && (
                            <div className="flex justify-between items-center py-2 border-t border-white/5">
                                <span className="text-muted-foreground text-sm">Email</span>
                                <span className="text-white text-sm truncate max-w-[180px]">{viewedProfile.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Top Performing */}
            <div className="lg:col-span-2">
                <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-2xl p-5 h-full">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-violet-400" />
                        Top Performing
                    </h4>

                    {topCreations.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {topCreations.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => handleImageSelect(img)}
                                    className="group relative overflow-hidden rounded-xl bg-card aspect-[4/3] text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.prompt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                                    {/* Rank Badge */}
                                    <div className={cn(
                                        "absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                                        idx === 0 && "bg-amber-500 text-black",
                                        idx === 1 && "bg-gray-300 text-black",
                                        idx === 2 && "bg-amber-700 text-white",
                                        idx >= 3 && "bg-white/10 text-white"
                                    )}>
                                        {idx + 1}
                                    </div>

                                    {/* Stats on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <p className="text-white text-xs font-medium truncate mb-1.5">{img.prompt}</p>
                                        <div className="flex items-center gap-3 text-xs text-white/70">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {img.views || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-3 h-3" /> {img.likes || 0}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center">
                            <Sparkles className="w-10 h-10 text-white/10 mb-3" />
                            <p className="text-muted-foreground text-sm">
                                {isOwner ? "Upload creations to see performance stats" : "No creations yet"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
