
import { supabase } from '@/lib/supabase';
import { GalleryImageDB, Profile } from '@/types/database.types';

// Use R2 Worker URL for embeddings (same worker handles uploads + AI)
const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || 'http://localhost:8787';

// ============================================
// CACHING LAYER - Reduce API/DB calls
// ============================================

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

// Embedding cache: query -> embedding vector (30 min TTL)
const embeddingCache = new Map<string, CacheEntry<number[]>>();
const EMBEDDING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Search results cache: query -> results (5 min TTL)
interface HybridSearchResult {
    images: GalleryImageDB[];
    profiles: Profile[];
}
const searchCache = new Map<string, CacheEntry<HybridSearchResult>>();
const SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
        return entry.data;
    }
    if (entry) cache.delete(key); // Clean expired
    return null;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl: number): void {
    // Limit cache size to prevent memory bloat
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ============================================

// Extended types with source tracking for deduplication
interface SearchImageResult extends GalleryImageDB {
    _source?: 'keyword' | 'semantic';
    similarity?: number;
}

interface SearchProfileResult extends Profile {
    _source?: 'keyword' | 'semantic';
    similarity?: number;
}

export const SemanticSearchService = {

    /**
     * Generates a vector embedding for the given text using Cloudflare Worker AI.
     * CACHED: 30 minute TTL to reduce Worker API calls
     */
    generateEmbedding: async (text: string, adminSecret?: string): Promise<number[] | null> => {
        const cacheKey = text.toLowerCase().trim();

        // Check cache first
        const cached = getCached(embeddingCache, cacheKey);
        if (cached) {
            console.log('[SemanticSearch] Embedding cache HIT:', cacheKey.slice(0, 20));
            return cached;
        }

        try {
            // Get current user token if logged in
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (adminSecret) {
                headers['X-Admin-Secret'] = adminSecret;
            } else if (token) {
                headers['Authorization'] = `Bearer ${token}`; // Send Supabase/Firebase token
            }

            const response = await fetch(`${WORKER_URL}/embeddings`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                console.error('Failed to generate embedding:', await response.text());
                return null;
            }

            const data = await response.json();
            const embedding = data.embedding;

            // Cache the embedding
            if (embedding) {
                setCache(embeddingCache, cacheKey, embedding, EMBEDDING_CACHE_TTL);
            }

            return embedding;
        } catch (error) {
            console.error('Error in generateEmbedding:', error);
            return null;
        }
    },

    /**
     * Performs a hybrid semantic search for both images and profiles.
     */
    /**
     * Performs a hybrid semantic search:
     * Combines Vector Search (Concept) + Keyword Search (Exact Match)
     * Prioritizes exact matches in Prompts/Titles.
     * CACHED: 5 minute TTL to reduce database calls
     */
    search: async (query: string, limit: number = 20): Promise<HybridSearchResult> => {
        const cacheKey = `${query.toLowerCase().trim()}:${limit}`;

        // Check cache first
        const cached = getCached(searchCache, cacheKey);
        if (cached) {
            console.log('[SemanticSearch] Search cache HIT:', query);
            return cached;
        }

        // Run parallel: Vector Search + Keyword Search
        const [vectorResult, keywordResult] = await Promise.all([
            // 1. Vector Search (Semantic)
            (async () => {
                try {
                    const embedding = await SemanticSearchService.generateEmbedding(query);
                    if (!embedding) return { images: [], profiles: [] };

                    const { data, error } = await supabase.rpc('hybrid_search', {
                        query_embedding: JSON.stringify(embedding),
                        match_threshold: 0.5,
                        match_count: limit
                    });

                    if (error) {
                        console.error('Vector search error:', error);
                        return { images: [], profiles: [] };
                    }

                    const rawResults = data as HybridSearchResult;

                    // ALWAYS HYDRATE: The minimal RPC only returns IDs + similarity.
                    // We need to fetch full image data from the database.
                    const needsHydration = rawResults.images && rawResults.images.length > 0;

                    if (needsHydration) {
                        const ids = rawResults.images.map(img => img.id);
                        const { data: hydratedImages } = await supabase
                            .from('gallery_images')
                            .select('*, author:profiles(username, full_name, avatar_url, id)')
                            .in('id', ids);

                        if (hydratedImages) {
                            // Map hydrated data back to results
                            const hydratedMap = new Map(hydratedImages.map(img => [img.id, img]));
                            rawResults.images = rawResults.images.map(img => {
                                const fullImg = hydratedMap.get(img.id);
                                if (fullImg) {
                                    // Merge, ensuring we keep the semantic similarity score if present
                                    return { ...img, ...fullImg };
                                }
                                return img;
                            });
                        }
                    }

                    return rawResults;
                } catch (e) {
                    console.error('Vector search exception:', e);
                    return { images: [], profiles: [] };
                }
            })(),

            // 2. Keyword Search (Exact text match) - Uses fallbackSearch logic
            SemanticSearchService.keywordSearch(query, limit)
        ]);

        // 3. Merge Strategies
        // Create a Map to deduplicate by ID, prioritizing Keyword results (inserted first)
        const combinedImages = new Map<string, SearchImageResult>();
        const combinedProfiles = new Map<string, SearchProfileResult>();

        // Add Keyword results first (Top priority)
        keywordResult.images.forEach(img => combinedImages.set(img.id, { ...img, _source: 'keyword' }));
        keywordResult.profiles.forEach(prof => combinedProfiles.set(prof.id, { ...prof, _source: 'keyword' }));

        // Add Vector results (Discovery) if not already present
        vectorResult.images.forEach(img => {
            if (!combinedImages.has(img.id)) {
                combinedImages.set(img.id, { ...img, _source: 'semantic' });
            }
        });
        vectorResult.profiles.forEach(prof => {
            if (!combinedProfiles.has(prof.id)) {
                combinedProfiles.set(prof.id, { ...prof, _source: 'semantic' });
            }
        });

        // Convert back to arrays
        const result: HybridSearchResult = {
            images: Array.from(combinedImages.values()),
            profiles: Array.from(combinedProfiles.values())
        };

        // Cache the results
        setCache(searchCache, cacheKey, result, SEARCH_CACHE_TTL);

        return result;
    },

    /**
     * Keyword search using basic ILIKE (Text Match).
     * Used as standalone fallback OR as part of the main search strategy.
     */
    keywordSearch: async (query: string, limit: number = 20): Promise<HybridSearchResult> => {
        // Search Images: Title OR Prompt OR Tags
        const { data: images } = await supabase
            .from('gallery_images')
            .select('*, author:profiles(username, full_name, avatar_url, id)')
            .or(`title.ilike.%${query}%,prompt.ilike.%${query}%,tags.cs.{${query}}`) // Added Prompt & Tags support
            .order('created_at', { ascending: false })
            .limit(limit);

        // Search Profiles: Username OR Full Name
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(5);

        return {
            images: (images as GalleryImageDB[]) || [],
            profiles: profiles || []
        };
    },

    /**
     * Legacy alias for compatibility
     */
    fallbackSearch: async (query: string): Promise<HybridSearchResult> => {
        return SemanticSearchService.keywordSearch(query);
    }
};
