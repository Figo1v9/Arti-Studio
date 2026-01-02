import React from 'react';

export const ProfileLoading: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Skeleton */}
            <div className="relative h-52 sm:h-56 md:h-72 w-full bg-gradient-to-br from-violet-950/50 via-background to-background">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-16 sm:-mt-20 relative z-10">
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 md:items-end mb-8">
                    {/* Avatar Skeleton */}
                    <div className="shrink-0 mx-auto md:mx-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-3xl bg-card/50 animate-pulse" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        {/* Name */}
                        <div className="h-8 w-48 bg-card/50 rounded-lg animate-pulse mx-auto md:mx-0" />
                        {/* Username */}
                        <div className="h-5 w-32 bg-card/30 rounded-lg animate-pulse mx-auto md:mx-0" />
                        {/* Bio */}
                        <div className="h-4 w-64 bg-card/30 rounded-lg animate-pulse mx-auto md:mx-0" />

                        {/* Stats */}
                        <div className="flex gap-2 justify-center md:justify-start pt-2">
                            <div className="h-10 w-24 bg-card/30 rounded-xl animate-pulse" />
                            <div className="h-10 w-24 bg-card/30 rounded-xl animate-pulse" />
                            <div className="h-10 w-24 bg-card/30 rounded-xl animate-pulse" />
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="hidden md:flex gap-2">
                        <div className="h-10 w-32 bg-card/30 rounded-lg animate-pulse" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2 mb-8">
                    <div className="h-10 w-28 bg-card/30 rounded-xl animate-pulse" />
                    <div className="h-10 w-28 bg-card/30 rounded-xl animate-pulse" />
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-card/30 rounded-xl animate-pulse"
                            style={{ animationDelay: `${i * 50}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
