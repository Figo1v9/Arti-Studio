import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoryDB } from '@/types/database.types';

/**
 * GLOBAL CATEGORIES CACHE
 * 
 * Problem: Every component using useCategories = 1 DB fetch
 * Solution: Cache categories globally since they rarely change
 * 
 * Result: Instead of N fetches per page, just 1 fetch per 10 minutes
 */
interface CategoriesCache {
    data: CategoryDB[];
    timestamp: number;
    loading: boolean;
    promise: Promise<CategoryDB[]> | null;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache: CategoriesCache = {
    data: [],
    timestamp: 0,
    loading: false,
    promise: null
};

// Listeners for cache updates
const listeners = new Set<(categories: CategoryDB[]) => void>();

const notifyListeners = (categories: CategoryDB[]) => {
    listeners.forEach(listener => listener(categories));
};

// Fetch categories with cache
const fetchCategoriesFromDB = async (): Promise<CategoryDB[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return cache.data; // Return stale data on error
    }

    return data || [];
};

// Get categories (cached or fresh)
const getCategories = async (): Promise<CategoryDB[]> => {
    const now = Date.now();

    // Return cached if still valid
    if (cache.data.length > 0 && now - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }

    // If already loading, wait for that promise
    if (cache.promise) {
        return cache.promise;
    }

    // Fetch fresh data
    cache.promise = fetchCategoriesFromDB();
    cache.loading = true;

    try {
        const data = await cache.promise;
        cache.data = data;
        cache.timestamp = now;
        notifyListeners(data);
        return data;
    } finally {
        cache.loading = false;
        cache.promise = null;
    }
};

// Invalidate cache (called on realtime events)
const invalidateCache = () => {
    cache.timestamp = 0;
    getCategories(); // Trigger refetch
};

// Setup realtime subscription ONCE (singleton)
let realtimeSetup = false;
const setupRealtime = () => {
    if (realtimeSetup) return;
    realtimeSetup = true;

    supabase
        .channel('global-categories-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'categories' }, invalidateCache)
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'categories' }, invalidateCache)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'categories' }, invalidateCache)
        .subscribe();
};

if (typeof window !== 'undefined') {
    setupRealtime();
}

/**
 * useCategories Hook - Uses global cache
 */
export function useCategories() {
    const [categories, setCategories] = useState<CategoryDB[]>(cache.data);
    const [loading, setLoading] = useState(cache.data.length === 0);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Add listener
        const listener = (cats: CategoryDB[]) => {
            setCategories(cats);
            setLoading(false);
        };
        listeners.add(listener);

        // Initial load
        if (cache.data.length === 0) {
            getCategories()
                .then(data => {
                    setCategories(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setLoading(false);
                });
        } else {
            setCategories(cache.data);
            setLoading(false);
        }

        return () => {
            listeners.delete(listener);
        };
    }, []);

    const refetch = () => {
        invalidateCache();
    };

    return { categories, loading, error, refetch };
}
