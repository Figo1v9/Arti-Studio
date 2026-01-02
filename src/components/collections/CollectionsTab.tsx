/**
 * CollectionsTab Component (Desktop)
 * Clean version without Framer Motion - Using pure CSS animations
 */

import { useState } from 'react';
import { Plus, FolderOpen, Lock, Globe, MoreHorizontal, Edit2, Trash2, Images } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { CollectionPreview } from '@/services/collections.service';
import { CreateCollectionModal } from './CreateCollectionModal';
import { EditCollectionModal } from './EditCollectionModal';
import { Link } from 'react-router-dom';
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

interface CollectionsTabProps {
    username: string;
    userId?: string;
}

export function CollectionsTab({ username, userId }: CollectionsTabProps) {
    const { collections, loading, isOwner, create, update, remove } = useCollections({ userId });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<CollectionPreview | null>(null);
    const [deletingCollection, setDeletingCollection] = useState<CollectionPreview | null>(null);

    // Handle delete confirmation
    const handleDelete = async () => {
        if (!deletingCollection) return;
        await remove(deletingCollection.id);
        setDeletingCollection(null);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-muted/30 rounded-xl animate-pulse border border-border/30"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header with Create Button */}
            {isOwner && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            My Collections
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Organize your images into beautiful collections
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Collection
                    </button>
                </div>
            )}

            {/* Collections Grid */}
            {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-5 border border-border/30">
                        <FolderOpen className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No collections yet
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                        {isOwner
                            ? 'Create collections to organize your images by theme, project, or style.'
                            : 'This user hasn\'t created any collections yet.'}
                    </p>
                    {isOwner && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Collection
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collections.map((collection) => (
                        <CollectionCard
                            key={collection.id}
                            collection={collection}
                            username={username}
                            isOwner={isOwner}
                            onEdit={() => setEditingCollection(collection)}
                            onDelete={() => setDeletingCollection(collection)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <CreateCollectionModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onCreate={create}
            />

            {/* Edit Modal */}
            {/* Edit Modal */}
            {editingCollection && (
                <EditCollectionModal
                    open={true}
                    onOpenChange={(open) => !open && setEditingCollection(null)}
                    collection={editingCollection}
                    onUpdate={update}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingCollection}
                onOpenChange={(open) => !open && setDeletingCollection(null)}
            >
                <AlertDialogContent
                    className="border-border/40"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-destructive" />
                            </div>
                            <span>Delete Collection?</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingCollection?.name}"?
                            This will not delete the images, only the collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

/**
 * Collection Card Component
 */
interface CollectionCardProps {
    collection: CollectionPreview;
    username: string;
    isOwner: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function CollectionCard({ collection, username, isOwner, onEdit, onDelete }: CollectionCardProps) {
    const hasImages = collection.cover_images.length > 0;

    return (
        <div className="group relative animate-fade-in">
            <Link
                to={`/user/${username}/collection/${collection.slug}`}
                className="block"
            >
                {/* Cover Grid */}
                <div className="aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border/40 relative hover:border-primary/40 transition-all duration-300">
                    {hasImages ? (
                        <div className="grid grid-cols-2 gap-0.5 h-full">
                            {collection.cover_images.slice(0, 4).map((url, i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden bg-muted/50"
                                >
                                    <img
                                        src={url}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                            {/* Fill empty slots */}
                            {[...Array(Math.max(0, 4 - collection.cover_images.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="bg-muted/30" />
                            ))}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Images className="w-14 h-14 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="mt-3 px-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                            {collection.name}
                        </h4>
                        {!collection.is_public && (
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                        )}
                        {collection.is_public && (
                            <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Globe className="w-3.5 h-3.5 text-green-600" />
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {collection.image_count} {collection.image_count === 1 ? 'image' : 'images'}
                    </p>
                </div>
            </Link>

            {/* Owner Actions */}
            {isOwner && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-2 rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-colors border border-white/10"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-44 border-border/40"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    // Decouple from dropdown event loop to prevent freezing
                                    setTimeout(() => onEdit(), 50);
                                }}
                                className="cursor-pointer"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Collection
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    // Decouple from dropdown event loop to prevent freezing
                                    setTimeout(() => onDelete(), 50);
                                }}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Collection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
