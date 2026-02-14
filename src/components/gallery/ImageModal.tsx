import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Copy, Check, Eye, Heart, Share2, Tag, Calendar, Sparkles, Flag, Link2, Twitter, MessageCircle, UserPlus, UserMinus, Loader2, Edit2, FolderPlus } from 'lucide-react';
import { EditImageModal } from '@/components/profile/modals/EditImageModal';
import { GalleryImage, CATEGORIES } from '@/types/gallery';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useTrackCopy } from '@/hooks/useGallery';
import { useFavorites } from '@/hooks/useFavorites';
import { incrementViews } from '@/services/gallery.service';
import { FollowService } from '@/services/follow.service';
import { useAuth } from '@/components/auth';
import { useNavigate } from 'react-router-dom';
import { ReportModal } from '@/components/common/ReportModal';
import { AddToCollectionDropdown } from '@/components/collections/AddToCollectionDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImageModalProps {
  image: GalleryImage | null;
  onClose: () => void;
  similarImages: GalleryImage[];
  onSimilarClick: (image: GalleryImage) => void;
}

const safeDate = (date: string | Date | undefined | null) => {
  try {
    const d = new Date(date || '');
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export function ImageModal({ image, onClose, similarImages, onSimilarClick }: ImageModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const trackCopy = useTrackCopy();
  const { toggleFavorite, isFavorited } = useFavorites();

  const isSaved = image ? isFavorited(image.id) : false;

  // Check if current user is the author (don't show follow button for own images)
  const isOwnImage = user && image?.authorId === user.uid;

  useEffect(() => {
    if (image) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      // Track view
      incrementViews(image.id).catch(console.error);

      // Check follow status if user is logged in and not viewing own image
      if (user && image.authorId && image.authorId !== user.uid) {
        FollowService.isFollowing(user.uid, image.authorId).then(setIsFollowing);
      }
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [image, user]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Sign in to follow creators');
      navigate('/login');
      return;
    }

    if (!image?.authorId) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await FollowService.unfollow(user.uid, image.authorId);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await FollowService.follow(user.uid, image.authorId);
        setIsFollowing(true);
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };


  const handleProtectedAction = (action: () => void) => {
    if (!user) {
      toast.error('Sign in to interact with prompts');
      navigate('/login');
      return;
    }
    action();
  };

  const handleCopyPrompt = async () => {
    if (!image) return;
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      // Track copy
      trackCopy.mutate(image.id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleShare = async () => {
    if (!image) return;
    handleProtectedAction(async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Arti Studio: ${image.prompt.slice(0, 30)}...`,
            text: `Check out this AI prompt on Arti Studio: "${image.prompt}"`,
            url: window.location.href,
          });
        } catch (err) {
          // Share cancelled by user
        }
      } else {
        handleCopyPrompt();
      }
    });
  };

  // Get share URL for the image
  const getShareUrl = () => {
    return `${window.location.origin}/image/${image?.id}`;
  };

  // Share to Twitter
  const shareToTwitter = () => {
    if (!image) return;
    const text = `Check out this AI image on Arti Studio! 🎨\n\n"${image.prompt.slice(0, 100)}${image.prompt.length > 100 ? '...' : ''}"\n\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    if (!image) return;
    const text = `Check out this AI image on Arti Studio! 🎨\n\n"${image.prompt.slice(0, 100)}${image.prompt.length > 100 ? '...' : ''}"\n\n${getShareUrl()}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Share to Facebook
  const shareToFacebook = () => {
    if (!image) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  // Copy link to clipboard
  const copyShareLink = async () => {
    if (!image) return;
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!image) return null;

  const category = CATEGORIES.find((c) => c.id === image.category);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <Helmet>
            <title>{image.title || 'AI Generated Image'} - Arti Studio</title>
            <meta name="description" content={image.prompt} />

            {/* Open Graph */}
            <meta property="og:title" content={image.title || 'AI Generated Image'} />
            <meta property="og:description" content={image.prompt} />
            <meta property="og:image" content={image.url} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={`${window.location.origin}/image/${image.id}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={image.title || 'AI Generated Image'} />
            <meta name="twitter:description" content={image.prompt} />
            <meta name="twitter:image" content={image.url} />

            {/* Article Dates for SEO Freshness */}
            <meta property="article:published_time" content={safeDate(image.createdAt)} />
            <meta property="article:modified_time" content={safeDate(image.createdAt)} />

            <link rel="canonical" href={`https://artistudio.fun/image/${image.id}`} />

            {/* Schema.org JSON-LD - Enhanced for Maximum SEO */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "@id": `https://artistudio.fun/image/${image.id}`,
                "name": image.title || "AI Generated Art",
                "description": image.prompt?.substring(0, 300),
                "contentUrl": image.url,
                "thumbnailUrl": image.url,
                "url": `https://artistudio.fun/image/${image.id}`,
                "encodingFormat": "image/webp",
                "width": "1024",
                "height": "1024",
                "license": "https://artistudio.fun/terms",
                "acquireLicensePage": `https://artistudio.fun/image/${image.id}`,
                "creditText": image.author || "Arti Studio",
                "copyrightNotice": `© ${new Date().getFullYear()} ${image.author || "Arti Studio"}`,
                "copyrightYear": new Date(image.createdAt || Date.now()).getFullYear(),
                "creator": {
                  "@type": "Person",
                  "name": image.author || "Anonymous",
                  "url": image.authorUsername ? `https://artistudio.fun/user/${image.authorUsername}` : undefined
                },
                "author": {
                  "@type": "Person",
                  "name": image.author || "Anonymous"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Arti Studio",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://artistudio.fun/arti_studio.png"
                  },
                  "url": "https://artistudio.fun"
                },
                "caption": image.prompt,
                "keywords": [
                  "AI Art",
                  "AI Prompt",
                  image.category || "Digital Art",
                  "Midjourney",
                  "Stable Diffusion",
                  "DALL-E",
                  ...(image.tags || []).slice(0, 5)
                ].join(", "),
                "genre": image.category || "Digital Art",
                "datePublished": safeDate(image.createdAt),
                "dateModified": safeDate(image.createdAt),
                "dateCreated": safeDate(image.createdAt),
                "interactionStatistic": [
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/ViewAction",
                    "userInteractionCount": image.views || 0
                  },
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/ShareAction",
                    "userInteractionCount": image.copies || 0
                  }
                ],
                "isAccessibleForFree": true,
                "isFamilyFriendly": true,
                "inLanguage": "en"
              })}
            </script>
          </Helmet>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.y > 100) {
                handleClose();
              }
            }}
            className={cn(
              'relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl',
              'glass border border-border/50',
              'flex flex-col lg:flex-row',
              'shadow-2xl'
            )}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="flex-1 relative bg-black/20 flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
              <img
                src={image.url}
                alt={image.prompt.slice(0, 50)}
                className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain no-select no-drag"
                draggable={false}
              />
            </div>

            {/* Info Section */}
            <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border/30 max-h-[40vh] lg:max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-border/30">
                {image.title && <h2 className="text-base md:text-lg font-bold text-white mb-4 leading-tight">{image.title}</h2>}

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors flex-1 min-w-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (image.authorUsername) {
                        navigate(`/user/${image.authorUsername}`);
                      } else if (image.authorId) {
                        navigate(`/user/${image.authorId}`);
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden shrink-0">
                      {image.authorAvatar ? <img src={image.authorAvatar} alt={image.author} className="w-full h-full object-cover" /> : <span className="text-white font-semibold">{image.author?.charAt(0).toUpperCase() || '?'}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white hover:text-violet-400 transition-colors truncate">{image.author}</p>
                      <p className="text-sm text-muted-foreground">Creator</p>
                    </div>
                  </div>

                  {/* Follow Button - only show if not own image and authorId exists */}
                  {!isOwnImage && image.authorId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggle();
                      }}
                      disabled={followLoading}
                      className={cn(
                        "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        followLoading && "opacity-50 cursor-not-allowed",
                        isFollowing
                          ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      )}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{image.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><Copy className="w-4 h-4" />{image.copies.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(image.createdAt)}</span>
                </div>
              </div>

              {/* Prompt Section */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2 text-white"><Sparkles className="w-4 h-4 text-violet-400" />Prompt</h3>
                  <button onClick={handleCopyPrompt} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all', 'btn-glow', copied ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary hover:bg-primary/30')}>
                    {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
                  </button>
                </div>

                <div className="bg-secondary/30 rounded-lg p-4 transition-all overflow-hidden relative border border-white/5">
                  <p className={cn(
                    "text-sm text-foreground/80 leading-relaxed transition-all font-mono",
                    !isPromptExpanded && "line-clamp-3"
                  )}>
                    {image.prompt}
                  </p>

                  {image.prompt.length > 150 && (
                    <button
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="mt-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                    >
                      {isPromptExpanded ? <>Show Less</> : <>Read More</>}
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Category</h4>
                  <button onClick={() => { navigate(`/explore?category=${image.category}`); }} className="badge-category capitalize hover:bg-violet-500/20 hover:text-violet-300 transition-colors cursor-pointer">
                    {category?.label || image.category}
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { navigate(`/tag/${encodeURIComponent(tag.toLowerCase())}`); }}
                        className="badge-tag hover:bg-violet-500/20 hover:text-violet-300 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/30">
                  <button
                    onClick={() => handleProtectedAction(() => toggleFavorite(image.id))}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors",
                      isSaved ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                    <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Add to Collection */}
                  {user && (
                    <AddToCollectionDropdown
                      imageId={image.id}
                      trigger={
                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                          <FolderPlus className="w-4 h-4" />
                          <span className="text-sm font-medium">Collect</span>
                        </button>
                      }
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48 bg-[#1a1a1a] border-white/10">
                      <DropdownMenuItem onClick={() => handleProtectedAction(shareToTwitter)} className="cursor-pointer">
                        <Twitter className="w-4 h-4 mr-2 text-sky-400" />
                        Share on Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProtectedAction(shareToWhatsApp)} className="cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2 text-green-400" />
                        Share on WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProtectedAction(shareToFacebook)} className="cursor-pointer">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Share on Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyShareLink} className="cursor-pointer">
                        {linkCopied ? (
                          <><Check className="w-4 h-4 mr-2 text-green-400" />Link Copied!</>
                        ) : (
                          <><Link2 className="w-4 h-4 mr-2" />Copy Link</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-amber-500 transition-colors"
                    title="Report"
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  {isOwnImage && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-white transition-colors"
                      title="Edit Image"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <ReportModal
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetId={image.id}
                targetType="image"
              />

              {isEditing && (
                <EditImageModal
                  image={image}
                  onClose={() => setIsEditing(false)}
                  onUpdate={() => {
                    window.location.reload();
                  }}
                  onDelete={() => {
                    handleClose();
                    window.location.reload();
                  }}
                />
              )}

              {similarImages.length > 0 && (
                <div className="p-6 border-t border-border/30">
                  <h4 className="font-semibold mb-4">Similar Prompts</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {similarImages.slice(0, 6).map((similar) => (
                      <button
                        key={similar.id}
                        onClick={() => handleProtectedAction(() => onSimilarClick(similar))}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
                      >
                        <img
                          src={similar.url}
                          alt=""
                          className="w-full h-full object-cover no-select no-drag"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
