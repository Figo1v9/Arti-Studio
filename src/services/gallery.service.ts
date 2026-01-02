import { supabase, getCurrentFirebaseUid } from '@/lib/supabase';
import type { GalleryImageDB } from '@/types/database.types';
import type { GalleryImage, Category } from '@/types/gallery';

// Author data from joined profiles
interface AuthorData {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
}

// Extended DB image with author join
interface GalleryImageWithAuthor extends GalleryImageDB {
    author?: AuthorData | null;
}

/**
 * Profile Cache - Reduces database queries for author data
 * 
 * At 1M users with 30 images per infinite scroll page:
 * - Without cache: 30+ profile queries per page load
 * - With cache: ~0 queries for cached profiles (90%+ cache hit rate)
 * 
 * TTL: 5 minutes (profiles rarely change)
 */
interface CachedProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    verification_tier?: string;
    is_public: boolean;
    cachedAt: number;
}

const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, CachedProfile>();

// Clear expired cache entries periodically
const cleanProfileCache = () => {
    const now = Date.now();
    for (const [id, profile] of profileCache.entries()) {
        if (now - profile.cachedAt > PROFILE_CACHE_TTL) {
            profileCache.delete(id);
        }
    }
};

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(cleanProfileCache, PROFILE_CACHE_TTL);
}

// Transform database image to frontend format
export const transformImage = (dbImage: GalleryImageWithAuthor): GalleryImage => ({
    id: dbImage.id,
    url: dbImage.url,
    title: dbImage.title,
    prompt: dbImage.prompt,
    category: dbImage.category as Category,
    tags: dbImage.tags,
    author: dbImage.author_name || (dbImage.author?.full_name) || 'Arti Studio',
    createdAt: dbImage.created_at,
    views: dbImage.views,
    likes: dbImage.likes || 0,
    downloads: dbImage.downloads || 0,
    copies: dbImage.copies,
    aspectRatio: dbImage.aspect_ratio,
    authorId: dbImage.author_id,
    authorUsername: dbImage.author?.username ?? undefined,
    authorAvatar: dbImage.author?.avatar_url ?? undefined,
});

/**
 * Enriches images with author profiles AND filters private profiles' content
 * 
 * OPTIMIZED: Uses in-memory cache to avoid repeated profile fetches
 */
export const enrichImagesWithAuthors = async (images: GalleryImageDB[]): Promise<GalleryImage[]> => {
    // 1. Get unique author IDs that are valid
    const authorIds = [...new Set(images.map(img => img.author_id).filter(id => id && id.length > 10))];

    if (authorIds.length === 0) {
        return images.map(transformImage);
    }

    // 2. Check cache for existing profiles
    const now = Date.now();
    const cachedProfiles: CachedProfile[] = [];
    const missingIds: string[] = [];

    for (const id of authorIds) {
        const cached = profileCache.get(id);
        if (cached && (now - cached.cachedAt < PROFILE_CACHE_TTL)) {
            cachedProfiles.push(cached);
        } else {
            missingIds.push(id);
        }
    }

    // 3. Fetch only missing profiles from database
    let freshProfiles: CachedProfile[] = [];
    if (missingIds.length > 0) {
        const { data: profilesData, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, verification_tier, is_public')
            .in('id', missingIds);

        if (error) {
            console.error('Error fetching author profiles:', error);
        } else if (profilesData) {
            freshProfiles = profilesData.map(p => ({
                ...p,
                cachedAt: now
            }));

            // Add to cache
            for (const profile of freshProfiles) {
                profileCache.set(profile.id, profile);
            }
        }
    }

    // 4. Combine cached and fresh profiles
    const allProfiles = [...cachedProfiles, ...freshProfiles];
    const profileMap = new Map(allProfiles.map(p => [p.id, p]));

    // 5. Get current user ID to allow them to see their own content
    const currentUserId = getCurrentFirebaseUid();

    // 6. Filter out images from private profiles (except for the owner)
    const filteredImages = images.filter(img => {
        const profile = img.author_id ? profileMap.get(img.author_id) : null;

        // If profile not found, show the image (fallback)
        if (!profile) return true;

        // If profile is public, show the image
        if (profile.is_public) return true;

        // If profile is private, only show to the owner
        return img.author_id === currentUserId;
    });

    // 7. Enrich and return
    return filteredImages.map(img => {
        const profile = img.author_id ? profileMap.get(img.author_id) : null;
        if (profile) {
            const transformed = transformImage(img);
            transformed.author = profile.full_name || profile.username || 'User';
            transformed.authorUsername = profile.username || undefined;
            transformed.authorAvatar = profile.avatar_url || undefined;
            transformed.authorVerification = (profile.verification_tier || 'none') as 'none' | 'blue' | 'gold';
            return transformed;
        }
        return transformImage(img);
    });
};

// Setup batch flush interval (every 5 seconds)
// Batch storage
const viewBatch = new Map<string, number>(); // imageId -> count
const copyBatch = new Map<string, number>(); // imageId -> count

// Dedupe: Don't count same image view twice in same session
const viewedThisSession = new Set<string>();

// Flush batches to database using RPC
const flushViewBatch = async () => {
    if (viewBatch.size === 0) return;

    // Prepare payload for RPC
    const payload = Array.from(viewBatch.entries()).map(([id, count]) => ({
        id,
        count
    }));

    // Clear batch immediately to prevent double sends
    viewBatch.clear();

    try {
        const { error } = await supabase.rpc('increment_views_batch', { payload });

        if (error) {
            console.error('Failed to flush view batch:', error);
            // Optional: Re-add to batch if critical, but simplified to avoid infinite loops
        }
    } catch (e) {
        console.error('Exception flushing view batch:', e);
    }
};

const flushCopyBatch = async () => {
    if (copyBatch.size === 0) return;

    const payload = Array.from(copyBatch.entries()).map(([id, count]) => ({
        id,
        count
    }));

    copyBatch.clear();

    try {
        const { error } = await supabase.rpc('increment_copies_batch', { payload });

        if (error) {
            console.error('Failed to flush copy batch:', error);
        }
    } catch (e) {
        console.error('Exception flushing copy batch:', e);
    }
};

// Setup batch flush interval (every 5 seconds)
let isBatchTrackingInitialized = false;

export const initViewTracking = () => {
    if (typeof window !== 'undefined' && !isBatchTrackingInitialized) {
        setInterval(flushViewBatch, 5000);
        setInterval(flushCopyBatch, 5000);

        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            flushViewBatch();
            flushCopyBatch();
        });

        isBatchTrackingInitialized = true;
    }
};

