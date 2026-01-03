import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryImage, Category } from '@/types/gallery';
import { Profile } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/components/auth';
import { AnalyticsService } from '@/services/analytics.service';
import { SemanticSearchService } from '@/services/semantic-search.service';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FollowButton } from '@/components/profile/FollowButton';
import { FollowService } from '@/services/follow.service';
import { useModalHistory } from '@/hooks/useModalHistory';

// Lazy load modals
const ImageModal = lazy(() => import('@/components/gallery/ImageModal').then(module => ({ default: module.ImageModal })));
const MobileImageModal = lazy(() => import('@/components/mobile/MobileImageModal').then(module => ({ default: module.MobileImageModal })));

// Popular search terms
const POPULAR_SEARCHES = [
    'cyberpunk', 'minimalist', 'portrait', 'landscape',
    'architecture', 'fashion', 'abstract', 'nature'
];

// Recent searches helpers
const getRecentSearches = (): string[] => {
    try {
        const stored = localStorage.getItem('recent_searches');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveRecentSearch = (query: string) => {
    try {
        const recent = getRecentSearches();
        const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch {
        // Ignore
    }
};

export default function SearchPage() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Search Results State
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') as Category | null; // Keep for fallback or filtering
    const [localQuery, setLocalQuery] = useState(query);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    // Modal history for back button support
    const { openWithHistory } = useModalHistory(
        selectedImage !== null,
        () => setSelectedImage(null),
        'search-modal'
    );

    useEffect(() => {
        if (user) {
            // Only fetch following once when user changes, not on every render
            FollowService.getFollowing(user.uid).then(users => {
                setFollowingIds(new Set(users.map(u => u.id)));
            });
        }
    }, [user?.uid]); // Changed from [user] to [user?.uid] to prevent re-fetches

    // Track last searched query to prevent duplicate searches
    const lastSearchedQuery = useRef('');

    useEffect(() => {
        setLocalQuery(query);
        setRecentSearches(getRecentSearches());

        // Skip if same query already searched
        if (query.trim() && query !== lastSearchedQuery.current) {
            lastSearchedQuery.current = query;
            performSearch(query);
        } else if (!query.trim()) {
            lastSearchedQuery.current = '';
            setImages([]);
            setProfiles([]);
        }
    }, [query]);

    useEffect(() => {
        if (inputRef.current && !isMobile && !query) {
            inputRef.current.focus();
        }
    }, [isMobile, query]);

    const performSearch = async (searchQuery: string) => {
        setIsSearching(true);
        try {
            // Log search for analytics
            AnalyticsService.logSearch(searchQuery, user?.uid || null, 0); // Count updated later

            // Use the new Semantic Search Service
            const results = await SemanticSearchService.search(searchQuery);

            // Cast database images to GalleryImage (frontend type)
            // Note: Semantic search returns 'similarity', we can use it to sort if needed, 
            // but the RPC already sorts by similarity.
            interface SemanticSearchImage {
                id: string;
                url: string;
                title?: string | null;
                prompt?: string | null;
                category?: string | null;
                tags?: string[] | null;
                author_id?: string | null;
                author?: { id?: string; full_name?: string | null; username?: string | null; avatar_url?: string | null } | null;
                likes?: number | null;
                views?: number | null;
                downloads?: number | null;
                copies?: number | null;
                created_at?: string | null;
                aspect_ratio?: number | null;
                is_featured?: boolean;
            }
            const mappedImages: GalleryImage[] = results.images.map((img: SemanticSearchImage) => ({
                id: img.id,
                url: img.url,
                title: img.title,
                prompt: img.prompt || '',
                author: img.author?.full_name || img.author?.username || 'Unknown',
                authorId: img.author?.id || img.author_id || '', // Get from join or raw column
                authorUsername: img.author?.username,
                authorAvatar: img.author?.avatar_url || '',
                likes: img.likes || 0,
                views: img.views || 0,
                downloads: img.downloads || 0,
                copies: img.copies || 0,
                createdAt: img.created_at || new Date().toISOString(),
                category: (img.category || 'art') as Category,
                aspectRatio: img.aspect_ratio || 1,
                tags: img.tags || [],
                isFeatured: img.is_featured
            }));

            setImages(mappedImages);
            setProfiles(results.profiles);

            // Update analytics with result count if needed
            // AnalyticsService.logSearch(searchQuery, user?.uid, mappedImages.length);

        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (trimmed) {
            setSearchParams({ q: trimmed });
            saveRecentSearch(trimmed);
            setRecentSearches(getRecentSearches());
        } else {
            setSearchParams({});
        }
    };

    const handleClear = () => {
        setLocalQuery('');
        setSearchParams({});
        inputRef.current?.focus();
    };

    const handleRemoveRecent = (term: string) => {
        const updated = recentSearches.filter(q => q !== term);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
        setRecentSearches(updated);
    };

    // Calculate similar images for modal from the current result set
    const similarImages = useMemo(() => {
        if (!selectedImage) return [];
        return images
            .filter((img) => img.id !== selectedImage.id)
            .slice(0, 6);
    }, [selectedImage, images]);

    const showResults = query.trim().length > 0;

    return (
        <>
            <Helmet>
                <title>{query ? `"${query}" - Search` : 'Search'} - Arti Studio</title>
            </Helmet>

            <div className={cn("min-h-[60vh] relative", isMobile ? "px-4 pb-24" : "px-8 pb-24")}>

                {/* Ambient Background Gradient */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                {!showResults ? (
                    /* Hero Search State */
                    <div
                        className="flex flex-col items-center justify-center relative z-10"
                        style={{ minHeight: 'calc(100vh - 180px)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-2xl px-4"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-2 tracking-tight">
                                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Creativity</span>
                            </h1>
                            <p className="text-gray-400 text-center mb-10 text-lg">
                                Discover millions of AI-generated images and creators.
                            </p>

                            {/* Enhanced Search Box */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity" />
                                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 focus-within:border-white/20 focus-within:bg-white/[0.05]">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-400 transition-colors" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={localQuery}
                                        onChange={(e) => setLocalQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(localQuery)}
                                        placeholder="What are you looking for?"
                                        className="w-full h-16 pl-14 pr-6 bg-transparent rounded-full text-white placeholder:text-gray-500 focus:outline-none text-lg"
                                    />
                                </div>
                            </div>

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="mt-8">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 text-center">Recent</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {recentSearches.map((term) => (
                                            <motion.div
                                                key={term}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setLocalQuery(term); handleSearch(term); }}
                                                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{term}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveRecent(term); }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded-full transition-all"
                                                >
                                                    <X className="w-3 h-3 text-gray-400 hover:text-white" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular */}
                            <div className="mt-8">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 text-center">Trending Now</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {POPULAR_SEARCHES.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => { setLocalQuery(term); handleSearch(term); }}
                                            className="px-4 py-1.5 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* Results View */
                    <div className="animate-in fade-in duration-500 pt-6">
                        {/* Compact Search Bar Header */}
                        <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-lg py-4 -mx-4 px-4 mb-6 border-b border-white/5">
                            <div className="max-w-3xl mx-auto relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={localQuery}
                                    onChange={(e) => setLocalQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(localQuery)}
                                    className="w-full h-10 pl-10 pr-10 bg-white/10 border border-white/5 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/15 focus:border-white/10 transition-all"
                                />
                                {localQuery && (
                                    <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full">
                                        <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Loading State */}
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 relative z-10"></div>
                                </div>
                                <p className="text-gray-400 mt-6 animate-pulse">Curating results for "{query}"...</p>
                            </div>
                        ) : (
                            <>
                                {/* CREATORS SECTION */}
                                {profiles.length > 0 && (
                                    <div className="mb-12">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="p-1.5 bg-violet-500/10 rounded-lg">
                                                <UserIcon className="w-4 h-4 text-violet-400" />
                                            </span>
                                            Creators
                                        </h3>
                                        <div className="relative -mx-2">
                                            <ScrollArea className="w-full whitespace-nowrap pb-4">
                                                <div className="flex space-x-4 px-2">
                                                    {profiles.map((profile) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            key={profile.id}
                                                            className="shrink-0 w-40 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all cursor-pointer group flex flex-col items-center gap-3"
                                                            onClick={() => navigate(`/${profile.username}`)}
                                                        >
                                                            <div className="relative">
                                                                <Avatar className="w-16 h-16 border-2 border-white/10 group-hover:border-violet-500/50 transition-colors shadow-lg">
                                                                    <AvatarImage src={profile.avatar_url || ''} />
                                                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600">{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                {profile.verification_tier !== 'none' && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-[#0a0a0f] rounded-full p-0.5">
                                                                        <CheckCircle2 className={cn(
                                                                            "w-4 h-4",
                                                                            profile.verification_tier === 'gold' ? "text-amber-400" : "text-blue-400"
                                                                        )} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-center w-full">
                                                                <p className="text-sm font-semibold text-white truncate w-full group-hover:text-violet-300 transition-colors">
                                                                    {profile.full_name || profile.username}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate w-full">@{profile.username}</p>
                                                            </div>
                                                            <FollowButton
                                                                userId={profile.id}
                                                                initialIsFollowing={followingIds.has(profile.id)}
                                                                size="sm"
                                                                className="w-full h-7 text-xs"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" className="bg-white/5" />
                                            </ScrollArea>
                                        </div>
                                    </div>
                                )}

                                {/* IMAGES SECTION */}
                                {images.length === 0 && profiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <Search className="w-10 h-10 text-gray-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
                                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                                            We couldn't find any results for "{query}". Try checking for typos or use more general keywords.
                                        </p>
                                        <Button
                                            onClick={handleClear}
                                            variant="outline"
                                            className="rounded-full px-8 border-white/10 hover:bg-white/10"
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Optional Divider if both sections exist */}
                                        {profiles.length > 0 && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />}

                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                Explore
                                            </h3>
                                            <span className="text-xs font-medium text-gray-500 px-3 py-1 rounded-full bg-white/5">
                                                {images.length} results
                                            </span>
                                        </div>

                                        <GalleryGrid
                                            images={images}
                                            onImageClick={(image) => {
                                                setSelectedImage(image);
                                                openWithHistory(image.id);
                                            }}
                                            isLoading={false}
                                            showEmptyState={false}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <Suspense fallback={null}>
                {isMobile ? (
                    <MobileImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={similarImages}
                        onSimilarClick={(image) => {
                            setSelectedImage(image);
                            openWithHistory(image.id);
                        }}
                    />
                ) : (
                    <ImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={similarImages}
                        onSimilarClick={(image) => {
                            setSelectedImage(image);
                            openWithHistory(image.id);
                        }}
                    />
                )}
            </Suspense>
        </>
    );
}
