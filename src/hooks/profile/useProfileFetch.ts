import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/components/profile/types';
import { useAuth } from '@/components/auth';

export const useProfileFetch = () => {
    const params = useParams<{ username: string }>();
    const { user: currentUser, profile: currentUserProfile } = useAuth();

    const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Determines if the current logged-in user is the owner of the viewed profile
    const isOwner = currentUser && viewedProfile && currentUser.uid === viewedProfile.id;

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoadingProfile(true);
            setProfileError(null);

            try {
                let profile: UserProfile | null = null;

                if (!params.username) {
                    // Scenario A: /profile (Own profile)
                    if (!currentUser || !currentUserProfile) {
                        setIsLoadingProfile(false);
                        return;
                    }
                    profile = currentUserProfile as UserProfile;
                } else {
                    // Scenario B: /:username (Other's profile)
                    const usernameStr = params.username;
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usernameStr);

                    let query = supabase.from('profiles').select('*');
                    if (isUUID) {
                        query = query.eq('id', usernameStr);
                    } else {
                        query = query.eq('username', usernameStr);
                    }

                    const { data, error } = await query.single();
                    if (error || !data) {
                        setProfileError('User not found');
                        setIsLoadingProfile(false);
                        return;
                    }
                    profile = data as UserProfile;
                }

                // Privacy Check
                if (!profile.is_public && (!currentUser || currentUser.uid !== profile.id)) {
                    setProfileError('This profile is private');
                    setIsLoadingProfile(false);
                    return;
                }

                setViewedProfile(profile);

            } catch (err) {
                console.error("Error fetching profile:", err);
                setProfileError("Failed to load profile");
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfileData();
    }, [params.username, currentUser?.uid, currentUserProfile?.id]);

    return {
        viewedProfile,
        setViewedProfile,
        isLoadingProfile,
        profileError,
        isOwner,
        currentUser
    };
};
