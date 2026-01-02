import React, { Suspense } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { NoFavorites } from '@/components/ui/empty-state';
import { GallerySkeletonCompact } from '@/components/gallery/GallerySkeleton';
import { GalleryImage } from '@/types/gallery';
import { useNavigate } from 'react-router-dom';

// Properly lazy load the grid
const GalleryGrid = React.lazy(() => import('@/components/gallery/GalleryGrid').then(module => ({ default: module.GalleryGrid })));

interface FavoritesTabProps {
    favorites: GalleryImage[];
    isOwner: boolean;
    handleImageSelect: (image: GalleryImage) => void;
    favoritesLoading: boolean;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
    favorites,
    handleImageSelect,
    favoritesLoading
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-rose-500/10">
                    <Bookmark className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-white">Saved Creations</h3>
                    <p className="text-xs text-muted-foreground">
                        {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
            </div>

            {/* Content */}
            {favoritesLoading ? (
                <GallerySkeletonCompact count={9} />
            ) : favorites.length > 0 ? (
                <Suspense fallback={<GallerySkeletonCompact count={9} />}>
                    <GalleryGrid
                        images={favorites}
                        onImageClick={handleImageSelect}
                        isLoading={false}
                        showEmptyState={false}
                    />
                </Suspense>
            ) : (
                <NoFavorites onExplore={() => navigate('/explore')} />
            )}
        </div>
    );
};

