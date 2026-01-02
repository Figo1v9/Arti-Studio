import { supabase } from '@/lib/supabase';
import type { GalleryImage } from '@/types/gallery';
import { enrichImagesWithAuthors } from './gallery.service';

// Add to favorites
export const addFavorite = async (userId: string, imageId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('favorites')
            .insert([{ user_id: userId, image_id: imageId }]);

        if (error && error.code !== '23505') { // Ignore duplicate key error
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error adding favorite:', error);
        return false;
    }
};

// Remove from favorites
export const removeFavorite = async (userId: string, imageId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .match({ user_id: userId, image_id: imageId });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        return false;
    }
};

// Check if image is favorited
export const isFavorite = async (userId: string, imageId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .match({ user_id: userId, image_id: imageId })
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            throw error;
        }
        return !!data;
    } catch (error) {
        return false;
    }
};

// Get user's favorite image IDs
export const getFavoriteIds = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('image_id')
            .eq('user_id', userId);

        if (error) throw error;
        return (data || []).map((f) => f.image_id);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
};

// Get user's favorite images with details
export const getUserFavorites = async (userId: string): Promise<GalleryImage[]> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                image:gallery_images (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Extract images from the join structure
        type FavoriteWithImage = { image: unknown };
        const rawImages = (data || [])
            .map((f: FavoriteWithImage) => f.image)
            .filter(Boolean);

        // Enrich with author profiles properly
        return await enrichImagesWithAuthors(rawImages);

    } catch (error) {
        console.error('Error fetching favorite images:', error);
        return [];
    }
};

// Get user's favorites count efficiently
export const getFavoritesCount = async (userId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error fetching favorites count:', error);
        return 0;
    }
};
