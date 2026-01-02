import React from 'react';
import { Image, Users, UserPlus, Heart, Copy } from 'lucide-react';
import { GalleryImage } from '@/types/gallery';
import { cn } from '@/lib/utils';

interface ProfileStatsProps {
    userCreations: GalleryImage[];
    followersCount: number;
    followingCount: number;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
}

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    label: string;
    color: string;
    bgColor: string;
    onClick?: () => void;
    clickable?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
    icon: Icon,
    value,
    label,
    color,
    bgColor,
    onClick,
    clickable = false
}) => {
    const Component = clickable ? 'button' : 'div';

    return (
        <Component
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 min-w-fit",
                bgColor,
                clickable && "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            )}
        >
            <Icon className={cn("w-4 h-4 shrink-0", color)} />
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white">{value.toLocaleString()}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide hidden xs:inline">
                    {label}
                </span>
            </div>
        </Component>
    );
};

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    userCreations,
    followersCount,
    followingCount,
    onFollowersClick,
    onFollowingClick
}) => {
    const totalLikes = userCreations.reduce((acc, img) => acc + (img.likes || 0), 0);

    return (
        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mt-4">
            {/* Creations */}
            <StatItem
                icon={Image}
                value={userCreations.length}
                label="Creations"
                color="text-blue-400"
                bgColor="bg-blue-500/10 border-blue-500/20"
            />

            {/* Followers */}
            <StatItem
                icon={Users}
                value={followersCount}
                label="Followers"
                color="text-violet-400"
                bgColor="bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-500/30"
                onClick={onFollowersClick}
                clickable
            />

            {/* Following */}
            <StatItem
                icon={UserPlus}
                value={followingCount}
                label="Following"
                color="text-emerald-400"
                bgColor="bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30"
                onClick={onFollowingClick}
                clickable
            />

            {/* Likes */}
            <StatItem
                icon={Heart}
                value={totalLikes}
                label="Likes"
                color="text-rose-400"
                bgColor="bg-rose-500/10 border-rose-500/20"
            />

            {/* Copies */}
            <StatItem
                icon={Copy}
                value={userCreations.reduce((acc, img) => acc + (img.copies || 0), 0)}
                label="Copies"
                color="text-green-400"
                bgColor="bg-green-500/10 border-green-500/20"
            />
        </div>
    );
};
