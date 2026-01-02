
import { renderSlot } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollections } from '../src/hooks/useCollections';
import { useAuth } from '../src/components/auth';
import * as collectionsService from '../src/services/collections.service';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../src/components/auth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../src/services/collections.service', () => ({
    getUserCollections: vi.fn(),
    createCollection: vi.fn(),
    updateCollection: vi.fn(),
    deleteCollection: vi.fn(),
    addImageToCollection: vi.fn(),
    removeImageFromCollection: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useCollections Hook', () => {
    const mockUser = { uid: 'user-123' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
    });

    describe('Fetching Collections', () => {
        it('should fetch collections on mount', async () => {
            const mockCollections = [{ id: '1', name: 'Test' }];
            (collectionsService.getUserCollections as any).mockResolvedValue(mockCollections);

            const { result } = renderHook(() => useCollections());

            expect(result.current.loading).toBe(true);

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.collections).toEqual(mockCollections);
            expect(collectionsService.getUserCollections).toHaveBeenCalledWith('user-123', true);
        });

        it('should handle fetch errors', async () => {
            (collectionsService.getUserCollections as any).mockRejectedValue(new Error('Fetch failed'));

            const { result } = renderHook(() => useCollections());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to load collections');
        });
    });

    describe('Creating Collections', () => {
        it('should create a collection successfully', async () => {
            const newCollection = { id: 'new-1', name: 'New Collection', cover_images: [] };
            (collectionsService.createCollection as any).mockResolvedValue(newCollection);

            const { result } = renderHook(() => useCollections({ autoFetch: false }));

            let created;
            await act(async () => {
                created = await result.current.create('New Collection');
            });

            expect(created).toEqual(newCollection);
            expect(collectionsService.createCollection).toHaveBeenCalledWith('user-123', 'New Collection', undefined, true);
            expect(toast.success).toHaveBeenCalledWith('Collection created!');
            expect(result.current.collections).toContainEqual(expect.objectContaining({ id: 'new-1' }));
        });
    });

    describe('Updating Collections', () => {
        it('should update a collection successfully', async () => {
            const initialCollection = { id: '1', name: 'Old Name' };
            (collectionsService.getUserCollections as any).mockResolvedValue([initialCollection]);
            (collectionsService.updateCollection as any).mockResolvedValue(true);

            const { result } = renderHook(() => useCollections());

            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.update('1', { name: 'New Name' });
            });

            expect(collectionsService.updateCollection).toHaveBeenCalledWith('1', { name: 'New Name' });
            expect(toast.success).toHaveBeenCalledWith('Collection updated!');
            expect(result.current.collections[0].name).toBe('New Name');
        });
    });

    describe('Deleting Collections', () => {
        it('should delete a collection successfully', async () => {
            const initialCollection = { id: '1', name: 'To Delete' };
            (collectionsService.getUserCollections as any).mockResolvedValue([initialCollection]);
            (collectionsService.deleteCollection as any).mockResolvedValue(true);

            const { result } = renderHook(() => useCollections());

            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.remove('1');
            });

            expect(collectionsService.deleteCollection).toHaveBeenCalledWith('1');
            expect(toast.success).toHaveBeenCalledWith('Collection deleted');
            expect(result.current.collections).toHaveLength(0);
        });
    });
});
