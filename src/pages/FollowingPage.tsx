import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryImage } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getAvatarUrl } from '@/lib/avatar';

// Lazy load modals
const ImageModal = lazy(() => import('@/components/gallery/ImageModal').then(module => ({ default: module.ImageModal })));
const MobileImageModal = lazy(() => import('@/components/mobile/MobileImageModal').then(module => ({ default: module.MobileImageModal })));

interface FollowedUser {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    email: string | null;
}

/**
 * Fetch followed users with their profiles
 * OPTIMIZED: Uses single query with relation instead of 2 queries
 */
async function fetchFollowedUsers(userId: string): Promise<FollowedUser[]> {
    // 1. Get IDs of users being followed
    const { data: follows, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (error) {
        console.error('Error fetching follows:', error);
        return [];
    }

    if (!follows || follows.length === 0) return [];

    const followingIds = follows.map((f: { following_id: string }) => f.following_id);

    // 2. Fetch profiles for these IDs
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, email')
        .in('id', followingIds);

    if (profilesError) {
        console.error('Error fetching profiles for followed users:', profilesError);
    }

    return (profiles || []) as FollowedUser[];
}



interface DBImage {
    id: string;
    url: string;
    prompt: string;
    category: string;
    tags: string[] | null;
    created_at: string;
    views: number;
    likes: number;
    downloads: number;
    copies: number;
    aspect_ratio: number;
    author_id: string;
}

interface DBProfile {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
}

// Fetch images from followed users with pagination
async function fetchFollowingImages({
    pageParam = 0,
    followingIds,
    limit = 30
}: {
    pageParam?: number;
    followingIds: string[];
    limit?: number;
}): Promise<GalleryImage[]> {
    if (followingIds.length === 0) return [];

    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .in('author_id', followingIds)
        .order('created_at', { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

    if (error) {
        console.error('Error fetching following images:', error);
        return [];
    }

    const images = (data || []) as DBImage[];

    // Get author profiles
    const authorIds = [...new Set(images.map(img => img.author_id).filter(Boolean))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', authorIds);

    const profileMap = new Map((profiles as DBProfile[] || []).map(p => [p.id, p]));

    return images.map(img => {
        const author = profileMap.get(img.author_id);
        return {
            id: img.id,
            url: img.url,
            prompt: img.prompt,
            category: img.category,
            tags: img.tags || [],
            author: author?.full_name || author?.username || 'User',
            createdAt: img.created_at,
            views: img.views || 0,
            likes: img.likes || 0,
            downloads: img.downloads || 0,
            copies: img.copies || 0,
            aspectRatio: img.aspect_ratio || 1,
            authorId: img.author_id,
            authorUsername: author?.username || undefined,
            authorAvatar: author?.avatar_url || undefined,
        };
    });
}

export default function FollowingPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const isMobile = useIsMobile();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Fetch followed users
    const { data: followedUsers = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['followed-users', user?.uid],
        queryFn: () => fetchFollowedUsers(user!.uid),
        enabled: !!user?.uid,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const followingIds = useMemo(() => followedUsers.map(u => u.id), [followedUsers]);

    // Fetch images with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: loadingImages
    } = useInfiniteQuery({
        queryKey: ['following-images', user?.uid, followingIds],
        queryFn: ({ pageParam = 0 }) => fetchFollowingImages({
            pageParam,
            followingIds,
            limit: 30
        }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 30 ? allPages.length : undefined;
        },
        enabled: !!user?.uid && followingIds.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const images = useMemo(() => {
        const allImages = data?.pages.flatMap(page => page) || [];
        // Deduplicate
        const seen = new Set();
        return allImages.filter(img => {
            if (seen.has(img.id)) return false;
            seen.add(img.id);
            return true;
        });
    }, [data]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const handleImageClick = (image: GalleryImage) => {
        setSelectedImage(image);
    };

    const isLoading = authLoading || loadingUsers;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null; // Will redirect
    }

    return (
        <>
            <Helmet>
                <title>Following Feed - Arti Studio</title>
                <meta name="description" content="See the latest creations from artists you follow on Arti Studio." />
            </Helmet>

            <div className={cn("min-h-screen", isMobile ? "px-4 pb-24" : "px-8 pb-24")}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 md:py-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Following</h1>
                            <p className="text-sm text-muted-foreground">
                                {followedUsers.length > 0
                                    ? `Latest from ${followedUsers.length} artist${followedUsers.length > 1 ? 's' : ''} you follow`
                                    : 'Discover and follow artists to see their work here'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Following Users Strip */}
                    {followedUsers.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                            {followedUsers.slice(0, 10).map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => navigate(`/${user.username || user.id}`)}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors shrink-0"
                                >
                                    <img
                                        src={getAvatarUrl(user.email || 'user', user.avatar_url)}
                                        alt={user.full_name || 'User'}
                                        referrerPolicy="no-referrer"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/50"
                                    />
                                    <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                                        {user.full_name?.split(' ')[0] || user.username || 'User'}
                                    </span>
                                </button>
                            ))}
                            {followedUsers.length > 10 && (
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground shrink-0">
                                    +{followedUsers.length - 10}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Empty State - No Following */}
                {followedUsers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                            <UserPlus className="w-12 h-12 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Start Following Artists</h2>
                        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                            Follow your favorite artists to see their latest creations here.
                            Explore the gallery to discover amazing work!
                        </p>
                        <Button
                            onClick={() => navigate('/explore')}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Explore Gallery
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {/* Empty State - Following but no images */}
                {followedUsers.length > 0 && images.length === 0 && !loadingImages && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                            <Sparkles className="w-12 h-12 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No Creations Yet</h2>
                        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                            The artists you follow haven't published any work yet.
                            Check back later or explore more artists!
                        </p>
                        <Button
                            onClick={() => navigate('/explore')}
                            variant="outline"
                            className="border-white/10 hover:bg-white/5"
                        >
                            Explore More Artists
                        </Button>
                    </motion.div>
                )}

                {/* Gallery Grid */}
                {followedUsers.length > 0 && (images.length > 0 || loadingImages) && (
                    <>
                        <GalleryGrid
                            images={images}
                            onImageClick={handleImageClick}
                            isLoading={loadingImages}
                        />

                        {/* Infinite Scroll Trigger */}
                        <div ref={observerTarget} className="py-8 flex justify-center w-full">
                            {isFetchingNextPage && (
                                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
                                    <span className="text-sm text-muted-foreground">Loading more...</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Image Modal */}
            <Suspense fallback={null}>
                {isMobile ? (
                    <MobileImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={[]}
                        onSimilarClick={handleImageClick}
                    />
                ) : (
                    <ImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={[]}
                        onSimilarClick={handleImageClick}
                    />
                )}
            </Suspense>
        </>
    );
}
