/**
 * useCollections Hook
 * Manages collections state and operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth';
import {
    getUserCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addImageToCollection,
    removeImageFromCollection,
    getUserCollectionsList,
    getImageCollections,
    type CollectionPreview
} from '@/services/collections.service';
import { toast } from 'sonner';

interface UseCollectionsOptions {
    autoFetch?: boolean;
    userId?: string; // For viewing other user's collections
}

export function useCollections(options: UseCollectionsOptions = {}) {
    const { autoFetch = true, userId: externalUserId } = options;
    const { user } = useAuth();

    const [collections, setCollections] = useState<CollectionPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use provided userId or current user's
    const targetUserId = externalUserId || user?.uid;
    const isOwner = !!(user?.uid && user.uid === targetUserId);

    // Store stable references to avoid infinite loops
    const targetUserIdRef = useRef(targetUserId);
    const isOwnerRef = useRef(isOwner);

    // Update refs on each render
    targetUserIdRef.current = targetUserId;
    isOwnerRef.current = isOwner;

    // Fetch collections - stable reference
    const fetchCollections = useCallback(async () => {
        const userId = targetUserIdRef.current;
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getUserCollections(userId, isOwnerRef.current);
            setCollections(data);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setError('Failed to load collections');
        } finally {
            setLoading(false);
        }
    }, []); // No dependencies - uses refs

    // Auto-fetch on mount and when userId changes
    useEffect(() => {
        if (autoFetch && targetUserId) {
            fetchCollections();
        }
    }, [autoFetch, targetUserId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Create new collection
    const create = useCallback(async (
        name: string,
        description?: string,
        isPublic: boolean = true
    ) => {
        const uid = user?.uid;
        if (!uid) {
            toast.error('Please sign in to create collections');
            return null;
        }

        try {
            const collection = await createCollection(uid, name, description, isPublic);
            if (collection) {
                toast.success('Collection created!');
                setCollections(prev => [{
                    ...collection,
                    cover_images: []
                }, ...prev]);
                return collection;
            }
            throw new Error('Failed to create collection');
        } catch (err) {
            console.error('Error creating collection:', err);
            toast.error('Failed to create collection');
            return null;
        }
    }, [user?.uid]);

    // Update collection
    const update = useCallback(async (
        collectionId: string,
        updates: { name?: string; description?: string; is_public?: boolean }
    ) => {
        try {
            const success = await updateCollection(collectionId, updates);
            if (success) {
                toast.success('Collection updated!');
                setCollections(prev => prev.map(c =>
                    c.id === collectionId
                        ? { ...c, ...updates, name: updates.name ?? c.name, is_public: updates.is_public ?? c.is_public }
                        : c
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error updating collection:', err);
            toast.error('Failed to update collection');
            return false;
        }
    }, []);

    // Delete collection
    const remove = useCallback(async (collectionId: string) => {
        try {
            const success = await deleteCollection(collectionId);
            if (success) {
                toast.success('Collection deleted');
                setCollections(prev => prev.filter(c => c.id !== collectionId));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting collection:', err);
            toast.error('Failed to delete collection');
            return false;
        }
    }, []);

    // Add image to collection
    const addImage = useCallback(async (collectionId: string, imageId: string) => {
        try {
            const success = await addImageToCollection(collectionId, imageId);
            if (success) {
                toast.success('Added to collection');
                setCollections(prev => prev.map(c =>
                    c.id === collectionId
                        ? { ...c, image_count: c.image_count + 1 }
                        : c
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error adding image:', err);
            toast.error('Failed to add to collection');
            return false;
        }
    }, []);

    // Remove image from collection
    const removeImage = useCallback(async (collectionId: string, imageId: string) => {
        try {
            const success = await removeImageFromCollection(collectionId, imageId);
            if (success) {
                toast.success('Removed from collection');
                setCollections(prev => prev.map(c =>
                    c.id === collectionId
                        ? { ...c, image_count: Math.max(0, c.image_count - 1) }
                        : c
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error removing image:', err);
            toast.error('Failed to remove from collection');
            return false;
        }
    }, []);

    return {
        collections,
        loading,
        error,
        isOwner,
        fetchCollections,
        create,
        update,
        remove,
        addImage,
        removeImage
    };
}

/**
 * Hook for managing collection selection in modals
 */
export function useCollectionPicker(imageId: string) {
    const { user } = useAuth();
    const [collections, setCollections] = useState<{ id: string; name: string; image_count: number }[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch user's collections and which ones contain this image
    const fetchData = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const [allCollections, imageCollections] = await Promise.all([
                getUserCollectionsList(user.uid),
                getImageCollections(user.uid, imageId)
            ]);

            setCollections(allCollections);
            setSelectedIds(new Set(imageCollections.map(c => c.collectionId)));
        } catch (err) {
            console.error('Error fetching collection data:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, imageId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Toggle collection selection
    const toggle = useCallback(async (collectionId: string) => {
        const isSelected = selectedIds.has(collectionId);

        try {
            if (isSelected) {
                const success = await removeImageFromCollection(collectionId, imageId);
                if (success) {
                    setSelectedIds(prev => {
                        const next = new Set(prev);
                        next.delete(collectionId);
                        return next;
                    });
                    toast.success('Removed from collection');
                }
            } else {
                const success = await addImageToCollection(collectionId, imageId);
                if (success) {
                    setSelectedIds(prev => new Set(prev).add(collectionId));
                    toast.success('Added to collection');
                }
            }
        } catch (err) {
            console.error('Error toggling collection:', err);
            toast.error('Failed to update collection');
        }
    }, [imageId, selectedIds]);

    return {
        collections,
        selectedIds,
        loading,
        toggle,
        refresh: fetchData
    };
}
