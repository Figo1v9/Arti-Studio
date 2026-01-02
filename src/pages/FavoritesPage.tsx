import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ImageModal } from '@/components/gallery/ImageModal';
import { MobileImageModal } from '@/components/mobile/MobileImageModal';
import { useAuth } from '@/components/auth';
import { useFavorites } from '@/hooks/useFavorites';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { GalleryImage } from '@/types/gallery';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { favorites, isLoading } = useFavorites();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const isMobile = useIsMobile();

    // Get similar images from favorites
    const getSimilarImages = (image: GalleryImage) => {
        return favorites
            .filter((img) =>
                img.id !== image.id &&
                (img.category === image.category ||
                    img.tags.some(tag => image.tags.includes(tag)))
            )
            .slice(0, 6);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950 p-4">
                <Helmet>
                    <title>Favorites - Arti Studio</title>
                </Helmet>
                <EmptyState
                    icon={<Heart className="w-10 h-10 text-violet-400" />}
                    title="Sign in to see favorites"
                    description="Save your favorite prompts for easy access"
                    action={{
                        label: 'Sign In',
                        onClick: () => navigate('/login'),
                    }}
                />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Favorites - Prompt Gallery</title>
                <meta name="description" content="Your saved favorite prompts and images" />
            </Helmet>

            {/* Content Wrapper */}
            <div className="min-h-full">
                {/* Header */}
                <header className="sticky top-0 z-30 glass border-b border-border/30 bg-background/50 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/explore')}
                            className="hover:bg-white/10"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Favorites</h1>
                                <p className="text-sm text-muted-foreground">
                                    {favorites.length} saved prompts
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-7xl mx-auto px-4 py-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
                        </div>
                    ) : favorites.length === 0 ? (
                        <EmptyState
                            icon={<Heart className="w-10 h-10 text-violet-400" />}
                            title="No favorites yet"
                            description="Start exploring and save prompts you love"
                            action={{
                                label: 'Explore Prompts',
                                onClick: () => navigate('/explore'),
                            }}
                        />
                    ) : (
                        <GalleryGrid
                            images={favorites}
                            onImageClick={setSelectedImage}
                        />
                    )}
                </main>

                {/* Modals - using Suspense just incase (though imports are currently eager) */}
                {selectedImage && (
                    isMobile ? (
                        <MobileImageModal
                            image={selectedImage}
                            onClose={() => setSelectedImage(null)}
                            similarImages={getSimilarImages(selectedImage)}
                            onSimilarClick={setSelectedImage}
                        />
                    ) : (
                        <ImageModal
                            image={selectedImage}
                            onClose={() => setSelectedImage(null)}
                            similarImages={getSimilarImages(selectedImage)}
                            onSimilarClick={setSelectedImage}
                        />
                    )
                )}
            </div>
        </>
    );
}
