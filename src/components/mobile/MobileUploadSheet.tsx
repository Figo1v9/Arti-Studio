/**
 * MobileUploadSheet Component
 * Beautiful bottom sheet for uploading images on mobile devices
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    X,
    Upload,
    Image as ImageIcon,
    Sparkles,
    Tag,
    FolderOpen,
    Check,
    Loader2,
    Camera,
    ChevronDown
} from 'lucide-react';
import { getAuthenticatedSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth';
import { useCategories } from '@/hooks/useCategories';
import { uploadImage, validateImageFile, getImageDimensions, calculateAspectRatio } from '@/services/upload.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { GalleryImage } from '@/types/gallery';

interface MobileUploadSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (imageId?: string) => void;
    initialData?: GalleryImage;
}

export function MobileUploadSheet({ isOpen, onClose, onSuccess, initialData }: MobileUploadSheetProps) {
    const { user } = useAuth();
    const { categories } = useCategories();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [step, setStep] = useState<'image' | 'details'>('image');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const [formData, setFormData] = useState({
        url: '',
        title: '',
        prompt: '',
        category: '',
        tags: '',
        aspect_ratio: 1.0,
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && initialData) {
            setStep('details');
            setPreviewUrl(initialData.url);
            setFormData({
                url: initialData.url,
                title: initialData.title || '',
                prompt: initialData.prompt,
                category: initialData.category,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
                aspect_ratio: initialData.aspectRatio || 1.0,
            });
        } else if (isOpen && !initialData) {
            resetForm();
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setStep('image');
        setFormData({
            url: '',
            title: '',
            prompt: '',
            category: '',
            tags: '',
            aspect_ratio: 1.0,
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setTimeout(resetForm, 300);
        }
    };

    const handleFileSelect = async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || 'Invalid file');
            return;
        }

        setUploadError(null);
        setSelectedFile(file);

        // Create preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        try {
            const dimensions = await getImageDimensions(file);
            const aspectRatio = calculateAspectRatio(dimensions.width, dimensions.height);
            setFormData(prev => ({ ...prev, aspect_ratio: aspectRatio }));

            // Move to details step
            setStep('details');
        } catch (error) {
            console.error('Error getting dimensions:', error);
            setStep('details');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!formData.prompt.trim()) {
            toast.error('Please add a prompt');
            return;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }
        if (!selectedFile && !formData.url) {
            toast.error('Please add an image');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = formData.url;

            if (selectedFile) {
                setUploadingImage(true);
                const uploadedUrl = await uploadImage(selectedFile);
                if (!uploadedUrl) {
                    throw new Error('Upload failed');
                }
                imageUrl = uploadedUrl;
                setUploadingImage(false);
            }

            const payload = {
                url: imageUrl,
                title: formData.title.trim() || null,
                prompt: formData.prompt.trim(),
                category: formData.category,
                tags: formData.tags
                    ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : [],
                aspect_ratio: formData.aspect_ratio,
                author_id: user.uid,
            };

            const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

            let insertedImageId: string | undefined;

            if (initialData) {
                const { error: updateError } = await getAuthenticatedSupabase().from('gallery_images')
                    .update(cleanPayload)
                    .eq('id', initialData.id);
                if (updateError) throw updateError;
            } else {
                const { data: insertedData, error: insertError } = await getAuthenticatedSupabase().from('gallery_images')
                    .insert([cleanPayload])
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                insertedImageId = insertedData?.id;
            }

            toast.success(initialData ? 'Image updated!' : 'Creation shared!');
            onSuccess(insertedImageId);
            handleClose();
        } catch (error) {
            console.error('Error sharing creation:', error);
            toast.error('Failed to share creation');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const selectedCategory = categories.find(c => c.id === formData.category);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                            if (info.offset.y > 100) {
                                handleClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 max-h-[92vh] overflow-hidden flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2 shrink-0">
                            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">
                                        {initialData ? 'Edit Creation' : 'Share Creation'}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {step === 'image' ? 'Choose your image' : 'Add details'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {step === 'image' ? (
                                    <motion.div
                                        key="image-step"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-5"
                                    >
                                        {/* Upload Area */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-violet-500/30 bg-violet-500/5 flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                                        >
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                                                <Camera className="w-10 h-10 text-violet-400" />
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="font-semibold text-foreground mb-1">
                                                    Tap to select image
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    PNG, JPG, WebP up to 10MB
                                                </p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>

                                        {uploadError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-3 text-sm text-red-400 text-center"
                                            >
                                                {uploadError}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="details-step"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-5 space-y-5"
                                    >
                                        {/* Preview */}
                                        {previewUrl && (
                                            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(null);
                                                        setStep('image');
                                                    }}
                                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Title (Optional) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-violet-400" />
                                                Title <span className="text-muted-foreground">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Give your creation a name"
                                                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all text-base"
                                            />
                                        </div>

                                        {/* Prompt (Required) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-violet-400" />
                                                Prompt <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                value={formData.prompt}
                                                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                                                placeholder="Describe how you created this image..."
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all resize-none text-base"
                                            />
                                        </div>

                                        {/* Category (Required) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <FolderOpen className="w-4 h-4 text-violet-400" />
                                                Category <span className="text-red-400">*</span>
                                            </label>
                                            <button
                                                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                                                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between text-left"
                                            >
                                                <span className={selectedCategory ? 'text-foreground' : 'text-muted-foreground'}>
                                                    {selectedCategory?.label || 'Select a category'}
                                                </span>
                                                <ChevronDown className={cn(
                                                    "w-4 h-4 transition-transform",
                                                    showCategoryPicker && "rotate-180"
                                                )} />
                                            </button>

                                            <AnimatePresence>
                                                {showCategoryPicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                                            {categories.map((cat) => (
                                                                <button
                                                                    key={cat.id}
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, category: cat.id }));
                                                                        setShowCategoryPicker(false);
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                                                        formData.category === cat.id
                                                                            ? "bg-violet-500 text-white"
                                                                            : "bg-muted/50 text-foreground hover:bg-muted"
                                                                    )}
                                                                >
                                                                    {formData.category === cat.id && <Check className="w-3.5 h-3.5" />}
                                                                    {cat.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Tags (Optional) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-violet-400" />
                                                Tags <span className="text-muted-foreground">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tags}
                                                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                                placeholder="art, digital, fantasy..."
                                                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all text-base"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Separate tags with commas
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="p-5 pt-3 pb-28 border-t border-border shrink-0 bg-background">
                            {step === 'details' ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('image')}
                                        disabled={loading}
                                        className="flex-1 py-3.5 rounded-xl border border-border text-foreground font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !formData.prompt || !formData.category}
                                        className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {uploadingImage ? 'Uploading...' : 'Sharing...'}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Share Creation
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="w-full py-3.5 rounded-xl border border-border text-foreground font-medium active:scale-[0.98] transition-transform"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Category Picker Backdrop */}
                    {showCategoryPicker && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowCategoryPicker(false)}
                        />
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
