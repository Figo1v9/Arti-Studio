
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CategoryDB } from '@/types/database.types';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetcher
async function fetchCategories(): Promise<CategoryDB[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export function useCategoriesManagement() {
    const queryClient = useQueryClient();

    // 1. Fetching
    const { data: categories = [], isLoading: loading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: fetchCategories,
        staleTime: Infinity, // Categories rarely change
    });

    const sortMutation = useMutation({
        mutationFn: async (items: CategoryDB[]) => {
            const { error } = await supabase.from('categories').upsert(items);
            if (error) throw error;
        },
        onMutate: async (newItems) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['admin-categories'] });

            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(['admin-categories']);

            // Optimistically update
            queryClient.setQueryData(['admin-categories'], newItems);

            return { previousCategories };
        },
        onError: (err, newItems, context) => {
            console.error('Sort failed:', err);
            toast.error('Failed to update order');
            // Rollback
            if (context?.previousCategories) {
                queryClient.setQueryData(['admin-categories'], context.previousCategories);
            }
        },
        onSettled: () => {
            // Optional: Refetch to ensure sync
            // queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }
    });

    // 3. Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Category deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: () => {
            toast.error('Failed to delete category');
        }
    });

    // 4. Handlers
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = categories.findIndex((item) => item.id === active.id);
            const newIndex = categories.findIndex((item) => item.id === over!.id);

            const newItems = arrayMove(categories, oldIndex, newIndex).map((item, index) => ({
                ...item,
                sort_order: index
            }));

            // Trigger optimistic update
            sortMutation.mutate(newItems);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        deleteMutation.mutate(id);
    };

    return {
        categories,
        loading,
        fetchCategories: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
        handleDragEnd,
        deleteCategory
    };
}
