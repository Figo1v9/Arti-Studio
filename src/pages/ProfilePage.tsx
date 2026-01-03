import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

// Hooks
import { useProfileLogic } from '@/hooks/useProfileLogic';

// Components
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileAvatar } from '@/components/profile/header/ProfileAvatar';
import { ProfileInfo } from '@/components/profile/header/ProfileInfo';
import { ProfileStats } from '@/components/profile/header/ProfileStats';
import { ProfileActions } from '@/components/profile/header/ProfileActions';
import { ProfileTabsNavigation } from '@/components/profile/tabs/ProfileTabsNavigation';
import { CreationsTab } from '@/components/profile/tabs/CreationsTab';
import { FavoritesTab } from '@/components/profile/tabs/FavoritesTab';
import { OverviewTab } from '@/components/profile/tabs/OverviewTab';
import { SettingsTab } from '@/components/profile/tabs/SettingsTab';
import { EditProfileDialog } from '@/components/profile/modals/EditProfileDialog';
import { ProfileLoading } from '@/components/profile/states/ProfileLoading';
import { ProfileNotFound } from '@/components/profile/states/ProfileNotFound';
import { UserUploadModal } from '@/components/profile/UserUploadModal';
import { MobileUploadSheet } from '@/components/mobile/MobileUploadSheet';
import { FollowListModal } from '@/components/profile/FollowListModal';
import { CollectionsTab } from '@/components/collections/CollectionsTab';
import { MobileCollectionsTab } from '@/components/mobile/collections/MobileCollectionsTab';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GalleryImage } from '@/types/gallery';

const ImageModal = lazy(() => import('@/components/gallery/ImageModal').then(module => ({ default: module.ImageModal })));

// Static files that should NOT be treated as usernames
const STATIC_FILES = new Set([
    'sitemap.xml', 'robots.txt', 'ads.txt', 'manifest.json',
    'manifest.webmanifest', 'favicon.ico', 'sw.js', 'registerSW.js'
]);

