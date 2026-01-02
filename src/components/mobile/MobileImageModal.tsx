import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Eye,
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Calendar,
  Tag,
  Flag,
  UserPlus,
  UserMinus,
  Loader2,
  Sparkles,
  Lock,
  Edit2,
  FolderPlus
} from 'lucide-react';
import { EditImageModal } from '@/components/profile/modals/EditImageModal';
import { GalleryImage, CATEGORIES } from '@/types/gallery';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useTrackCopy } from '@/hooks/useGallery';
import { incrementViews } from '@/services/gallery.service';
import { FollowService } from '@/services/follow.service';
import { useFavorites } from '@/hooks/useFavorites';
import { trackInteraction } from '@/services/recommendations.service';
import { useAuth } from '@/components/auth';
import { ReportModal } from '@/components/common/ReportModal';
import { getAvatarUrl } from '@/lib/avatar';
import { MobileAddToCollectionSheet } from '@/components/mobile/collections/MobileAddToCollectionSheet';

interface MobileImageModalProps {
  image: GalleryImage | null;
  onClose: () => void;
  similarImages: GalleryImage[];
  onSimilarClick: (image: GalleryImage) => void;
}

export function MobileImageModal({ image, onClose, similarImages, onSimilarClick }: MobileImageModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // UI States
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Hooks
  const trackCopy = useTrackCopy();
  const { isFavorited, toggleFavorite } = useFavorites();
  const isSaved = image ? isFavorited(image.id) : false;

  // Check if current user is the author
  const isOwnImage = user && image?.authorId === user.uid;

  // Combine current image with similar images for navigation
  const allImages = useMemo(() => {
    if (!image) return [];
    const combined = [image, ...similarImages.filter(img => img.id !== image.id)];
    return combined;
  }, [image, similarImages]);

  const category = useMemo(() => {
    return image ? CATEGORIES.find((c) => c.id === image.category) : null;
  }, [image]);

  // Haptic feedback helper
  const haptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 30, heavy: 50 };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  // Protected action wrapper - redirects to login if not authenticated
  const handleProtectedAction = useCallback((action: () => void, message?: string) => {
    if (!user) {
      haptic('medium');
      toast.error(message || 'Sign in to continue');
      navigate('/login');
      return;
    }
    action();
  }, [user, navigate, haptic]);

  // Initialize modal state and check follow status
  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
      setIsExpanded(false);
      setIsPromptExpanded(false);
      incrementViews(image.id).catch(console.error);

      // Check follow status if user is logged in and not viewing own image
      if (user && image.authorId && image.authorId !== user.uid) {
        FollowService.isFollowing(user.uid, image.authorId)
          .then(setIsFollowing)
          .catch(() => setIsFollowing(false));
      } else {
        setIsFollowing(false);
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [image, user]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = useCallback(async () => {
    if (!user) {
      haptic('medium');
      toast.error('Sign in to follow creators');
      navigate('/login');
      return;
    }

    if (!image?.authorId) return;

    setFollowLoading(true);
    haptic('light');

    try {
      if (isFollowing) {
        await FollowService.unfollow(user.uid, image.authorId);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await FollowService.follow(user.uid, image.authorId);
        setIsFollowing(true);
        haptic('medium');
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  }, [user, image, isFollowing, navigate, haptic]);

  // Handle copy prompt
  const handleCopyPrompt = useCallback(async () => {
    if (!image) return;

    handleProtectedAction(async () => {
      try {
        await navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        trackCopy.mutate(image.id);
        trackInteraction(image, 'copy');
        haptic('medium');
        toast.success('Prompt copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Copy failed');
      }
    }, 'Sign in to copy prompts');
  }, [image, handleProtectedAction, trackCopy, haptic]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!image) return;

    handleProtectedAction(async () => {
      try {
        await navigator.share({
          title: image.title || 'Arti Studio',
          text: `Check out this AI image: "${image.prompt.slice(0, 100)}${image.prompt.length > 100 ? '...' : ''}"`,
          url: `${window.location.origin}/image/${image.id}`,
        });
        haptic('light');
      } catch {
        // User cancelled or not supported - fallback to copy link
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/image/${image.id}`);
          toast.success('Link copied!');
          haptic('light');
        } catch {
          // Silent fail
        }
      }
    }, 'Sign in to share');
  }, [image, handleProtectedAction, haptic]);

  // Handle favorite
  const handleFavorite = useCallback(() => {
    if (!image) return;

    handleProtectedAction(() => {
      toggleFavorite(image.id);
      trackInteraction(image, 'like');
      haptic('medium');
    }, 'Sign in to save images');
  }, [image, handleProtectedAction, toggleFavorite, haptic]);

  // Navigate to creator profile
  const handleCreatorClick = useCallback(() => {
    if (image?.authorUsername) {
      haptic('light');
      onClose();
      navigate(`/user/${image.authorUsername}`);
    }
  }, [image, navigate, onClose, haptic]);

  // Navigate to tag page
  const handleTagClick = useCallback((tag: string) => {
    haptic('light');
    onClose();
    navigate(`/tag/${encodeURIComponent(tag.toLowerCase())}`);
  }, [navigate, onClose, haptic]);

  // Navigate to category
  const handleCategoryClick = useCallback(() => {
    if (image?.category) {
      haptic('light');
      onClose();
      navigate(`/explore?category=${image.category}`);
    }
  }, [image, navigate, onClose, haptic]);

  // Handle sheet drag
  const handleSheetDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsExpanded(true);
      haptic('light');
    } else if (info.offset.y > 50) {
      if (isExpanded) {
        setIsExpanded(false);
        haptic('light');
      } else {
        onClose();
      }
    }
  }, [isExpanded, onClose, haptic]);

  // Handle image swipe navigation
  const handleImageSwipe = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 80;
    const velocity = Math.abs(info.velocity.x);

    // Swipe Down to Close
    if (info.offset.y > swipeThreshold) {
      onClose();
      return;
    }

    // Swipe Horizontal to Navigate Similar
    if ((Math.abs(info.offset.x) > swipeThreshold || velocity > 500) && similarImages.length > 0) {
      if (info.offset.x < -swipeThreshold || (velocity > 500 && info.velocity.x < 0)) {
        // Swipe Left -> Next
        setSwipeDirection('left');
        haptic('light');
        const currentIdx = allImages.findIndex(img => img.id === image?.id);
        const nextIdx = (currentIdx + 1) % allImages.length;
        onSimilarClick(allImages[nextIdx]);
      } else if (info.offset.x > swipeThreshold || (velocity > 500 && info.velocity.x > 0)) {
        // Swipe Right -> Previous
        setSwipeDirection('right');
        haptic('light');
        const currentIdx = allImages.findIndex(img => img.id === image?.id);
        const prevIdx = currentIdx === 0 ? allImages.length - 1 : currentIdx - 1;
        onSimilarClick(allImages[prevIdx]);
      }
    }
  }, [image, allImages, similarImages.length, onClose, onSimilarClick, haptic]);

  if (!image) return null;

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: "100%",
            transition: {
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1]
            }
          }}
          className="fixed inset-0 z-[60] bg-black/95"
          onClick={onClose}
        >
          {/* SEO Meta Tags */}
          <Helmet>
            <title>{image.title || 'AI Generated Image'} - Arti Studio</title>
            <meta name="description" content={image.prompt.slice(0, 160)} />

            {/* Open Graph */}
            <meta property="og:title" content={image.title || 'AI Generated Image'} />
            <meta property="og:description" content={image.prompt.slice(0, 200)} />
            <meta property="og:image" content={image.url} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={`${window.location.origin}/image/${image.id}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={image.title || 'AI Generated Image'} />
            <meta name="twitter:description" content={image.prompt.slice(0, 200)} />
            <meta name="twitter:image" content={image.url} />

            {/* Article Dates for SEO Freshness */}
            <meta property="article:published_time" content={new Date(image.createdAt).toISOString()} />
            <meta property="article:modified_time" content={new Date(image.createdAt).toISOString()} />

            <link rel="canonical" href={`${window.location.origin}/image/${image.id}`} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "contentUrl": image.url,
                "license": "https://artistudio.fun/license",
                "acquireLicensePage": `https://artistudio.fun/image/${image.id}`,
                "creditText": image.author,
                "creator": {
                  "@type": "Person",
                  "name": image.author
                },
                "copyrightNotice": `Ansari - ${image.author}`,
                "caption": image.prompt,
                "datePublished": new Date(image.createdAt).toISOString(),
                "dateModified": new Date(image.createdAt).toISOString()
              })}
            </script>
          </Helmet>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            className="absolute top-0 left-0 right-0 z-20 pt-[env(safe-area-inset-top)] px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pt-2">
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                layout
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-lg active:bg-white/20 transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </motion.button>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Edit Button (Owner Only) */}
                {isOwnImage && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    layout
                    onClick={() => {
                      haptic('light');
                      setIsEditing(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-lg text-white active:bg-white/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Report Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  layout
                  onClick={() => {
                    haptic('light');
                    setShowReportModal(true);
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-lg text-white active:bg-white/20 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </motion.button>

                {/* Favorite Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  layout
                  onClick={handleFavorite}
                  className={cn(
                    "w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all border border-white/5 shadow-lg active:scale-95",
                    isSaved
                      ? "bg-rose-500/30 text-rose-400"
                      : "bg-white/10 text-white active:bg-white/20"
                  )}
                >
                  <Heart className={cn("w-5 h-5 transition-transform", isSaved && "fill-current scale-110")} />
                </motion.button>

                {/* Add to Collection Button */}
                {user && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    layout
                    onClick={() => {
                      haptic('light');
                      setShowCollectionSheet(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-lg text-white active:bg-white/20 transition-colors"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Share Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  layout
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-lg text-white active:bg-white/20 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Image Area - with swipe navigation */}
          <motion.div
            className={cn(
              "absolute inset-0 flex items-center justify-center px-4 transition-all duration-300",
              isExpanded ? "pt-16 pb-[70vh]" : "pt-16 pb-[38vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={image.id}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0
                }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                src={image.url}
                alt={image.title || "Detail view"}
                className="max-w-full max-h-full object-contain rounded-2xl no-select no-drag shadow-2xl"
                draggable={false}
                decoding="async"
                drag
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleImageSwipe}
                whileDrag={{ scale: 0.95, cursor: 'grabbing' }}
              />
            </AnimatePresence>
          </motion.div>

          {/* Bottom Sheet - Draggable */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleSheetDrag}
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              height: isExpanded ? "70vh" : "38vh"
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-3xl rounded-t-3xl border-t border-white/10 flex flex-col shadow-2xl"
            layout
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <button
              onClick={() => {
                setIsExpanded(!isExpanded);
                haptic('light');
              }}
              className="flex flex-col items-center py-3 flex-shrink-0 active:opacity-70 transition-opacity"
            >
              <div className="w-10 h-1 rounded-full bg-white/30 mb-1" />
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Scrollable content */}
            <div className="px-5 pb-8 space-y-5 overflow-y-auto flex-1 hide-scrollbar overscroll-contain">

              {/* Creator Section with Avatar and Follow */}
              <div className="flex items-center justify-between gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreatorClick}
                  className="flex items-center gap-3 flex-1 min-w-0 p-2 -ml-2 rounded-xl active:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[2px] shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      {image.authorAvatar ? (
                        <img
                          src={image.authorAvatar}
                          alt={image.author}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600">
                          <span className="text-white font-semibold text-sm">
                            {image.author?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Date */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate text-[15px]">
                      {image.author}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(image.createdAt)}</span>
                    </div>
                  </div>
                </motion.button>

                {/* Follow Button */}
                {!isOwnImage && image.authorId && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95",
                      followLoading && "opacity-50",
                      isFollowing
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    )}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Title */}
              {image.title && (
                <h2 className="font-bold text-lg text-white leading-tight line-clamp-2">
                  {image.title}
                </h2>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {image.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  {image.copies.toLocaleString()} copies
                </span>
              </div>

              {/* Prompt Section */}
              <div className="relative bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Prompt</span>
                </div>

                {user ? (
                  <>
                    <motion.p
                      layout
                      className={cn(
                        "text-sm text-foreground/85 leading-relaxed pr-14",
                        !isPromptExpanded && "line-clamp-3"
                      )}
                      dir="ltr"
                    >
                      {image.prompt}
                    </motion.p>

                    {/* Show More / Less Button */}
                    {image.prompt.length > 100 && (
                      <button
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="text-xs font-medium text-violet-400 active:text-violet-300 transition-colors flex items-center gap-1 mt-2"
                      >
                        {isPromptExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </>
                ) : (
                  /* Blurred Prompt for non-authenticated users */
                  <div className="relative">
                    <p className="text-sm text-foreground/60 leading-relaxed blur-sm select-none line-clamp-3">
                      Sign in to view the full prompt details and specifications used to generate this amazing AI image...
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg"
                    >
                      <span className="flex items-center gap-2 bg-violet-600 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-lg">
                        <Lock className="w-3.5 h-3.5" />
                        View Prompt
                      </span>
                    </motion.button>
                  </div>
                )}

                {/* Copy button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyPrompt}
                  className={cn(
                    "absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95",
                    copied
                      ? "bg-green-500/20 text-green-400"
                      : "bg-violet-500/20 text-violet-400"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>

              {/* Category - Clickable */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCategoryClick}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-violet-500/15 text-violet-400 text-sm font-medium w-fit active:bg-violet-500/25 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                {category?.label || image.category}
              </motion.button>

              {/* Tags - Clickable */}
              {image.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-muted-foreground border border-white/10 active:bg-white/10 transition-colors font-medium"
                    >
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Similar Images */}
              {similarImages.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-violet-400" />
                    Similar Prompts
                  </h4>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2 snap-x snap-mandatory">
                    {similarImages.slice(0, 10).map((similar) => (
                      <motion.button
                        key={similar.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          haptic('light');
                          onSimilarClick(similar);
                        }}
                        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 active:border-violet-500/50 transition-all snap-start"
                      >
                        <img
                          src={similar.url}
                          alt=""
                          className="w-full h-full object-cover no-select no-drag"
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          sizes="80px"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Report Modal */}
          <ReportModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
            targetId={image.id}
            targetType="image"
          />

          {/* Edit Modal */}
          {isEditing && (
            <EditImageModal
              image={image}
              onClose={() => setIsEditing(false)}
              onUpdate={() => {
                window.location.reload();
              }}
              onDelete={() => {
                window.location.reload();
              }}
            />
          )}

          {/* Add to Collection Sheet */}
          <MobileAddToCollectionSheet
            open={showCollectionSheet}
            onOpenChange={setShowCollectionSheet}
            imageId={image.id}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
