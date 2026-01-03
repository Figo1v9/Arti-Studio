import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/auth';
import { useFavorites } from '@/hooks/useFavorites';
import { useSimilarImages } from '@/hooks/useGallery';
import type { GalleryImage } from '@/types/gallery';
import {
    useProfileFetch,
    useProfileStats,
    useProfileActions,
    useProfileCreations
} from './profile';
import { useModalHistory } from '@/hooks/useModalHistory';

export const useProfileLogic = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loading: authLoading, updateProfile, signOut } = useAuth();
    const { favorites, isLoading: favoritesLoading } = useFavorites();

    const [activeTab, setActiveTab] = useState<'overview' | 'creations' | 'favorites' | 'settings'>('creations');

    // 1. Fetch Profile
    const {
        viewedProfile,
        setViewedProfile,
        isLoadingProfile,
        profileError,
        isOwner,
        currentUser
    } = useProfileFetch();

    // 2. Stats
    const {
        followersCount,
        setFollowersCount,
        followingCount,
        isFollowing,
        setIsFollowing,
    } = useProfileStats(viewedProfile?.id, currentUser?.uid);

    // 3. Actions (Edit, Follow, Avatar)
    const {
        editName, setEditName,
        editUsername, setEditUsername,
        editBio, setEditBio,
        isEditing, setIsEditing,
        isSaving,
        initEditFields,
        isUploadingAvatar,
        fileInputRef,
        isLoadingFollow,
        copiedLink,
        handleFollowToggle,
        handleAvatarClick,
        handleAvatarUpload,
        handleSaveProfile,
        handleCopyProfileLink
    } = useProfileActions({ viewedProfile, setViewedProfile, currentUserId: currentUser?.uid });

    // 4. Creations
    const {
        userCreations,
        loadingCreations,
        isUploadModalOpen,
        setIsUploadModalOpen,
        fetchUserCreations
    } = useProfileCreations(viewedProfile);


    // 5. Deep Linking & Image Selection
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const deepLinkImageId = searchParams.get('imageId');
    const { data: similarImages = [] } = useSimilarImages(selectedImage);

    // Modal history for back button support
    const { openWithHistory } = useModalHistory(
        selectedImage !== null,
        () => setSelectedImage(null),
        'profile-modal'
    );

    // Deep Linking Effect
    useEffect(() => {
        if (deepLinkImageId) {
            if (userCreations.length > 0) {
                const img = userCreations.find(i => i.id === deepLinkImageId);
                if (img && img.id !== selectedImage?.id) {
                    setSelectedImage(img);
                    return;
                }
            }
            if (favorites.length > 0) {
                const img = favorites.find(i => i.id === deepLinkImageId);
                if (img && img.id !== selectedImage?.id) {
                    setSelectedImage(img);
                }
            }
        } else {
            if (selectedImage) setSelectedImage(null);
        }
    }, [deepLinkImageId, userCreations, favorites]);

    // Handlers
    const onImageSelect = React.useCallback((image: GalleryImage | null) => {
        setSelectedImage(image);
        if (image) {
            openWithHistory(image.id);
        }
        const params = new URLSearchParams(searchParams);
        if (image) {
            params.set('imageId', image.id);
        } else {
            params.delete('imageId');
        }
        navigate({ search: params.toString() }, { replace: true });
    }, [navigate, searchParams, openWithHistory]);

    const onEditStart = () => {
        initEditFields();
        setIsEditing(true);
    };

    const onSignOut = React.useCallback(async () => {
        await signOut();
        navigate('/explore');
    }, [signOut, navigate]);

    // Wrap handleFollowToggle to match expected signature if needed or pass directly
    const onFollowToggle = () => handleFollowToggle(!!isFollowing, setFollowersCount, setIsFollowing);
    const onAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleAvatarUpload(e, !!isOwner);
    const onSaveProfile = () => handleSaveProfile(!!isOwner);
    const onAvatarClick = () => handleAvatarClick(!!isOwner);

    return {
        // Data
        currentUser,
        viewedProfile,
        isOwner,
        activeTab,
        authLoading,
        isLoadingProfile,
        profileError,
        userCreations,
        loadingCreations,
        favorites,
        favoritesLoading,
        followersCount,
        followingCount,
        isFollowing,
        isLoadingFollow,
        selectedImage,
        similarImages,

        // UI State
        isEditing,
        isSaving,
        editName,
        editUsername,
        editBio,
        isUploadModalOpen,
        isUploadingAvatar,
        fileInputRef,
        copiedLink,

        // Setters
        setActiveTab,
        setEditName,
        setEditUsername,
        setEditBio,
        setIsEditing, // Raw setter for closing from dialog
        openEditModal: onEditStart, // Trigger init on open
        setIsUploadModalOpen,
        setViewedProfile,

        // Handlers
        handleImageSelect: onImageSelect,
        handleFollowToggle: onFollowToggle,
        handleAvatarClick: onAvatarClick,
        handleAvatarUpload: onAvatarUpload,
        handleSaveProfile: onSaveProfile,
        handleCopyProfileLink,
        handleSignOut: onSignOut,
        fetchUserCreations,
        updateProfile
    };
};
