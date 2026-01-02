import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GalleryImage } from '@/types/gallery';
import { transformImage } from '@/services/gallery.service';
import type { UserProfile } from '@/components/profile/types';

export const useProfileCreations = (viewedProfile: UserProfile | null) => {
    const [userCreations, setUserCreations] = useState<GalleryImage[]>([]);
    const [loadingCreations, setLoadingCreations] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchUserCreations = useCallback(async (userId: string) => {
        setLoadingCreations(true);
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserCreations((data || []).map(img => {
                const transformed = transformImage(img);
                return {
                    ...transformed,
                    author: viewedProfile?.full_name || viewedProfile?.username || 'User',
                    authorId: viewedProfile?.id,
                    authorUsername: viewedProfile?.username,
                    authorAvatar: viewedProfile?.avatar_url
                };
            }));
        } catch (error) {
            console.error('Error fetching creations:', error);
        } finally {
            setLoadingCreations(false);
        }
    }, [viewedProfile?.full_name, viewedProfile?.username, viewedProfile?.id, viewedProfile?.avatar_url]);

    useEffect(() => {
        if (viewedProfile) {
            fetchUserCreations(viewedProfile.id);
        }
    }, [viewedProfile?.id, fetchUserCreations]);

    return {
        userCreations,
        loadingCreations,
        isUploadModalOpen,
        setIsUploadModalOpen,
        fetchUserCreations
    };
};
