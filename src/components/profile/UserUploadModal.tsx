import React, { useState } from 'react';
import { getAuthenticatedSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, X, Upload, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import ImageDropzone from '@/components/ui/ImageDropzone';
import { uploadImage, getImageDimensions, calculateAspectRatio, validateImageFile } from '@/services/upload.service';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils';

import { GalleryImage } from '@/types/gallery';
import { SemanticSearchService } from '@/services/semantic-search.service';

interface UserUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (imageId?: string) => void;
    initialData?: GalleryImage;
}

export function UserUploadModal({ isOpen, onClose, onSuccess, initialData }: UserUploadModalProps) {
    const { user } = useAuth();
    const { categories } = useCategories();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        url: '',
        title: '',
        prompt: '',
        category: '',
        tags: '',
        aspect_ratio: 1.0,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                url: initialData.url,
                title: initialData.title || '',
                prompt: initialData.prompt,
                category: initialData.category,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
                aspect_ratio: initialData.aspectRatio || 1.0,
            });
            setPreviewUrl(null); // URL is in formData
        } else if (isOpen && !initialData) {
            resetForm();
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setFormData({
            url: '',
            title: '',
            prompt: '',
            category: '',
            tags: '',
            aspect_ratio: 1.0,
        });
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setUploadError(null);
    };

    // Cleanup preview on unmount
    React.useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    const handleFileSelect = async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || 'Invalid file');
            return;
        }

        setUploadError(null);
        setSelectedFile(file);

        // Generate preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const newPreview = URL.createObjectURL(file);
        setPreviewUrl(newPreview);

        try {
            const dimensions = await getImageDimensions(file);
            const aspectRatio = calculateAspectRatio(dimensions.width, dimensions.height);
            setFormData(prev => ({ ...prev, aspect_ratio: aspectRatio }));
        } catch (error) {
            console.error('Error getting dimensions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

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



            // ... inside handleSubmit

            if (!imageUrl) {
                toast.error('Please upload an image');
                setLoading(false);
                return;
            }

            // Generate AI Embedding for Semantic Search
            let embedding: number[] | null = null;
            try {
                // Create a rich text representation for the AI
                const textForAI = `${formData.title} ${formData.prompt} ${formData.tags} ${formData.category}`;
                embedding = await SemanticSearchService.generateEmbedding(textForAI);
            } catch (e) {
                console.warn('Failed to generate embedding:', e);
                // We typically continue even if embedding fails, but it won't be searchable by meaning
            }

            const payload = {
                url: imageUrl,
                title: formData.title?.trim() || null,
                prompt: formData.prompt,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                aspect_ratio: formData.aspect_ratio,
                author_id: user.uid,
                author_name: initialData ? undefined : (user.displayName || user.email?.split('@')[0] || 'User'),
                embedding: embedding // Add embedding to payload
            };

            const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

            let error;
            let insertedImageId: string | undefined;

            if (initialData) {
                const { error: updateError } = await getAuthenticatedSupabase().from('gallery_images')
                    .update(cleanPayload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                const { data: insertedData, error: insertError } = await getAuthenticatedSupabase().from('gallery_images')
                    .insert([cleanPayload])
                    .select('id')
                    .single();
                error = insertError;
                insertedImageId = insertedData?.id;
            }

            if (error) throw error;

            toast.success(initialData ? 'Image updated!' : 'Creation shared!');
            onSuccess(insertedImageId);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error sharing creation:', error);
            toast.error('Failed to share creation');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const isEditMode = !!initialData;
    const hasImage = formData.url || selectedFile;

    const [isDragging, setIsDragging] = useState(false);

    // Handle global paste for the modal
    React.useEffect(() => {
        if (!isOpen) return;

        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileSelect(file);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only disable if leaving the main container, not entering a child
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleFileSelect(file);
            } else {
                toast.error('Please drop an image file');
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                resetForm();
            }
        }}>
            <DialogContent className={cn(
                "bg-[#0a0a0f] border-white/10 p-0 gap-0 overflow-hidden",
                // Mobile: Full screen with safe areas
                "w-full h-[100dvh] max-w-none max-h-none rounded-none",
                // Desktop: Wide horizontal modal
                "md:w-auto md:h-auto md:max-w-4xl md:max-h-[85vh] md:rounded-2xl"
            )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-50 bg-violet-600/90 backdrop-blur-md flex items-center justify-center m-1 rounded-xl border-2 border-dashed border-white">
                        <div className="text-center text-white space-y-4 animate-in fade-in zoom-in duration-200">
                            <div className="bg-white/20 p-6 rounded-full inline-block">
                                <Upload className="w-16 h-16 animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold">Drop Image Here</h3>
                                <p className="text-white/80 text-lg">to upload it instantly</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Header - Only visible on mobile */}
                <div className="md:hidden sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                {isEditMode ? <Sparkles className="w-5 h-5 text-white" /> : <ImagePlus className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <h2 className="font-bold text-white">
                                    {isEditMode ? 'Edit Creation' : 'Share Creation'}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {isEditMode ? 'Update your artwork' : 'Share with the community'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full">
                    {/* Left Panel - Image Preview (Desktop) */}
                    <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-fuchsia-900/20 p-6 flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                    {isEditMode ? <Sparkles className="w-6 h-6 text-white" /> : <ImagePlus className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {isEditMode ? 'Edit Creation' : 'Share Creation'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {isEditMode ? 'Update your artwork details' : 'Share your AI art with the community'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Area */}
                        <div className="flex-1 flex items-center justify-center">
                            <ImageDropzone
                                onFileSelect={handleFileSelect}
                                currentImageUrl={previewUrl || formData.url}
                                onRemoveImage={() => {
                                    setFormData({ ...formData, url: '' });
                                    setSelectedFile(null);
                                    if (previewUrl) {
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null);
                                    }
                                }}
                                uploading={uploadingImage}
                                error={uploadError || undefined}
                                disabled={loading}
                            />
                        </div>

                        {/* Tips */}
                        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-xs text-muted-foreground">
                                💡 <span className="text-white/70">Tip:</span> Use high-quality images (at least 1024x1024) for best results.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Form Fields */}
                    <div className="flex-1 flex flex-col md:border-l md:border-white/5">
                        {/* Form Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-4 space-y-4 pb-32 md:pb-6">
                            {/* Mobile Image Dropzone */}
                            <div className="md:hidden space-y-2">
                                <Label className="text-sm text-muted-foreground">Image</Label>
                                <ImageDropzone
                                    onFileSelect={handleFileSelect}
                                    currentImageUrl={previewUrl || formData.url}
                                    onRemoveImage={() => {
                                        setFormData({ ...formData, url: '' });
                                        setSelectedFile(null);
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                        }
                                    }}
                                    uploading={uploadingImage}
                                    error={uploadError || undefined}
                                    disabled={loading}
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Give your creation a name..."
                                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                                />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Prompt *</Label>
                                <Textarea
                                    value={formData.prompt}
                                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                    placeholder="The prompt you used to generate this image..."
                                    className="bg-white/5 border-white/10 text-white min-h-[120px] rounded-xl resize-none"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a24] border-white/10">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Tags</Label>
                                <Input
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="fantasy, portrait, digital art..."
                                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                            </div>
                        </div>

                        {/* Footer - Fixed on mobile, static on desktop */}
                        <div className={cn(
                            "border-t border-white/5 p-4 md:p-6 bg-[#0a0a0f]/95 backdrop-blur-xl",
                            "fixed bottom-0 left-0 right-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
                            "md:relative md:bottom-auto md:pb-6"
                        )}>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 md:flex-none h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.prompt || !formData.category || (!hasImage && !isEditMode)}
                                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {isEditMode ? 'Saving...' : 'Sharing...'}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {isEditMode ? 'Save Changes' : 'Share Creation'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


