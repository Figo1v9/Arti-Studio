/**
 * MobileCollectionsTab Component
 * Mobile-optimized collections grid with bottom sheet creation
 */

import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Lock, Images, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { CollectionPreview } from '@/services/collections.service';
import { MobileCreateCollectionSheet } from './MobileCreateCollectionSheet';
import { MobileEditCollectionSheet } from './MobileEditCollectionSheet';
import { Link } from 'react-router-dom';

interface MobileCollectionsTabProps {
    username: string;
    userId?: string;
}

export function MobileCollectionsTab({ username, userId }: MobileCollectionsTabProps) {
    const { collections, loading, isOwner, create, update, remove } = useCollections({ userId });
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [editingCollection, setEditingCollection] = useState<CollectionPreview | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Handle delete
    const handleDelete = async (id: string) => {
        if (confirm('Delete this collection? Images will not be deleted.')) {
            await remove(id);
        }
        setActiveMenu(null);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-muted/50 rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Create Button (Fixed at top for owner) */}
            {isOwner && collections.length > 0 && (
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border/50">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateSheet(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Collection
                    </motion.button>
                </div>
            )}

            {/* Collections Grid */}
            {collections.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-6 text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <FolderOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        No collections yet
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">
                        {isOwner
                            ? 'Organize your images into themed collections'
                            : 'No collections to show'}
                    </p>
                    {isOwner && (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreateSheet(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Collection
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 gap-3 p-4">
                    <AnimatePresence mode="popLayout">
                        {collections.map((collection, index) => (
                            <MobileCollectionCard
                                key={collection.id}
                                collection={collection}
                                username={username}
                                index={index}
                                isOwner={isOwner}
                                isMenuOpen={activeMenu === collection.id}
                                onMenuToggle={() => setActiveMenu(
                                    activeMenu === collection.id ? null : collection.id
                                )}
                                onEdit={() => {
                                    setEditingCollection(collection);
                                    setActiveMenu(null);
                                }}
                                onDelete={() => handleDelete(collection.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Sheet */}
            <MobileCreateCollectionSheet
                open={showCreateSheet}
                onOpenChange={setShowCreateSheet}
                onCreate={create}
            />

            {/* Edit Sheet */}
            {editingCollection && (
                <MobileEditCollectionSheet
                    open={!!editingCollection}
                    onOpenChange={(open) => !open && setEditingCollection(null)}
                    collection={editingCollection}
                    onUpdate={update}
                />
            )}
        </div>
    );
}

/**
 * Mobile Collection Card
 */
interface MobileCollectionCardProps {
    collection: CollectionPreview;
    username: string;
    index: number;
    isOwner: boolean;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const MobileCollectionCard = forwardRef<HTMLDivElement, MobileCollectionCardProps>(function MobileCollectionCard({
    collection,
    username,
    index,
    isOwner,
    isMenuOpen,
    onMenuToggle,
    onEdit,
    onDelete
}, ref) {
    const hasImages = collection.cover_images.length > 0;

    return (
        <div
            ref={ref}
            className="relative"
        >
            <Link
                to={`/user/${username}/collection/${collection.slug}`}
                className="block active:scale-[0.98] transition-transform"
            >
                {/* Cover Grid */}
                <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/50 relative">
                    {hasImages ? (
                        <div className="grid grid-cols-2 gap-0.5 h-full">
                            {collection.cover_images.slice(0, 4).map((url, i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden bg-muted"
                                >
                                    <img
                                        src={url}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - collection.cover_images.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="bg-muted/50" />
                            ))}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Images className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-2 px-0.5">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-medium text-sm text-foreground truncate flex-1">
                            {collection.name}
                        </h4>
                        {!collection.is_public && (
                            <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {collection.image_count} images
                    </p>
                </div>
            </Link>

            {/* Owner Menu */}
            {isOwner && (
                <div className="absolute top-2 right-2">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMenuToggle();
                        }}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute top-10 right-0 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-20 min-w-32"
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
});
