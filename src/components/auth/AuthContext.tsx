import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthChange, signOut as firebaseSignOut } from '@/lib/firebase';
import { supabase, setSupabaseAuthHeader, updateOwnProfile } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    isEmailVerified: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch or create profile in Supabase using Firebase UID
    const fetchOrCreateProfile = useCallback(async (firebaseUser: User) => {
        try {
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', firebaseUser.uid)
                .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

            if (existingProfile) {
                // If profile exists but name is different in Firebase (e.g. just signed up with name), update it?
                // OR just return existing. Let's return existing for now to be safe.
                return existingProfile;
            }

            // If no profile found (null data), create one
            if (!existingProfile && !fetchError) {
                // Generate a random username: arti-user.Ro5f2f5e
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let randomSuffix = '';
                for (let i = 0; i < 8; i++) {
                    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                const defaultUsername = `arti-user${randomSuffix}`;

                // Use firebaseUser.displayName if available, otherwise 'Arti User'
                const displayName = firebaseUser.displayName || 'Arti User';

                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        full_name: displayName,
                        username: defaultUsername,
                        avatar_url: firebaseUser.photoURL,
                        role: 'user'
                    })
                    .select()
                    .single();

                if (insertError) {
                    // UUID type mismatch error
                    if (insertError.code === '22P02') {
                        console.error(
                            'Database Error: The profiles table has UUID type for id column, but Firebase uses string UIDs.\n' +
                            'Please run the migration SQL in Supabase to change id column from UUID to TEXT.\n' +
                            'See: supabase-schema.sql'
                        );
                    } else {
                        console.error('Error creating profile:', insertError);
                    }
                    return null;
                }
                return newProfile;
            }

            // UUID type mismatch error when fetching
            if (fetchError && fetchError.code === '22P02') {
                console.error(
                    'Database Error: The profiles table has UUID type for id column, but Firebase uses string UIDs.\n' +
                    'Please run the migration SQL in Supabase to change id column from UUID to TEXT.\n' +
                    'See: supabase-schema.sql'
                );
                return null;
            }

            if (fetchError) {
                console.error('Error fetching profile:', fetchError);
            }
            return null;
        } catch (error) {
            console.error('Unexpected error in fetchOrCreateProfile:', error);
            return null;
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            const profileData = await fetchOrCreateProfile(user);
            setProfile(profileData);
        }
    }, [user, fetchOrCreateProfile]);

    useEffect(() => {
        // Listen for Firebase auth state changes
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch profile BEFORE setting user state to prevent "User exists but Profile is null" gap
                const profileData = await fetchOrCreateProfile(firebaseUser);

                // Batch updates (React 18+ handles this better, but explicit ordering is safer)
                setUser(firebaseUser);
                setProfile(profileData);

                // Inject ID for RLS
                setSupabaseAuthHeader(firebaseUser.uid);
            } else {
                setUser(null);
                setProfile(null);
                setSupabaseAuthHeader(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = useCallback(async () => {
        await firebaseSignOut();
        setUser(null);
        setProfile(null);
    }, []);

    const handleUpdateProfile = useCallback(async (data: Partial<Profile>) => {
        if (!user) return;

        // Use RPC function to update profile (bypasses RLS issues)
        const result = await updateOwnProfile(data as Record<string, unknown>);

        if (!result.success) {
            console.error('Error updating profile:', result.error);
            throw new Error(result.error);
        }

        // Refresh profile after update
        await refreshProfile();
    }, [user, refreshProfile]);

    const value = React.useMemo(() => ({
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        isEmailVerified: user?.emailVerified ?? false,
        signOut: handleSignOut,
        refreshProfile,
        updateProfile: handleUpdateProfile,
    }), [user, profile, loading, handleSignOut, refreshProfile, handleUpdateProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
