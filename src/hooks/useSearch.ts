import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { GalleryImage, Category } from '@/types/gallery';
import { AnalyticsService } from '@/services/analytics.service';
import { useAuth } from '@/components/auth';
import { useGallerySearch } from './useGallery';

// Now accepts optional initial images, but primarily triggers server search
export function useSearch(initialImages: GalleryImage[] = []) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const query = searchParams.get('q') || '';
  const selectedCategory = (searchParams.get('category') as Category) || null;

  // Use the server-side search hook
  const { data: searchResults, isLoading: isSearching } = useGallerySearch(query);

  const setQuery = (newQuery: string) => {
    setSearchParams(prev => {
      if (newQuery) {
        prev.set('q', newQuery);
      } else {
        prev.delete('q');
      }
      return prev;
    }, { replace: true });
  };

  const setSelectedCategory = (category: Category | null) => {
    setSearchParams(prev => {
      if (category) {
        prev.set('category', category);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };

  // Combine results or use initial images if no query
  const filteredImages = useMemo(() => {
    let results = query.trim() ? (searchResults || []) : initialImages;

    // Apply category filter locally on the results (or we could fetch by category too)
    // Server-side search currently only supports text query in useGallerySearch
    if (selectedCategory) {
      results = results.filter(img => img.category === selectedCategory);
    }

    return results;
  }, [searchResults, initialImages, query, selectedCategory]);

  // Debounced Logging
  useDebounce(
    () => {
      if (query.trim()) {
        AnalyticsService.logSearch(query, user?.uid || null, filteredImages.length);
      }
    },
    2000,
    [query, filteredImages.length, user?.uid]
  );

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    filteredImages,
    totalCount: query.trim() ? (searchResults?.length || 0) : initialImages.length,
    filteredCount: filteredImages.length,
    isSearching
  };
}
