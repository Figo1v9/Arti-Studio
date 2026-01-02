import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GallerySkeletonProps {
  count?: number;
  className?: string;
}

export function GallerySkeleton({ count = 12, className }: GallerySkeletonProps) {
  // Generate varied aspect ratios for visual interest
  const aspectRatios = [
    'aspect-[3/4]',
    'aspect-[4/5]',
    'aspect-square',
    'aspect-[4/3]',
    'aspect-[3/4]',
    'aspect-[5/6]',
  ];

  return (
    <div className={cn(
      "p-2 md:p-4 columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="break-inside-avoid"
        >
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden",
              aspectRatios[i % aspectRatios.length]
            )}
          >
            {/* Shimmer Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50" />

            {/* Animated Shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Content Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
              {/* Title skeleton */}
              <div className="h-4 bg-white/10 rounded-lg w-3/4" />
              {/* Author skeleton */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <div className="h-3 bg-white/10 rounded w-20" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Compact version for smaller lists
export function GallerySkeletonCompact({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="aspect-square rounded-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-700/30" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}

// Single card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden relative",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
