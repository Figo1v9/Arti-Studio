import React from 'react';
import { motion } from 'framer-motion';
import { Images, Plus, Search, Heart, Users, ImageOff, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'search' | 'favorites' | 'following' | 'gallery' | 'error';
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    compact?: boolean;
}

// Preset configurations for common use cases
const PRESETS = {
    default: {
        icon: FolderOpen,
        iconGradient: 'from-violet-500/20 to-purple-500/20',
        iconColor: 'text-violet-400',
    },
    search: {
        icon: Search,
        iconGradient: 'from-blue-500/20 to-cyan-500/20',
        iconColor: 'text-blue-400',
    },
    favorites: {
        icon: Heart,
        iconGradient: 'from-rose-500/20 to-pink-500/20',
        iconColor: 'text-rose-400',
    },
    following: {
        icon: Users,
        iconGradient: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400',
    },
    gallery: {
        icon: Images,
        iconGradient: 'from-violet-500/20 to-purple-500/20',
        iconColor: 'text-violet-400',
    },
    error: {
        icon: ImageOff,
        iconGradient: 'from-red-500/20 to-orange-500/20',
        iconColor: 'text-red-400',
    },
};

export function EmptyState({
    title = 'No content',
    description = 'No items found',
    icon,
    variant = 'default',
    action,
    secondaryAction,
    className,
    compact = false,
}: EmptyStateProps) {
    const preset = PRESETS[variant];
    const PresetIcon = preset.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
                'flex flex-col items-center justify-center text-center',
                compact ? 'py-8 px-4' : 'py-16 px-4',
                className
            )}
        >
            {/* Animated Icon Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="relative mb-6"
            >
                {/* Glow Effect */}
                <div className={cn(
                    "absolute inset-0 rounded-3xl blur-2xl opacity-30",
                    `bg-gradient-to-br ${preset.iconGradient}`
                )} />

                {/* Icon Box */}
                <div className={cn(
                    "relative w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center",
                    `bg-gradient-to-br ${preset.iconGradient}`,
                    "border border-white/10"
                )}>
                    {/* Decorative sparkles */}
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-violet-400/50" />

                    {icon || <PresetIcon className={cn(
                        compact ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12",
                        preset.iconColor
                    )} />}
                </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 mb-6"
            >
                <h3 className={cn(
                    "font-bold text-white",
                    compact ? "text-lg" : "text-xl md:text-2xl"
                )}>
                    {title}
                </h3>
                <p className={cn(
                    "text-muted-foreground max-w-sm mx-auto",
                    compact ? "text-sm" : "text-base"
                )}>
                    {description}
                </p>
            </motion.div>

            {/* Actions */}
            {(action || secondaryAction) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-3"
                >
                    {action && (
                        <Button
                            onClick={action.onClick}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 h-11 px-6"
                        >
                            {action.icon || <Plus className="w-4 h-4 mr-2" />}
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="ghost"
                            onClick={secondaryAction.onClick}
                            className="text-muted-foreground hover:text-white"
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}

// Specialized Empty States for common scenarios
export function NoSearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
    return (
        <EmptyState
            variant="search"
            title="No results found"
            description={`We couldn't find anything for "${query}". Try different keywords or browse categories.`}
            secondaryAction={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
        />
    );
}

export function NoFavorites({ onExplore }: { onExplore?: () => void }) {
    return (
        <EmptyState
            variant="favorites"
            title="No favorites yet"
            description="Start saving images you love by tapping the heart icon. They'll appear here for easy access."
            action={onExplore ? {
                label: 'Explore Gallery',
                onClick: onExplore,
                icon: <Search className="w-4 h-4 mr-2" />
            } : undefined}
        />
    );
}

export function NoCreations({ onUpload }: { onUpload?: () => void }) {
    return (
        <EmptyState
            variant="gallery"
            title="No creations yet"
            description="Share your AI-generated artwork with the community. Your creations will appear here."
            action={onUpload ? {
                label: 'Upload Creation',
                onClick: onUpload,
                icon: <Plus className="w-4 h-4 mr-2" />
            } : undefined}
        />
    );
}

export function NoFollowing({ onExplore }: { onExplore?: () => void }) {
    return (
        <EmptyState
            variant="following"
            title="Not following anyone"
            description="Follow artists to see their latest creations in your feed."
            action={onExplore ? {
                label: 'Discover Artists',
                onClick: onExplore,
                icon: <Users className="w-4 h-4 mr-2" />
            } : undefined}
        />
    );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
        <EmptyState
            variant="error"
            title="Something went wrong"
            description="We encountered an error loading this content. Please try again."
            action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
        />
    );
}
