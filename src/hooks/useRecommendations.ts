import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { GalleryImage } from '@/types/gallery';
import {
    getRecommendations,
    getTrendingImages,
    trackInteraction,
    analyzePreferences
} from '@/services/recommendations.service';

/**
 * Hook to get personalized recommendations based on user behavior
 */
/**
 * Hook to get personalized recommendations based on user behavior
 */
export function useRecommendations(limit = 12) {
    return useQuery({
        queryKey: ['recommendations'],
        // No longer depends on allImages, fetches from server
        queryFn: () => getRecommendations(limit),
        staleTime: 1000 * 60 * 15, // 15 minutes (less frequent updates needed for recommendations)
    });
}

/**
 * Hook to get trending images
 */
export function useTrending(limit = 8) {
    return useQuery({
        queryKey: ['trending'],
        queryFn: () => getTrendingImages(limit),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to get user preferences
 */
export function useUserPreferences() {
    return useMemo(() => {
        return analyzePreferences();
    }, []);
}

/**
 * Track user interaction with an image
 */
export function useTrackInteraction() {
    return {
        trackView: (image: GalleryImage) => trackInteraction(image, 'view'),
        trackCopy: (image: GalleryImage) => trackInteraction(image, 'copy'),
        trackLike: (image: GalleryImage) => trackInteraction(image, 'like'),
    };
}

/**
 * Mix recommendations into the main feed (Pinterest-style)
 * Every 8 images, insert 2-3 personalized recommendations
 * STABILIZED: Only inject recommendations once per session to prevent re-ordering flicker
 */
export function useMixedFeed(
    mainImages: GalleryImage[],
    recommendations: GalleryImage[]
): GalleryImage[] {
    // Use a ref to track which recommendations have been injected (stable across renders)
    const injectedRef = useRef<Set<string>>(new Set());

    return useMemo(() => {
        // Don't mix if no recommendations or no main images
        if (!recommendations.length || !mainImages.length) return mainImages;

        const result: GalleryImage[] = [];
        const mainImageIds = new Set(mainImages.map(img => img.id));
        let recIndex = 0;

        mainImages.forEach((img, index) => {
            result.push(img);

            // Every 8 images, try to insert 1-2 recommendations
            if ((index + 1) % 8 === 0 && recIndex < recommendations.length) {
                // Add up to 2 recommendations that aren't already in the feed
                for (let i = 0; i < 2 && recIndex < recommendations.length; i++) {
                    const rec = recommendations[recIndex];
                    // Only add if not already in main feed and not already injected
                    if (!mainImageIds.has(rec.id) && !injectedRef.current.has(rec.id)) {
                        result.push(rec);
                        injectedRef.current.add(rec.id);
                    }
                    recIndex++;
                }
            }
        });

        return result;
    }, [mainImages, recommendations]);
}

/**
 * Get "For You" section images - top personalized picks
 */
// Get "For You" section images - top personalized picks
export function useForYouSection(limit = 6) {
    return useQuery({
        queryKey: ['for-you'],
        queryFn: () => getRecommendations(limit),
        staleTime: 1000 * 60 * 15,
    });
}
