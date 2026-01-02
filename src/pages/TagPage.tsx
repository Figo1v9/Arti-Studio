import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, ArrowLeft, Hash, TrendingUp, Grid } from 'lucide-react';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryImage } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGallery, useSimilarImages } from '@/hooks/useGallery';
import { Button } from '@/components/ui/button';

// Lazy load modals
const ImageModal = lazy(() => import('@/components/gallery/ImageModal').then(module => ({ default: module.ImageModal })));
const MobileImageModal = lazy(() => import('@/components/mobile/MobileImageModal').then(module => ({ default: module.MobileImageModal })));

export default function TagPage() {
    const { tagName } = useParams<{ tagName: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    // Decode URL param
    const decodedTag = tagName ? decodeURIComponent(tagName).toLowerCase() : '';

    // Fetch all images
    const { data: allImages = [], isLoading } = useGallery();

    // Filter images by tag
    const taggedImages = useMemo(() => {
        if (!decodedTag) return [];
        return allImages.filter((image) =>
            image.tags.some((tag) => tag.toLowerCase() === decodedTag)
        );
    }, [allImages, decodedTag]);

    // Get related tags (tags that appear with this tag)
    const relatedTags = useMemo(() => {
        const tagCount = new Map<string, number>();

        taggedImages.forEach((image) => {
            image.tags.forEach((tag) => {
                const lowerTag = tag.toLowerCase();
                if (lowerTag !== decodedTag) {
                    tagCount.set(lowerTag, (tagCount.get(lowerTag) || 0) + 1);
                }
            });
        });

        return Array.from(tagCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);
    }, [taggedImages, decodedTag]);

    // Similar images for modal
    const { data: similarFromDb } = useSimilarImages(selectedImage);

    const similarImages = useMemo(() => {
        if (similarFromDb && similarFromDb.length > 0) return similarFromDb;
        if (!selectedImage) return [];
        return taggedImages
            .filter((img) =>
                img.id !== selectedImage.id &&
                (img.category === selectedImage.category ||
                    img.tags.some(tag => selectedImage.tags.includes(tag)))
            )
            .slice(0, 6);
    }, [selectedImage, taggedImages, similarFromDb]);

    // Calculate stats
    const stats = useMemo(() => {
        return taggedImages.reduce(
            (acc, img) => ({
                views: acc.views + img.views,
                copies: acc.copies + img.copies,
            }),
            { views: 0, copies: 0 }
        );
    }, [taggedImages]);

    if (!decodedTag) {
        navigate('/explore');
        return null;
    }

    return (
        <>
            <Helmet>
                <title>#{decodedTag} - Tag - Arti Studio</title>
                <meta
                    name="description"
                    content={`Explore ${taggedImages.length} AI-generated images tagged with #${decodedTag} on Arti Studio. Discover creative prompts and inspiring artwork.`}
                />
                <meta property="og:title" content={`#${decodedTag} - Arti Studio`} />
                <meta property="og:description" content={`${taggedImages.length} images tagged with #${decodedTag}`} />
            </Helmet>

            <div className={cn("min-h-screen", isMobile ? "px-4 pb-24" : "px-8 pb-24")}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 md:py-8"
                >
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mb-4 -ml-2 text-muted-foreground hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {/* Tag Info */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Hash className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white capitalize">
                                #{decodedTag}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {taggedImages.length} {taggedImages.length === 1 ? 'image' : 'images'} found
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Grid className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-muted-foreground">
                                {taggedImages.length} prompts
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-muted-foreground">
                                {stats.views.toLocaleString()} views
                            </span>
                        </div>
                    </div>

                    {/* Related Tags */}
                    {relatedTags.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Related Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {relatedTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => navigate(`/tag/${encodeURIComponent(tag)}`)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400 transition-all text-sm text-white capitalize"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Gallery Grid */}
                <GalleryGrid
                    images={taggedImages}
                    onImageClick={setSelectedImage}
                    isLoading={isLoading}
                />

                {/* Empty State */}
                {!isLoading && taggedImages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Hash className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No images found</h2>
                        <p className="text-muted-foreground max-w-md mb-6">
                            We couldn't find any images with the tag "#{decodedTag}".
                        </p>
                        <Button
                            onClick={() => navigate('/explore')}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Explore Gallery
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Image Modal */}
            <Suspense fallback={null}>
                {isMobile ? (
                    <MobileImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={similarImages}
                        onSimilarClick={setSelectedImage}
                    />
                ) : (
                    <ImageModal
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        similarImages={similarImages}
                        onSimilarClick={setSelectedImage}
                    />
                )}
            </Suspense>
        </>
    );
}