/**
 * Increment view count - BATCHED
 * Instead of immediate DB call, adds to batch
 */
export const incrementViews = async (imageId: string): Promise<void> => {
    // Ensure tracking is running if used
    if (!isBatchTrackingInitialized) initViewTracking();

    // Dedupe within session
    if (viewedThisSession.has(imageId)) return;

    // Memory Leak Protection: Cap the set size
    if (viewedThisSession.size > 1000) {
        // Clear oldest 500 (approximated by clearing logical half or full reset)
        // For simple sets, full clear is safer than growing infinitely
        viewedThisSession.clear();
    }

    viewedThisSession.add(imageId);

    // Add to batch
    viewBatch.set(imageId, (viewBatch.get(imageId) || 0) + 1);
};

// Fetch all gallery images - LIMIT ADDED
export const fetchGalleryImages = async (limit = 50): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }

    return enrichImagesWithAuthors(data || []);
};

/**
 * Increment copy count - BATCHED
 * Copies are less frequent but still batched
 */
export const incrementCopies = async (imageId: string): Promise<void> => {
    copyBatch.set(imageId, (copyBatch.get(imageId) || 0) + 1);
};

// Get similar images
export const getSimilarImages = async (
    imageId: string,
    category: string,
    tags: string[]
): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .neq('id', imageId)
        .or(`category.eq.${category},tags.ov.{${tags.join(',')}}`)
        .limit(6);

    if (error) {
        console.error('Error fetching similar images:', error);
        return [];
    }

    return enrichImagesWithAuthors(data || []);
};

// Fetch images from followed users
export const fetchFollowedImages = async (userId: string): Promise<GalleryImage[]> => {
    // 1. Get List of followed user IDs
    const { data: followsData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    const follows = followsData as unknown as { following_id: string }[] | null;

    if (followError) {
        console.error('Error fetching follows:', followError);
        return [];
    }

    if (!follows || follows.length === 0) return [];

    const followingIds = follows.map(f => f.following_id);

    // 2. Fetch images from those authors
    const { data: images, error: imageError } = await supabase
        .from('gallery_images')
        .select('*')
        .in('author_id', followingIds)
        .order('created_at', { ascending: false });

    if (imageError) {
        console.error('Error fetching followed images:', imageError);
        return [];
    }

    return enrichImagesWithAuthors(images || []);
};

// Fetch categories from database
export const fetchCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
};

// Fetch gallery images with pagination
export const fetchGalleryImagesInfinite = async ({
    pageParam = 0,
    limit = 12,
    category = null,
    userId = null,
    query: searchQuery = ''
}: {
    pageParam?: number;
    limit?: number;
    category?: string | null;
    userId?: string | null;
    query?: string;
}): Promise<GalleryImage[]> => {
    // Special handling for 'following' feed
    if (category === 'following' && userId) {
        const { data: followsData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);

        const follows = followsData as unknown as { following_id: string }[] | null;
        const followingIds = follows?.map(f => f.following_id) || [];

        if (followingIds.length === 0) return [];

        let dbQuery = supabase
            .from('gallery_images')
            .select('*')
            .in('author_id', followingIds)
            .order('created_at', { ascending: false })
            .range(pageParam * limit, (pageParam + 1) * limit - 1);

        if (searchQuery) {
            dbQuery = dbQuery.or(`prompt.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error('Error fetching following feed:', error);
            return [];
        }
        return enrichImagesWithAuthors(data || []);
    }

    let dbQuery = supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

    if (category && category !== 'all') {
        dbQuery = dbQuery.eq('category', category);
    }

    if (searchQuery) {
        dbQuery = dbQuery.or(`prompt.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
    }

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error fetching filtered gallery images:', error);
        return [];
    }

    return enrichImagesWithAuthors(data || []);
};

// Fetch single image by ID
export const fetchImageById = async (imageId: string): Promise<GalleryImage | null> => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('id', imageId)
        .single();

    if (error) {
        console.error('Error fetching image by ID:', error);
        return null;
    }

    const enriched = await enrichImagesWithAuthors([data]);
    return enriched[0] || null;
};

// Fetch images by category
export const fetchImagesByCategory = async (category: Category): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching images by category:', error);
        return [];
    }

    return enrichImagesWithAuthors(data || []);
};

// Search images
export const searchImages = async (query: string): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .or(`prompt.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching images:', error);
        return [];
    }

    return enrichImagesWithAuthors(data || []);
};
