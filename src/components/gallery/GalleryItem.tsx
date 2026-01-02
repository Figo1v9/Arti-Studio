import { useState, useCallback, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, Heart, Copy, Check, Flag, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { GalleryImage } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { useFavorites, useIsFavorite } from '@/hooks/useFavorites';
import { useTrackCopy } from '@/hooks/useGallery';
import { trackInteraction } from '@/services/recommendations.service';
import { deleteImage } from '@/services/upload.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ReportModal } from '@/components/common/ReportModal';
import { UserUploadModal } from '@/components/profile/UserUploadModal';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { springSnappy } from '@/lib/animations';

interface GalleryItemProps {
  image: GalleryImage;
  onClick: (image: GalleryImage) => void;
}

/**
 * GalleryItem - Pinterest-style lazy loading
 * Uses react-intersection-observer for reliable viewport detection
 */

export const GalleryItem = memo(function GalleryItem({ image, onClick }: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // react-intersection-observer - triggers when element enters viewport
  const { ref, inView } = useInView({
    triggerOnce: true, // Only load once
    rootMargin: '100px 0px', // Start loading 100px before visible
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Use optimized hook that only causes re-render if THIS image's status changes
  const { isSaved, toggleFavorite } = useIsFavorite(image.id);
  const trackCopy = useTrackCopy();

  const handleProtectedAction = useCallback((action: () => void) => {
    if (!user) {
      toast.error('Sign in to interact');
      navigate('/login');
      return;
    }
    action();
  }, [user, navigate]);

  const handleClick = useCallback(() => {
    onClick(image);
  }, [onClick, image]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleProtectedAction(async () => {
      try {
        await navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        trackCopy.mutate(image.id);
        trackInteraction(image, 'copy');
        toast.success('Prompt copied');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy');
      }
    });
  }, [image, trackCopy, handleProtectedAction]);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleProtectedAction(() => {
      toggleFavorite();
      trackInteraction(image, 'like');
    });
  }, [image, toggleFavorite, handleProtectedAction]);

  const isOwner = user && (user.uid === image.authorId);

  /**
   * Handle successful edit - Use React Query invalidation instead of page reload
   * This is CRITICAL for scale: window.location.reload() would destroy all cached data
   */
  const handleEditSuccess = useCallback(() => {
    // Invalidate all gallery-related queries to refetch with updated data
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-infinite'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-image', image.id] });
    toast.success('Image updated successfully');
  }, [queryClient, image.id]);

  /**
   * Handle image deletion - delete from storage and database
   * Shows confirmation dialog before proceeding
   */
  const handleDelete = useCallback(async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      // Delete from R2 storage via Worker
      const deleted = await deleteImage(image.url);
      if (!deleted) {
        console.warn('Could not delete from storage, proceeding with DB deletion');
      }

      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      // Invalidate queries to refresh the gallery
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-infinite'] });

      toast.success('Image deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  }, [image.id, image.url, isDeleting, queryClient]);

  return (
    <motion.div
      ref={ref}
      className="relative gallery-image no-select group overflow-hidden rounded-xl cursor-pointer mb-4"
      style={{ aspectRatio: image.aspectRatio || 1 }}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      {/* Simple placeholder - fades out when loaded */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-slate-800/50 transition-opacity duration-300",
          isLoaded || hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {inView && (
        <img
          src={image.url} // Use raw URL first, allow service worker or simple string manip if valid
          srcSet={`${image.url}?width=400&format=webp 400w, ${image.url}?width=800&format=webp 800w`}
          alt={image.prompt || `AI generated art by ${image.author} in ${image.category}`}
          className={cn(
            'w-full h-full object-cover rounded-xl no-drag transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          draggable={false}
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-xl">
          <span className="text-muted-foreground text-xs">Failed to load</span>
        </div>
      )}

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-xl transition-opacity duration-150",
          "opacity-0 pointer-events-none group-hover:opacity-100"
        )}
      />

      {/* Category badge */}
      <div
        className={cn(
          'absolute top-3 left-3 z-10 transition-all duration-150',
          'opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm border border-white/10 capitalize">
          {image.category}
        </span>
      </div>

      {/* Bottom content */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3 z-10 transition-all duration-150',
          'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <p className="text-xs font-medium text-white mb-2 line-clamp-1 drop-shadow-md flex items-center">
          {image.author}
          <VerificationBadge tier={image.authorVerification || 'none'} className="w-3 h-3 ml-1" showTooltip={false} />
        </p>

        <div className="flex items-center gap-2">
          <button
            title="View"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); onClick(image); }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            title="Copy"
            className={cn(
              "p-2 rounded-full backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto",
              copied ? "bg-green-500/20 text-green-400" : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>


          <button
            title={isSaved ? "Remove" : "Save"}
            className={cn(
              "p-2 rounded-full backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto",
              isSaved ? "bg-rose-500/20 text-rose-400" : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={handleFavorite}
          >
            <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
          </button>

          <button
            title="Report"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto hover:text-amber-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowReportModal(true);
            }}
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {isOwner && (
            <>
              <button
                title="Edit"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto hover:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* Delete button with inline confirmation */}
              {!showDeleteConfirm ? (
                <button
                  title="Delete"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors pointer-events-auto hover:text-rose-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Confirm Delete"
                    className="p-2 rounded-full bg-rose-500/30 hover:bg-rose-500/50 text-rose-400 backdrop-blur-sm border border-rose-500/30 transition-colors"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    title="Cancel"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <span className="text-xs font-medium">✕</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={image.id}
        targetType="image"
      />

      <UserUploadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        initialData={image}
      />
    </motion.div>
  );
});
