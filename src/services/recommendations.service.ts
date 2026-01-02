import { supabase } from '@/lib/supabase';
import type { GalleryImage, Category } from '@/types/gallery';
import type { GalleryImageDB } from '@/types/database.types';
import { enrichImagesWithAuthors } from './gallery.service';

// RPC Response types
interface TrendingImageRPC {
    id: string;
    url: string;
    prompt: string;
    category: string;
    tags: string[] | null;
    author_id: string;
    author_name?: string;
    author_username?: string;
    author_avatar?: string;
    views: number;
    copies: number;
    aspect_ratio: number;
    created_at: string;
}

interface TrendingStats {
    total_cached: number;
    last_updated: string;
    avg_score: number;
}

interface CandidateImage extends GalleryImageDB {
    _score?: number;
}

// Store user interactions for recommendations
interface UserInteraction {
    imageId: string;
    category: Category;
    tags: string[];
    action: 'view' | 'copy' | 'like';
    timestamp: number;
}

// Get recent interactions from localStorage
const getInteractions = (): UserInteraction[] => {
    const stored = localStorage.getItem('user_interactions');
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

// Save interaction
export const trackInteraction = (
    image: GalleryImage,
    action: 'view' | 'copy' | 'like'
) => {
    const interactions = getInteractions();

    // Add new interaction
    interactions.push({
        imageId: image.id,
        category: image.category,
        tags: image.tags,
        action,
        timestamp: Date.now(),
    });

    // Keep only last 100 interactions
    const recent = interactions.slice(-100);
    localStorage.setItem('user_interactions', JSON.stringify(recent));
};

// Analyze user preferences based on interactions
export const analyzePreferences = (): {
    favoriteCategories: string[];
    favoriteTags: string[];
} => {
    const interactions = getInteractions();

    // Count category occurrences
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    interactions.forEach((interaction) => {
        // Weight by action type
        const weight = interaction.action === 'copy' ? 3 : interaction.action === 'like' ? 2 : 1;

        categoryCounts[interaction.category] = (categoryCounts[interaction.category] || 0) + weight;

        interaction.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + weight;
        });
    });

    // Sort and get top preferences
    const favoriteCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

    const favoriteTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

    return { favoriteCategories, favoriteTags };
};

