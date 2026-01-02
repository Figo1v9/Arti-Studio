import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GalleryImageDB } from '@/types/database.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetcher function
async function fetchAdminGalleryImages(limit: number): Promise<{ data: GalleryImageDB[]; count: number }> {
    let query = supabase
        .from('gallery_images')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (limit > 0) {
        query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
        data: data || [],
        count: count || 0
    };
}

export function useGalleryManagement() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [limit, setLimit] = useState<number>(10);

    // 1. Fetching with React Query
    const {
        data: result = { data: [], count: 0 },
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['admin-gallery', limit],
        queryFn: () => fetchAdminGalleryImages(limit),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const images = result.data;
    const totalCount = result.count;

    if (error) {
        toast.error('Failed to fetch images');
    }

    // 2. Mutations
    const toggleFeaturedMutation = useMutation({
        mutationFn: async (image: GalleryImageDB) => {
            const { error } = await supabase
                .from('gallery_images')
                .update({ is_featured: !image.is_featured })
                .eq('id', image.id);
            if (error) throw error;
            return image;
        },
        onSuccess: (originalImage) => {
            queryClient.setQueryData(['admin-gallery', limit], (old: { data: GalleryImageDB[], count: number } | undefined) => {
                if (!old) return { data: [], count: 0 };
                return {
                    ...old,
                    data: old.data.map(img =>
                        img.id === originalImage.id ? { ...img, is_featured: !originalImage.is_featured } : img
                    )
                };
            });
            toast.success(!originalImage.is_featured ? 'Added to featured' : 'Removed from featured');
        },
        onError: () => {
            toast.error('Failed to update featured status');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Image deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
        },
        onError: () => {
            toast.error('Failed to delete image');
        }
    });

    // 3. Handlers
    const handleToggleFeatured = (image: GalleryImageDB) => {
        toggleFeaturedMutation.mutate(image);
    };

    const deleteImage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        deleteMutation.mutate(id);
    };

    // 4. Filtering
    const filteredImages = useMemo(() => {
        if (!images) return [];
        return images.filter((img) => {
            const matchesSearch =
                img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [images, searchQuery, categoryFilter]);

    return {
        images,
        totalCount,
        loading,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        filteredImages,
        fetchImages: () => queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }),
        handleToggleFeatured,
        deleteImage,
        limit,
        setLimit
    };
}
