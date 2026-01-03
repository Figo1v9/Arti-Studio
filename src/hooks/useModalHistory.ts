import { useEffect, useCallback, useRef } from 'react';

/**
 * Modal History State Interface
 * Used to identify modal state in browser history
 */
interface ModalHistoryState {
    modal: true;
    modalId: string;
    timestamp: number;
}

/**
 * useModalHistory - Enterprise-grade hook for managing modal state with browser history
 * 
 * This hook solves the common UX problem where pressing the browser's back button
 * navigates away from the page instead of closing the modal.
 * 
 * How it works:
 * 1. When opening a modal, we push a new entry to browser history with a special state
 * 2. We listen for the 'popstate' event (triggered by back/forward buttons)
 * 3. When popstate fires and we detect our modal state was popped, we close the modal
 * 
 * @param isOpen - Current modal open state
 * @param onClose - Callback to close the modal
 * @param modalId - Optional unique identifier for the modal (useful for debugging)
 * 
 * @returns Object with openWithHistory function to open modal with history state
 * 
 * @example
 * ```tsx
 * const { openWithHistory } = useModalHistory(
 *   selectedImage !== null,
 *   () => setSelectedImage(null),
 *   'image-modal'
 * );
 * 
 * const handleImageClick = (image: GalleryImage) => {
 *   setSelectedImage(image);
 *   openWithHistory(image.id);
 * };
 * ```
 */
export function useModalHistory(
    isOpen: boolean,
    onClose: () => void,
    modalId: string = 'modal'
) {
    // Track if we pushed state for this modal instance
    const hasPushedState = useRef(false);
    // Track the timestamp of our pushed state to match it on popstate
    const pushedStateTimestamp = useRef<number | null>(null);

    /**
     * Push a new history entry when opening the modal
     * This allows the back button to "undo" opening the modal
     */
    const openWithHistory = useCallback((itemId?: string) => {
        // Avoid pushing duplicate states
        if (hasPushedState.current) return;

        const timestamp = Date.now();
        const state: ModalHistoryState = {
            modal: true,
            modalId: itemId ? `${modalId}-${itemId}` : modalId,
            timestamp
        };

        // Push new state without changing URL
        window.history.pushState(state, '');
        hasPushedState.current = true;
        pushedStateTimestamp.current = timestamp;
    }, [modalId]);

    /**
     * Handle browser back/forward navigation
     */
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // Check if we have our modal state and it's currently open
            if (hasPushedState.current && isOpen) {
                // We don't have our modal state anymore = user pressed back
                // Check current state - if it's not our modal state, close the modal
                const currentState = event.state as ModalHistoryState | null;

                // If current state doesn't have our modal marker, or has different timestamp
                // it means user navigated away from our modal state
                if (!currentState?.modal || currentState.timestamp !== pushedStateTimestamp.current) {
                    hasPushedState.current = false;
                    pushedStateTimestamp.current = null;
                    onClose();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, onClose]);

    /**
     * Cleanup when modal is closed programmatically (not via back button)
     * We need to remove the history entry we added
     */
    useEffect(() => {
        if (!isOpen && hasPushedState.current) {
            // Modal was closed but we still have a history entry
            // Go back to remove it (this won't trigger our popstate handler because isOpen is already false)
            window.history.back();
            hasPushedState.current = false;
            pushedStateTimestamp.current = null;
        }
    }, [isOpen]);

    /**
     * Cleanup on unmount - ensure we don't leave orphaned history entries
     */
    useEffect(() => {
        return () => {
            if (hasPushedState.current) {
                window.history.back();
                hasPushedState.current = false;
                pushedStateTimestamp.current = null;
            }
        };
    }, []);

    return { openWithHistory };
}

/**
 * Check if a history state is a modal state
 */
export function isModalHistoryState(state: unknown): state is ModalHistoryState {
    return (
        typeof state === 'object' &&
        state !== null &&
        'modal' in state &&
        (state as ModalHistoryState).modal === true
    );
}
