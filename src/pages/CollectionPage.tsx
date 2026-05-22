/**
 * CollectionPage Component
 * Displays a single collection with all its images
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Lock,
    Globe,
    Calendar,
    Images,
    Share2,
    MoreHorizontal,
    Edit2,
    Trash2,
    Loader2,
    Plus
} from 'lucide-react';
import { getCollectionBySlug, deleteCollection, addImageToCollection, CollectionWithImages } from '@/services/collections.service';
import { useAuth } from '@/components/auth';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ImageModal } from '@/components/gallery/ImageModal';
import { MobileImageModal } from '@/components/mobile/MobileImageModal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditCollectionModal } from '@/components/collections/EditCollectionModal';
import { MobileEditCollectionSheet } from '@/components/mobile/collections/MobileEditCollectionSheet';
import { UserUploadModal } from '@/components/profile/UserUploadModal';
import { MobileUploadSheet } from '@/components/mobile/MobileUploadSheet';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import type { GalleryImage } from '@/types/gallery';
import { useModalHistory } from '@/hooks/useModalHistory';
import { SEOService } from '@/services/seo/seo.service';

export default function CollectionPage() {
    const { username, slug } = useParams<{ username: string; slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMobile = useIsMobile();

    const [collection, setCollection] = useState<CollectionWithImages | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Modal history for back button support
    const { openWithHistory } = useModalHistory(
        selectedImage !== null,
        () => setSelectedImage(null),
        'collection-modal'
    );

    // Check if current user is the owner
    const isOwner = user?.uid === collection?.user_id;

    // Dynamic SEO Data calculation
    const seoData = useMemo(() => {
        if (selectedImage) {
            const title = `${selectedImage.title || 'AI Generated Art'} - ${SEOService.SITE_NAME}`;
            const description = selectedImage.prompt
                ? `${selectedImage.prompt.substring(0, 150)}...`
                : 'Discover AI-generated artwork and prompts at Arti Studio';
            const url = `${SEOService.SITE_URL}/image/${selectedImage.id}`;
            return {
                title,
                description,
                url,
                image: selectedImage.url,
                type: 'article' as const,
                keywords: [
                    'AI Art',
                    'AI Prompt',
                    selectedImage.category || 'Digital Art',
                    ...(selectedImage.tags || []).slice(0, 5)
                ],
                author: selectedImage.author || undefined,
                publishedTime: selectedImage.createdAt || undefined,
            };
        }

        if (!collection) return null;

        const title = `${collection.name} AI Art Collection by @${username} - ${SEOService.SITE_NAME}`;
        const description = collection.description || `Explore the "${collection.name}" AI art gallery by @${username} containing ${collection.image_count || 0} images and creative prompt styles.`;
        const url = `${SEOService.SITE_URL}/${username}/collection/${slug}`;

        return {
            title,
            description,
            url,
            image: collection.images?.[0]?.url || SEOService.DEFAULT_OG_IMAGE,
            type: 'website' as const,
            keywords: ['AI Art', 'AI Prompt', collection.name, 'Collection', 'Gallery', `@${username}`],
        };
    }, [selectedImage, collection, username, slug]);

    // Dynamic JSON-LD structured schemas
    const schemas = useMemo(() => {
        const list: any[] = [];
        if (selectedImage) {
            list.push(
                SEOService.generateImageSchema({
                    id: selectedImage.id,
                    title: selectedImage.title,
                    prompt: selectedImage.prompt,
                    url: selectedImage.url,
                    author: selectedImage.author || undefined,
                    category: selectedImage.category || undefined,
                    tags: selectedImage.tags,
                    views: selectedImage.views,
                    copies: selectedImage.copies,
                    createdAt: selectedImage.createdAt,
                })
            );
        } else if (collection) {
            list.push(
                SEOService.generateCollectionSchema({
                    id: collection.id,
                    name: collection.name,
                    description: collection.description || undefined,
                    imageCount: collection.image_count || undefined,
                })
            );
            list.push(
                SEOService.generateBreadcrumbSchema([
                    { name: 'Home', url: '/' },
                    { name: `@${username}`, url: `/${username}` },
                    { name: collection.name, url: `/${username}/collection/${slug}` }
                ])
            );
        }
        return list;
    }, [selectedImage, collection, username, slug]);

    // Fetch collection
    useEffect(() => {
        async function fetchCollection() {
            if (!username || !slug) return;

            setLoading(true);
            setError(null);

            try {
                // Pass current user ID to check access to private collections
                const data = await getCollectionBySlug(username, slug, user?.uid);
                if (data) {
                    setCollection(data);
                } else {
                    setError('Collection not found');
                }
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Failed to load collection');
            } finally {
                setLoading(false);
            }
        }

        fetchCollection();
    }, [username, slug, user?.uid]);

    // Handle delete
    const handleDelete = async () => {
        if (!collection) return;

        setDeleting(true);
        try {
            const success = await deleteCollection(collection.id);
            if (success) {
                toast.success('Collection deleted');
                navigate(`/${username}`);
            }
        } catch (err) {
            console.error('Error deleting collection:', err);
            toast.error('Failed to delete collection');
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Handle update
    const handleUpdate = async (collectionId: string, updates: { name?: string; description?: string; is_public?: boolean }) => {
        // Refresh collection data
        if (username && slug) {
            const data = await getCollectionBySlug(username, slug, user?.uid);
            if (data) {
                setCollection(data);
            }
        }
        return true;
    };

    // Handle share
    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share && isMobile) {
                await navigator.share({
                    title: collection?.name,
                    text: collection?.description || `Check out this collection by @${username}`,
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    // Handle upload success - add image to collection
    const handleUploadSuccess = async (imageId?: string) => {
        if (imageId && collection) {
            // Add the uploaded image to this collection
            await addImageToCollection(collection.id, imageId);
        }
        // Refresh collection data
        if (username && slug) {
            const data = await getCollectionBySlug(username, slug, user?.uid);
            if (data) {
                setCollection(data);
            }
        }
        toast.success('Image uploaded and added to collection!');
    };

    // Convert collection images to GalleryImage format
    const galleryImages: GalleryImage[] = collection?.images.map(img => ({
        id: img.id,
        title: img.title,
        prompt: img.prompt,
        url: img.url,
        category: img.category,
        author: img.author_id,
        likes: img.likes,
        views: img.views,
        downloads: img.downloads,
        copies: img.copies,
        aspectRatio: img.aspect_ratio,
        createdAt: img.created_at,
        isFeatured: img.is_featured,
        tags: img.tags || [],
        author_id: img.author_id
    })) || [];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Error state
    if (error || !collection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Images className="w-16 h-16 text-muted-foreground mb-4" />
                <h1 className="text-xl font-semibold mb-2">Collection Not Found</h1>
                <p className="text-muted-foreground mb-4">{error || 'This collection doesn\'t exist'}</p>
                <Button onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const formattedDate = new Date(collection.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <Helmet>
                {seoData && <title>{seoData.title}</title>}
                {seoData && Object.entries(SEOService.generateMetaTags(seoData)).map(([name, content]) => {
                    if (name === 'title') return null;
                    if (name.startsWith('og:')) {
                        return <meta key={name} property={name} content={content} />;
                    }
                    return <meta key={name} name={name} content={content} />;
                })}
                {seoData?.url && <link rel="canonical" href={seoData.url} />}
                {schemas.map((schema, index) => (
                    <script key={index} type="application/ld+json">
                        {JSON.stringify(schema)}
                    </script>
                ))}
            </Helmet>

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold truncate">{collection.name}</h1>
                                    {!collection.is_public && (
                                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                </div>
                                <Link
                                    to={`/${username}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    @{username}
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Upload Button - Only for owner */}
                                {isOwner && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Upload
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>

                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Edit Collection
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setShowDeleteDialog(true)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Collection
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Collection Info */}
                <div className="container mx-auto px-4 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        {collection.description && (
                            <p className="text-muted-foreground mb-4 max-w-2xl">
                                {collection.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Images className="w-4 h-4" />
                                <span>{collection.image_count} images</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {collection.is_public ? (
                                    <Globe className="w-4 h-4" />
                                ) : (
                                    <Lock className="w-4 h-4" />
                                )}
                                <span>{collection.is_public ? 'Public' : 'Private'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Created {formattedDate}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Images Grid */}
                    {galleryImages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <Images className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No images yet</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                {isOwner
                                    ? 'Upload images or add from any image modal.'
                                    : 'This collection is empty.'}
                            </p>
                            {isOwner && (
                                <Button onClick={() => setShowUploadModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Upload Image
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <GalleryGrid
                            images={galleryImages}
                            onImageClick={(image) => {
                                setSelectedImage(image);
                                openWithHistory(image.id);
                            }}
                        />
                    )}
                </div>

                {/* Image Modal */}
                {selectedImage && (
                    isMobile ? (
                        <MobileImageModal
                            image={selectedImage}
                            onClose={() => setSelectedImage(null)}
                            similarImages={galleryImages.filter(img => img.id !== selectedImage.id)}
                            onSimilarClick={(image) => {
                                setSelectedImage(image);
                                openWithHistory(image.id);
                            }}
                        />
                    ) : (
                        <ImageModal
                            image={selectedImage}
                            onClose={() => setSelectedImage(null)}
                            similarImages={galleryImages.filter(img => img.id !== selectedImage.id)}
                            onSimilarClick={(image) => {
                                setSelectedImage(image);
                                openWithHistory(image.id);
                            }}
                        />
                    )
                )}

                {/* Edit Modal */}
                {showEditModal && (
                    isMobile ? (
                        <MobileEditCollectionSheet
                            open={showEditModal}
                            onOpenChange={setShowEditModal}
                            collection={collection}
                            onUpdate={handleUpdate}
                        />
                    ) : (
                        <EditCollectionModal
                            open={showEditModal}
                            onOpenChange={setShowEditModal}
                            collection={collection}
                            onUpdate={handleUpdate}
                        />
                    )
                )}

                {/* Delete Confirmation */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{collection.name}"?
                                This will not delete the images, only the collection.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Delete'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Upload Modal - Responsive */}
                {isMobile ? (
                    <MobileUploadSheet
                        isOpen={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={handleUploadSuccess}
                    />
                ) : (
                    <UserUploadModal
                        isOpen={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={handleUploadSuccess}
                    />
                )}
            </div>
        </>
    );
}
