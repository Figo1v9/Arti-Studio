/**
 * Collections Service
 * Handles all collection-related operations
 */

import { supabase } from '@/lib/supabase';
import type { Collection, GalleryImageDB } from '@/types/database.types';

// Extended collection with images
export interface CollectionWithImages extends Collection {
    images: GalleryImageDB[];
}

// Collection with cover preview
export interface CollectionPreview extends Collection {
    cover_images: string[]; // Up to 4 image URLs for preview grid
}

/**
 * Generate a URL-safe slug from the collection name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, '') || 'collection';
}

/**
 * Get all collections for a user
 * @param userId - The user ID to fetch collections for
 * @param isOwner - If true, returns all collections. If false, returns only public collections.
 */
export async function getUserCollections(userId: string, isOwner: boolean = false): Promise<CollectionPreview[]> {
    try {
        // Build query - filter by is_public if not the owner
        let query = supabase
            .from('collections')
            .select('*')
            .eq('user_id', userId);

        // Only show public collections to non-owners
        if (!isOwner) {
            query = query.eq('is_public', true);
        }

        const { data: collections, error } = await query.order('updated_at', { ascending: false });

        if (error) throw error;
        if (!collections) return [];

        // Get cover images for each collection (first 4 images)
        const collectionsWithCovers = await Promise.all(
            collections.map(async (collection) => {
                const { data: images } = await supabase
                    .from('collection_images')
                    .select('image_id, gallery_images!inner(url)')
                    .eq('collection_id', collection.id)
                    .order('sort_order', { ascending: true })
                    .limit(4);

                const cover_images = images?.map((img) => {
                    const galleryImage = img.gallery_images as unknown as { url: string };
                    return galleryImage?.url || '';
                }).filter(Boolean) || [];

                return {
                    ...collection,
                    cover_images
                };
            })
        );

        return collectionsWithCovers;
    } catch (error) {
        console.error('Error fetching user collections:', error);
        return [];
    }
}

/**
 * Get a single collection by slug
 * @param username - The username of the collection owner
 * @param slug - The collection slug
 * @param currentUserId - Optional current user ID to check access to private collections
 */
export async function getCollectionBySlug(
    username: string,
    slug: string,
    currentUserId?: string
): Promise<CollectionWithImages | null> {
    try {
        // First get user ID from username
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (!profile) return null;

        // Get collection
        const { data: collection, error } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', profile.id)
            .eq('slug', slug)
            .single();

        if (error || !collection) return null;

        // Check privacy: if collection is private and current user is not the owner, deny access
        if (!collection.is_public && currentUserId !== profile.id) {
            return null;
        }

        // Get images in collection
        const { data: collectionImages } = await supabase
            .from('collection_images')
            .select(`
                image_id,
                sort_order,
                gallery_images!inner(*)
            `)
            .eq('collection_id', collection.id)
            .order('sort_order', { ascending: true });

        const images = collectionImages?.map((ci) => {
            return ci.gallery_images as unknown as GalleryImageDB;
        }) || [];

        return {
            ...collection,
            images
        };
    } catch (error) {
        console.error('Error fetching collection:', error);
        return null;
    }
}

/**
 * Create a new collection
 */
export async function createCollection(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = true
): Promise<Collection | null> {
    try {
        const slug = generateSlug(name);

        // Check if slug exists for this user (use maybeSingle to avoid error when no results)
        const { data: existingList } = await supabase
            .from('collections')
            .select('slug')
            .eq('user_id', userId)
            .eq('slug', slug)
            .limit(1);

        // If exists, add a timestamp
        const existing = existingList && existingList.length > 0;
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const { data, error } = await supabase
            .from('collections')
            .insert({
                user_id: userId,
                name,
                slug: finalSlug,
                description: description || null,
                is_public: isPublic
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating collection:', error);
        return null;
    }
}

/**
 * Update a collection
 */
export async function updateCollection(
    collectionId: string,
    updates: {
        name?: string;
        description?: string;
        is_public?: boolean;
        cover_image_url?: string;
    }
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = { ...updates };

        // If name is being updated, update the slug too
        if (updates.name) {
            updateData.slug = generateSlug(updates.name);
        }

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('collections')
            .update(updateData)
            .eq('id', collectionId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating collection:', error);
        return false;
    }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting collection:', error);
        return false;
    }
}

/**
 * Add an image to a collection
 */
export async function addImageToCollection(
    collectionId: string,
    imageId: string
): Promise<boolean> {
    try {
        // Get max sort order (use limit instead of single to avoid error when empty)
        const { data: sortOrders } = await supabase
            .from('collection_images')
            .select('sort_order')
            .eq('collection_id', collectionId)
            .order('sort_order', { ascending: false })
            .limit(1);

        const maxOrder = sortOrders && sortOrders.length > 0 ? sortOrders[0].sort_order : 0;
        const sortOrder = maxOrder + 1;

        const { error } = await supabase
            .from('collection_images')
            .insert({
                collection_id: collectionId,
                image_id: imageId,
                sort_order: sortOrder
            });

        if (error) {
            // If duplicate, ignore
            if (error.code === '23505') return true;
            throw error;
        }

        // Update collection's cover image if it's the first image
        if (sortOrder === 1) {
            const { data: image } = await supabase
                .from('gallery_images')
                .select('url')
                .eq('id', imageId)
                .single();

            if (image) {
                await supabase
                    .from('collections')
                    .update({ cover_image_url: image.url })
                    .eq('id', collectionId);
            }
        }

        return true;
    } catch (error) {
        console.error('Error adding image to collection:', error);
        return false;
    }
}

/**
 * Remove an image from a collection
 */
export async function removeImageFromCollection(
    collectionId: string,
    imageId: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('collection_images')
            .delete()
            .eq('collection_id', collectionId)
            .eq('image_id', imageId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing image from collection:', error);
        return false;
    }
}

/**
 * Get collections that contain a specific image (for the current user)
 */
export async function getImageCollections(
    userId: string,
    imageId: string
): Promise<{ collectionId: string; name: string }[]> {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select(`
                id,
                name,
                collection_images!inner(image_id)
            `)
            .eq('user_id', userId)
            .eq('collection_images.image_id', imageId);

        if (error) throw error;

        return data?.map(c => ({
            collectionId: c.id,
            name: c.name
        })) || [];
    } catch (error) {
        console.error('Error fetching image collections:', error);
        return [];
    }
}

/**
 * Get all user's collections (simple list for dropdown)
 */
export async function getUserCollectionsList(
    userId: string
): Promise<{ id: string; name: string; image_count: number }[]> {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select('id, name, image_count')
            .eq('user_id', userId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching collections list:', error);
        return [];
    }
}
