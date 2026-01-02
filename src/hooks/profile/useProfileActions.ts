import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, updateOwnProfile } from '@/lib/supabase';
import { useAuth } from '@/components/auth';
import type { UserProfile } from '@/components/profile/types';
import { SemanticSearchService } from '@/services/semantic-search.service';

interface UseProfileActionsProps {
    viewedProfile: UserProfile | null;
    setViewedProfile: (profile: UserProfile | null) => void;
    currentUserId: string | undefined;
}

export const useProfileActions = ({ viewedProfile, setViewedProfile, currentUserId }: UseProfileActionsProps) => {
    const navigate = useNavigate();
    const { updateProfile } = useAuth();

    // Edit Profile State
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Avatar State
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Copy Link State
    const [copiedLink, setCopiedLink] = useState(false);

    // Follow Toggle
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    // Initialize edit fields
    const initEditFields = useCallback(() => {
        if (viewedProfile) {
            setEditName(viewedProfile.full_name || '');
            setEditUsername(viewedProfile.username || '');
            setEditBio(viewedProfile.bio || '');
        }
    }, [viewedProfile]);

    const handleFollowToggle = useCallback(async (isFollowing: boolean, setFollowersCount: React.Dispatch<React.SetStateAction<number>>, setIsFollowing: React.Dispatch<React.SetStateAction<boolean | null>>) => {
        if (!currentUserId || !viewedProfile) {
            toast.error('Please sign in to follow');
            return;
        }
        setIsLoadingFollow(true);
        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUserId)
                    .eq('following_id', viewedProfile.id);
                if (error) throw error;
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
                toast.success(`Unfollowed ${viewedProfile.username || 'user'}`);
            } else {
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentUserId,
                        following_id: viewedProfile.id
                    });
                if (error) throw error;
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
                toast.success(`Following ${viewedProfile.username || 'user'}`);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error('Failed to update follow status');
        } finally {
            setIsLoadingFollow(false);
        }
    }, [currentUserId, viewedProfile]);

    const handleAvatarClick = useCallback((isOwner: boolean) => {
        if (!isOwner) return;
        fileInputRef.current?.click();
    }, []);

    const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, isOwner: boolean) => {
        const file = event.target.files?.[0];
        if (!file || !currentUserId || !isOwner) return;

        setIsUploadingAvatar(true);
        try {
            const { uploadImage } = await import('@/services/upload.service');
            const publicUrl = await uploadImage(file);

            if (publicUrl) {
                const result = await updateOwnProfile({ avatar_url: publicUrl });

                if (!result.success) throw new Error(result.error);
                await updateProfile?.({ avatar_url: publicUrl });
                setViewedProfile(viewedProfile ? ({ ...viewedProfile, avatar_url: publicUrl }) : null);
                toast.success('Profile picture updated');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to update profile picture');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [currentUserId, viewedProfile, updateProfile, setViewedProfile]);

    const handleSaveProfile = useCallback(async (isOwner: boolean) => {
        if (!isOwner || !viewedProfile) return;
        if (!editName.trim()) {
            toast.error('Name is required');
            return;
        }

        const usernameToSave = editUsername.trim() || viewedProfile.username;
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (!usernameRegex.test(usernameToSave)) {
            toast.error('Username can only contain letters, numbers, underscores and dashes');
            return;
        }

        setIsSaving(true);
        try {
            if (usernameToSave !== viewedProfile.username) {
                const { data } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', usernameToSave)
                    .single();
                if (data) {
                    toast.error('Username already taken');
                    setIsSaving(false);
                    return;
                }
            }



            await updateProfile?.({
                full_name: editName,
                username: usernameToSave,
                bio: editBio
            });

            // Generate AI Embedding for Creator Discovery
            let embedding: number[] | null = null;
            try {
                // Rich text for creator profile
                const profileText = `Creator ${editName} (@${usernameToSave}). Bio: ${editBio}`;
                embedding = await SemanticSearchService.generateEmbedding(profileText);

                if (embedding) {
                    // We update the embedding in Supabase using the same updateOwnProfile function
                    // The RPC function inside updateOwnProfile handles general JSON updates
                    await updateOwnProfile({ embedding });
                }
            } catch (e) {
                console.warn('Failed to update profile embedding:', e);
            }

            setViewedProfile(viewedProfile ? ({
                ...viewedProfile,
                full_name: editName,
                username: usernameToSave,
                bio: editBio
            }) : null);

            toast.success('Changes saved');
            setIsEditing(false);

            // Should we update URL?
            // If current URL is /:username, we might want to navigate
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    }, [viewedProfile, editName, editUsername, editBio, updateProfile, setViewedProfile]);

    const handleCopyProfileLink = useCallback(() => {
        const username = viewedProfile?.username || viewedProfile?.id;
        if (!username) return;
        const link = `${window.location.origin}/${username}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        toast.success('Profile link copied!');
        setTimeout(() => setCopiedLink(false), 2000);
    }, [viewedProfile]);

    return {
        // Edit State
        editName, setEditName,
        editUsername, setEditUsername,
        editBio, setEditBio,
        isEditing, setIsEditing,
        isSaving,
        initEditFields,

        // Avatar
        isUploadingAvatar,
        fileInputRef,

        // Follow
        isLoadingFollow,

        // Link
        copiedLink,

        // Handlers
        handleFollowToggle,
        handleAvatarClick,
        handleAvatarUpload,
        handleSaveProfile,
        handleCopyProfileLink
    };
};
