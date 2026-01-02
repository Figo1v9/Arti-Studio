import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth';
import {
    addFavorite,
    removeFavorite,
    getFavoriteIds,
    getUserFavorites
} from '@/services/favorites.service';
import { toast } from 'sonner';

export function useFavorites() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Use Firebase uid
    const userId = user?.uid;

    // Get favorite IDs
    const { data: favoriteIds = [] } = useQuery({
        queryKey: ['favoriteIds', userId],
        queryFn: () => (userId ? getFavoriteIds(userId) : []),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes - reduces refetches significantly
    });

    // Get favorite images
    const { data: favorites = [], isLoading } = useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => (userId ? getUserFavorites(userId) : []),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes - reduces refetches significantly
    });

    // Add favorite mutation
    const addMutation = useMutation({
        mutationFn: (imageId: string) => addFavorite(userId!, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success('Added to favorites');
        },
        onError: () => {
            toast.error('Failed to add to favorites');
        },
    });

    // Remove favorite mutation
    const removeMutation = useMutation({
        mutationFn: (imageId: string) => removeFavorite(userId!, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success('Removed from favorites');
        },
        onError: () => {
            toast.error('Failed to remove from favorites');
        },
    });

    const toggleFavorite = (imageId: string) => {
        if (!userId) {
            toast.info('Please sign in to save favorites');
            return;
        }

        if (favoriteIds.includes(imageId)) {
            removeMutation.mutate(imageId);
        } else {
            addMutation.mutate(imageId);
        }
    };


    const isFavorited = (imageId: string) => favoriteIds.includes(imageId);

    return {
        favorites,
        favoriteIds,
        isLoading,
        toggleFavorite,
        isFavorited,
        addFavorite: addMutation.mutate,
        removeFavorite: removeMutation.mutate,
    };
}

/**
 * Optimized hook for checking if a specific image is favorited.
 * Uses 'select' to prevent re-renders when the list changes but this specific item's status doesn't.
 */
export function useIsFavorite(imageId: string) {
    const { user } = useAuth();
    const userId = user?.uid;
    const queryClient = useQueryClient();

    const { data: isSaved = false } = useQuery({
        queryKey: ['favoriteIds', userId],
        queryFn: () => (userId ? getFavoriteIds(userId) : []),
        enabled: !!userId,
        select: (ids) => ids.includes(imageId),
        staleTime: 1000 * 60 * 5, // 5 minutes (matches useFavorites logic if we added it there)
    });

    const addMutation = useMutation({
        mutationFn: () => addFavorite(userId!, imageId),
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['favoriteIds', userId] });
            // Snapshot previous value
            const previousIds = queryClient.getQueryData<string[]>(['favoriteIds', userId]);
            // Optimistically update
            queryClient.setQueryData<string[]>(['favoriteIds', userId], (old) => [...(old || []), imageId]);
            return { previousIds };
        },
        onError: (_err, _vars, context) => {
            // Rollback on error
            if (context?.previousIds) {
                queryClient.setQueryData(['favoriteIds', userId], context.previousIds);
            }
            toast.error('Failed to add to favorites');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
        onSuccess: () => {
            toast.success('Added to favorites');
        },
    });

    const removeMutation = useMutation({
        mutationFn: () => removeFavorite(userId!, imageId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['favoriteIds', userId] });
            const previousIds = queryClient.getQueryData<string[]>(['favoriteIds', userId]);
            queryClient.setQueryData<string[]>(['favoriteIds', userId], (old) => (old || []).filter(id => id !== imageId));
            return { previousIds };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousIds) {
                queryClient.setQueryData(['favoriteIds', userId], context.previousIds);
            }
            toast.error('Failed to remove from favorites');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
        onSuccess: () => {
            toast.success('Removed from favorites');
        },
    });

    const toggleFavorite = () => {
        if (!userId) {
            toast.info('Please sign in to save favorites');
            return;
        }
        if (isSaved) {
            removeMutation.mutate();
        } else {
            addMutation.mutate();
        }
    };

    return { isSaved, toggleFavorite };
}

