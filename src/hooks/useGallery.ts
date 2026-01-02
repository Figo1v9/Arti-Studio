import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
    fetchGalleryImages,
    fetchGalleryImagesInfinite,
    fetchImageById,
    incrementViews,
    incrementCopies,
    getSimilarImages,
    searchImages
} from '@/services/gallery.service';
import type { GalleryImage } from '@/types/gallery';

export function useGallery(enabled: boolean = true) {
    const queryClient = useQueryClient();

    // OPTIMIZATION: Removed global 'INSERT'/'DELETE' listener to prevent connection spam
    // The gallery will refresh naturally via query invalidation on specific user actions
    // or when the user manually refreshes / uses pull-to-refresh.

    return useQuery({
        queryKey: ['gallery'],
        queryFn: () => fetchGalleryImages(50), // Limit to 50 items
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled, // Only fetch when enabled
    });
}

export function useInfiniteGallery(category: string | null = null, userId: string | null = null, query: string = '') {
    return useInfiniteQuery({
        queryKey: ['gallery-infinite', category, userId, query],
        queryFn: ({ pageParam = 0 }) => fetchGalleryImagesInfinite({ pageParam, category, limit: 30, userId, query }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than limit (30), we reached the end
            return lastPage.length === 30 ? allPages.length : undefined;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useSimilarImages(image: GalleryImage | null) {
    return useQuery({
        queryKey: ['similar', image?.id],
        queryFn: () => image ? getSimilarImages(image.id, image.category, image.tags) : [],
        enabled: !!image,
        staleTime: 1000 * 60 * 5,
    });
}

export function useTrackView() {
    return useMutation({
        mutationFn: incrementViews,
    });
}

export function useTrackCopy() {
    return useMutation({
        mutationFn: incrementCopies,
    });
}

export function useGallerySearch(query: string) {
    return useQuery({
        queryKey: ['gallery-search', query],
        queryFn: () => searchImages(query),
        enabled: query.trim().length > 0,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
}

export function useImage(imageId: string | null) {
    return useQuery({
        queryKey: ['gallery-image', imageId],
        queryFn: () => imageId ? fetchImageById(imageId) : Promise.resolve(null),
        enabled: !!imageId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
