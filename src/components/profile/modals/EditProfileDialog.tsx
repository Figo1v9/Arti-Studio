import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { EditProfileDesktop } from './EditProfileDesktop';
import { EditProfileMobile } from './EditProfileMobile';

interface EditProfileDialogProps {
    editName: string;
    setEditName: (v: string) => void;
    editUsername: string;
    setEditUsername: (v: string) => void;
    editBio: string;
    setEditBio: (v: string) => void;
    setIsEditing: (v: boolean) => void;
    isSaving: boolean;
    handleSaveProfile: () => void;
}

// Custom hook for responsive detection using matchMedia
// This is more performant than resize event listeners
const useIsMobile = (breakpoint: number = 768): boolean => {
    const [isMobile, setIsMobile] = useState(() => {
        // Initial value based on current window width
        if (typeof window !== 'undefined') {
            return window.innerWidth < breakpoint;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Create media query
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        // Handler for media query changes
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };

        // Set initial value
        handleChange(mediaQuery);

        // Modern browsers support addEventListener
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [breakpoint]);

    return isMobile;
};

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
    editName,
    setEditName,
    editUsername,
    setEditUsername,
    editBio,
    setEditBio,
    setIsEditing,
    isSaving,
    handleSaveProfile
}) => {
    const isMobile = useIsMobile(768);

    // Memoized close handler to prevent unnecessary re-renders
    const handleClose = useCallback(() => {
        setIsEditing(false);
    }, [setIsEditing]);

    // Common props for both components
    const commonProps = useMemo(() => ({
        isOpen: true,
        editName,
        setEditName,
        editUsername,
        setEditUsername,
        editBio,
        setEditBio,
        onClose: handleClose,
        isSaving,
        handleSaveProfile
    }), [
        editName,
        setEditName,
        editUsername,
        setEditUsername,
        editBio,
        setEditBio,
        handleClose,
        isSaving,
        handleSaveProfile
    ]);

    // Render appropriate component based on device
    // Using conditional rendering instead of CSS display to prevent
    // mounting both components and improve performance
    if (isMobile) {
        return <EditProfileMobile {...commonProps} />;
    }

    return <EditProfileDesktop {...commonProps} />;
};
