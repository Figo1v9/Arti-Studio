import React, { Suspense } from 'react';
import { Plus, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoCreations } from '@/components/ui/empty-state';
import { GallerySkeletonCompact } from '@/components/gallery/GallerySkeleton';
import { GalleryImage } from '@/types/gallery';

// Properly lazy load the grid
const GalleryGrid = React.lazy(() => import('@/components/gallery/GalleryGrid').then(module => ({ default: module.GalleryGrid })));

interface CreationsTabProps {
    userCreations: GalleryImage[];
    isOwner: boolean;
    setIsUploadModalOpen: (value: boolean) => void;
    handleImageSelect: (image: GalleryImage) => void;
    loadingCreations: boolean;
    onEditImage?: (image: GalleryImage) => void;
}

export const CreationsTab: React.FC<CreationsTabProps> = ({
    userCreations,
    isOwner,
    setIsUploadModalOpen,
    handleImageSelect,
    loadingCreations,
    onEditImage
}) => {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Grid3X3 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">
                            {isOwner ? "My Creations" : "Portfolio"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {userCreations.length} {userCreations.length === 1 ? 'image' : 'images'}
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <Button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4 rounded-xl text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Upload
                    </Button>
                )}
            </div>

            {/* Content */}
            {loadingCreations ? (
                <GallerySkeletonCompact count={9} />
            ) : userCreations.length > 0 ? (
                <Suspense fallback={<GallerySkeletonCompact count={9} />}>
                    <GalleryGrid
                        images={userCreations}
                        onImageClick={handleImageSelect}
                        isLoading={false}
                        showEmptyState={false}
                    />
                </Suspense>
            ) : (
                <NoCreations onUpload={isOwner ? () => setIsUploadModalOpen(true) : undefined} />
            )}
        </div>
    );
};