// Get personalized recommendations (Server-side optimized)
export const getRecommendations = async (
    limit = 12
): Promise<GalleryImage[]> => {
    const { favoriteCategories, favoriteTags } = analyzePreferences();

    // If no preferences, fallback to trending
    if (favoriteCategories.length === 0 && favoriteTags.length === 0) {
        return getTrendingImages(limit);
    }

    try {


        let dbQuery = supabase.from('gallery_images').select('*');

        // Construct OR condition for categories and tags
        const conditions: string[] = [];

        if (favoriteCategories.length > 0) {
            conditions.push(`category.in.(${favoriteCategories.join(',')})`);
        }

        if (favoriteTags.length > 0) {
            // Note: tags is an array column, we use 'ov' (overlap) operator
            // Must clean tags to ensure no quotes are breaking the query format
            const cleanTags = favoriteTags.map(t => t.replace(/['",]/g, '')).filter(Boolean);
            if (cleanTags.length > 0) {
                conditions.push(`tags.ov.{${cleanTags.join(',')}}`);
            }
        }

        if (conditions.length > 0) {
            dbQuery = dbQuery.or(conditions.join(','));
        }

        // Fetch candidates (fetch more than limit to allow for re-ranking)
        const { data, error } = await dbQuery
            .order('created_at', { ascending: false }) // Freshness first
            .limit(limit * 3);

        if (error) throw error;

        const candidates: CandidateImage[] = (data || []).map(img => ({
            ...img,
            // Temporary simple transform just to have an object for scoring
            // We'll fully enrich only the winners
            category: img.category as Category,
            tags: img.tags || [],
            views: img.views || 0,
            copies: img.copies || 0,
        }));

        // Re-rank in memory based on score (scoring 50 items is fast)
        const viewedIds = new Set(getInteractions().map((i) => i.imageId));

        const scored = candidates
            .filter((img) => !viewedIds.has(img.id))
            .map((img) => {
                let score = 0;
                if (favoriteCategories.includes(img.category)) score += 10;
                const matchingTags = img.tags.filter((tag: string) => favoriteTags.includes(tag));
                score += matchingTags.length * 5;
                score += Math.log(img.views + 1) * 2;

                return { image: img, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        // Now enrich only the final set
        return enrichImagesWithAuthors(scored.map(s => s.image));

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
};

// Trending images using advanced pre-computed algorithm
// Algorithm combines: Wilson Score (Reddit) + Time Decay (HN) + Velocity (TikTok)
// Uses cached scores updated every 15-30 minutes for optimal DB performance
export const getTrendingImages = async (
    limit = 50,
    offset = 0,
    category?: string
): Promise<GalleryImage[]> => {
    try {
        // Try the optimized RPC function first (pre-computed scores)
        const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_trending_images_v2',
            {
                p_limit: limit,
                p_offset: offset,
                p_category: category || null
            }
        );

        if (!rpcError && rpcData && rpcData.length > 0) {
            // Transform RPC result to GalleryImage format
            return rpcData.map((item: TrendingImageRPC) => ({
                id: item.id,
                url: item.url,
                prompt: item.prompt,
                category: item.category,
                tags: item.tags || [],
                authorId: item.author_id,
                // Use author info from join if available, fallback to author_name
                authorName: item.author_username || item.author_name,
                authorUsername: item.author_username,
                authorAvatar: item.author_avatar,
                views: item.views || 0,
                copies: item.copies || 0,
                aspectRatio: item.aspect_ratio || 1,
                createdAt: item.created_at,
            }));
        }

        // Fallback: Direct query with local scoring if RPC not available
        // This happens when trending_cache table doesn't exist yet
        console.warn('Trending RPC not available, using fallback...');
        return getTrendingImagesFallback(limit);
    } catch (error) {
        console.error('Error fetching trending:', error);
        return getTrendingImagesFallback(limit);
    }
};

// Fallback function when RPC is not available
// Uses simplified client-side scoring
const getTrendingImagesFallback = async (limit: number): Promise<GalleryImage[]> => {
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('views', { ascending: false })
            .limit(limit * 2); // Fetch more for re-ranking

        if (error) throw error;

        const images = data || [];

        // Simple client-side trending score
        const now = Date.now();
        const scored = images.map(img => {
            const ageHours = (now - new Date(img.created_at).getTime()) / (1000 * 60 * 60);
            const engagement = (img.views || 0) + (img.copies || 0) * 5;

            // Simple HN-style score: engagement / (age + 2)^1.5
            const score = engagement / Math.pow(ageHours + 2, 1.5);

            return { ...img, _score: score };
        });

        // Sort by score and take top N
        const sorted = scored
            .sort((a, b) => b._score - a._score)
            .slice(0, limit);

        return enrichImagesWithAuthors(sorted);
    } catch (error) {
        console.error('Error in fallback trending:', error);
        return [];
    }
};

// Update trending cache - call this from admin dashboard
export const refreshTrendingCache = async (): Promise<{
    success: boolean;
    imagesProcessed?: number;
    executionMs?: number;
    error?: string;
}> => {
    try {
        const { data, error } = await supabase.rpc('update_trending_cache');

        if (error) throw error;

        return {
            success: true,
            imagesProcessed: data?.images_processed,
            executionMs: data?.execution_ms
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error refreshing trending cache:', error);
        return {
            success: false,
            error: errorMessage
        };
    }
};

// Get trending statistics
export const getTrendingStats = async (): Promise<TrendingStats | null> => {
    try {
        const { data, error } = await supabase.rpc('get_trending_stats');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching trending stats:', error);
        return null;
    }
};

// Clear user data
export const clearUserPreferences = () => {
    localStorage.removeItem('user_interactions');
};