export default function ProfilePage() {
    const navigate = useNavigate();
    const params = useParams<{ username: string }>();
    const isMobile = useIsMobile();

    // Check if this is a static file request - redirect to actual file
    useEffect(() => {
        const username = params.username;
        if (username && (STATIC_FILES.has(username) || username.includes('.'))) {
            // This is a static file, force reload to let server handle it
            window.location.href = `/${username}`;
        }
    }, [params.username]);

    // Connect to Logic
    const {
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
        setIsEditing,
        openEditModal,
        setIsUploadModalOpen,
        setViewedProfile,

        // Handlers
        handleImageSelect,
        handleFollowToggle,
        handleAvatarClick,
        handleAvatarUpload,
        handleSaveProfile,
        handleCopyProfileLink,
        handleSignOut,
        fetchUserCreations,
        updateProfile
    } = useProfileLogic();

    // Determine Tabs to show
    const tabs = ['creations', 'collections', 'overview'];
    if (isOwner) {
        tabs.push('favorites');
        tabs.push('settings');
    }

    // Follow list modal state
    const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);

    if (authLoading) return <ProfileLoading />;

    if (!params.username && !currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <Helmet><title>Profile - Arti Studio</title></Helmet>
                <EmptyState
                    icon={<User className="w-12 h-12 text-violet-400" />}
                    title="Sign in to continue"
                    description="Access your personalized profile and collections"
                    action={{ label: 'Sign In', onClick: () => navigate('/login') }}
                />
            </div>
        );
    }

    if (isLoadingProfile) return <ProfileLoading />;

    if (profileError || !viewedProfile) return <ProfileNotFound error={profileError || undefined} />;

    return (
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
            <Helmet>
                <title>{`${viewedProfile.full_name || 'User'} (@${viewedProfile.username || 'user'}) - Arti Studio`}</title>
            </Helmet>

            {/* Hero with Share Button */}
            <ProfileHero
                onCopyLink={handleCopyProfileLink}
                copiedLink={copiedLink}
            />

            {/* === CONTENT CONTAINER === */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-16 sm:-mt-20 relative z-10">
                {/* Profile Header Section */}
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 md:items-end mb-8 md:mb-10">
                    {/* Avatar */}
                    <ProfileAvatar
                        viewedProfile={viewedProfile}
                        isOwner={!!isOwner}
                        isUploadingAvatar={isUploadingAvatar}
                        handleAvatarClick={handleAvatarClick}
                        handleAvatarUpload={handleAvatarUpload}
                        fileInputRef={fileInputRef}
                    />

                    {/* Profile Info (Name, Username, Bio, Stats) */}
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <ProfileInfo viewedProfile={viewedProfile} />
                        <ProfileStats
                            userCreations={userCreations}
                            followersCount={followersCount}
                            followingCount={followingCount}
                            onFollowersClick={() => setFollowModalType('followers')}
                            onFollowingClick={() => setFollowModalType('following')}
                        />
                    </div>

                    {/* Actions (Follow/Edit) - Desktop only visible on right */}
                    <div className="hidden md:block shrink-0">
                        <ProfileActions
                            authLoading={authLoading}
                            isOwner={!!isOwner}
                            setIsEditing={openEditModal}
                            handleCopyProfileLink={handleCopyProfileLink}
                            copiedLink={copiedLink}
                            handleFollowToggle={handleFollowToggle}
                            isLoadingFollow={isLoadingFollow}
                            isFollowing={isFollowing}
                        />
                    </div>
                </div>

                {/* Mobile Actions - Full Width */}
                <div className="md:hidden mb-6">
                    <ProfileActions
                        authLoading={authLoading}
                        isOwner={!!isOwner}
                        setIsEditing={openEditModal}
                        handleCopyProfileLink={handleCopyProfileLink}
                        copiedLink={copiedLink}
                        handleFollowToggle={handleFollowToggle}
                        isLoadingFollow={isLoadingFollow}
                        isFollowing={isFollowing}
                    />
                </div>

                {/* TABS & CONTENT */}
                <div className="w-full">
                    <ProfileTabsNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === 'favorites' && isOwner && (
                                <FavoritesTab
                                    favorites={favorites}
                                    handleImageSelect={handleImageSelect}
                                    favoritesLoading={favoritesLoading}
                                    isOwner={isOwner}
                                />
                            )}

                            {activeTab === 'creations' && (
                                <CreationsTab
                                    userCreations={userCreations}
                                    isOwner={!!isOwner}
                                    setIsUploadModalOpen={setIsUploadModalOpen}
                                    handleImageSelect={handleImageSelect}
                                    loadingCreations={loadingCreations}
                                />
                            )}

                            {activeTab === 'overview' && (
                                <OverviewTab
                                    userCreations={userCreations}
                                    viewedProfile={viewedProfile}
                                    isOwner={!!isOwner}
                                    handleImageSelect={handleImageSelect}
                                />
                            )}

                            {activeTab === 'collections' && (
                                isMobile ? (
                                    <MobileCollectionsTab
                                        username={viewedProfile.username || ''}
                                        userId={viewedProfile.id}
                                    />
                                ) : (
                                    <CollectionsTab
                                        username={viewedProfile.username || ''}
                                        userId={viewedProfile.id}
                                    />
                                )
                            )}

                            {activeTab === 'settings' && isOwner && (
                                <SettingsTab
                                    viewedProfile={viewedProfile}
                                    currentUser={currentUser}
                                    updateProfile={updateProfile}
                                    setViewedProfile={setViewedProfile}
                                    handleSignOut={handleSignOut}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <EditProfileDialog
                    editName={editName}
                    setEditName={setEditName}
                    editUsername={editUsername}
                    setEditUsername={setEditUsername}
                    editBio={editBio}
                    setEditBio={setEditBio}
                    setIsEditing={setIsEditing}
                    isSaving={isSaving}
                    handleSaveProfile={handleSaveProfile}
                />
            )}

            {/* Image Modal */}
            <Suspense fallback={null}>
                <ImageModal
                    image={selectedImage}
                    onClose={() => handleImageSelect(null)}
                    similarImages={similarImages}
                    onSimilarClick={handleImageSelect}
                />
            </Suspense>

            {/* Upload Modal - Responsive */}
            {isMobile ? (
                <MobileUploadSheet
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={async () => {
                        if (currentUser) {
                            await fetchUserCreations(currentUser.uid);
                        }
                        toast.success('Image uploaded successfully!');
                    }}
                />
            ) : (
                <UserUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={async () => {
                        if (currentUser) {
                            await fetchUserCreations(currentUser.uid);
                        }
                        toast.success('Image uploaded successfully!');
                    }}
                />
            )}

            {/* Follow List Modal */}
            <FollowListModal
                open={followModalType !== null}
                onClose={() => setFollowModalType(null)}
                userId={viewedProfile.id}
                type={followModalType || 'followers'}
                profileName={viewedProfile.full_name || undefined}
            />
        </div>
    );
}
