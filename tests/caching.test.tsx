
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a real QueryClient with our production config
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

// Mock fetch function
const mockFetchData = vi.fn();

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
        {children}
    </QueryClientProvider>
);

// The hook using the query
const useTestQuery = () => {
    return useQuery({
        queryKey: ['test-data'],
        queryFn: mockFetchData,
    });
};

describe('Caching Behavior Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchData.mockResolvedValue('Cached Data');
    });

    it('should NOT refetch data when component re-mounts within 5 minutes', async () => {
        const queryClient = createTestQueryClient();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // 1. First Mount: Should fetch
        const { unmount: unmount1 } = renderHook(() => useTestQuery(), { wrapper });
        await waitFor(() => expect(mockFetchData).toHaveBeenCalledTimes(1));

        // Unmount
        unmount1();

        // 2. Second Mount (Simulate user leaving and coming back): Should NOT fetch
        const { unmount: unmount2 } = renderHook(() => useTestQuery(), { wrapper });

        // Wait a bit to ensure no fetch happens
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockFetchData).toHaveBeenCalledTimes(1); // Call count should still be 1!

        unmount2();
    });

    it('should NOT refetch on window focus based on config', async () => {
        const queryClient = createTestQueryClient();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        renderHook(() => useTestQuery(), { wrapper });
        await waitFor(() => expect(mockFetchData).toHaveBeenCalledTimes(1));

        // Simulate Window Focus Event
        // React Query listens to visibilitychange and focus
        window.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new Event('focus'));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockFetchData).toHaveBeenCalledTimes(1); // Still 1
    });
});
