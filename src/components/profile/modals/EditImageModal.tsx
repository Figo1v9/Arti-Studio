import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save, Loader2, AlertTriangle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GalleryImage, CATEGORIES, Category } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/services/upload.service';
import { toast } from 'sonner';

interface EditImageModalProps {
    image: GalleryImage | null;
    onClose: () => void;
    onUpdate: () => void;
    onDelete: () => void;
}

export function EditImageModal({ image, onClose, onUpdate, onDelete }: EditImageModalProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form state
    const [title, setTitle] = useState(image?.title || '');
    const [prompt, setPrompt] = useState(image?.prompt || '');
    const [category, setCategory] = useState<Category>(image?.category as Category || 'art');
    const [tags, setTags] = useState(image?.tags.join(', ') || '');

    if (!image) return null;

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            // Parse tags
            const parsedTags = tags
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t.length > 0);

            // Update in database - using explicit typing to avoid TS issues
            const updateData = {
                title: title.trim() || null,
                prompt: prompt.trim(),
                category,
                tags: parsedTags,
                updated_at: new Date().toISOString()
            };

            // Update using direct query (bypassing strict typing for untyped table)
            const { error } = await supabase
                .from('gallery_images')
                .update(updateData)
                .eq('id', image.id);

            if (error) throw error;

            toast.success('Image updated successfully!');
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update image');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            // Delete from storage
            const deleted = await deleteImage(image.url);
            if (!deleted) {
                console.warn('Could not delete from storage, proceeding with DB deletion');
            }

            // Delete from database
            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', image.id);

            if (error) throw error;

            toast.success('Image deleted successfully!');
            onDelete();
            handleClose();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0f0f14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">Edit Image</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Preview */}
                            <div className="flex gap-4">
                                <img
                                    src={image.url}
                                    alt=""
                                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {image.prompt}
                                    </p>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Title (optional)
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give your image a title..."
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            {/* Prompt */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Prompt
                                </label>
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="The prompt used to generate this image..."
                                    className="bg-white/5 border-white/10 min-h-[100px]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.slice(0, 6).map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id as Category)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-sm transition-all",
                                                category === cat.id
                                                    ? "bg-violet-600 text-white"
                                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                            )}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Tags
                                </label>
                                <Input
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="cyberpunk, neon, futuristic..."
                                    className="bg-white/5 border-white/10"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Separate tags with commas
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex items-center justify-between">
                            {/* Delete Button */}
                            {!showDeleteConfirm ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-rose-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Sure?
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Yes, Delete'
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {/* Save Button */}
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !prompt.trim()}
                                className="bg-violet-600 hover:bg-violet-700"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
