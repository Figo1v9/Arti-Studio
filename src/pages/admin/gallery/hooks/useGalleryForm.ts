import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GalleryImageDB } from '@/types/database.types';
import { uploadImage, getImageDimensions, calculateAspectRatio, validateImageFile } from '@/services/upload.service';
import { generateSmartTags, AI_PROVIDERS, AIProvider, getDefaultProvider } from '@/services/ai.service';
import { Category } from '@/types/gallery';

export function useGalleryForm(
    categories: Category[],
    onSuccess: () => void
) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<GalleryImageDB | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [generatingTags, setGeneratingTags] = useState(false);
    const [aiProvider, setAiProvider] = useState<AIProvider>(getDefaultProvider());
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        url: '',
        title: '',
        prompt: '',
        category: '',
        tags: '',
        aspect_ratio: 1.0,
    });

    const resetForm = () => {
        setFormData({
            url: '',
            title: '',
            prompt: '',
            category: '',
            tags: '',
            aspect_ratio: 1.0,
        });
        setEditingImage(null);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setUploadError(null);
    };

    // Cleanup preview
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const cleanupPreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    };

    const handleFileSelect = async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || 'Invalid file');
            return;
        }

        setUploadError(null);
        setSelectedFile(file);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const newPreview = URL.createObjectURL(file);
        setPreviewUrl(newPreview);

        try {
            const dimensions = await getImageDimensions(file);
            const aspectRatio = calculateAspectRatio(dimensions.width, dimensions.height);
            setFormData(prev => ({ ...prev, aspect_ratio: aspectRatio }));
        } catch (error) {
            console.error('Error getting image dimensions:', error);
        }
    };

    const handleImageUpload = async (): Promise<string | null> => {
        if (!selectedFile) return formData.url || null;

        setUploadingImage(true);
        try {
            const url = await uploadImage(selectedFile);
            if (url) {
                setFormData(prev => ({ ...prev, url }));
                return url;
            }
            throw new Error('Upload failed');
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Failed to upload image.');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGenerateTags = async () => {
        if (!formData.prompt.trim()) {
            toast.error('Enter prompt first');
            return;
        }

        setGeneratingTags(true);
        try {
            const { tags, title, category } = await generateSmartTags(formData.prompt, undefined, categories, aiProvider);

            if (tags.length > 0 || title) {
                setFormData(prev => ({
                    ...prev,
                    tags: tags.join(', '),
                    title: title || prev.title,
                    category: category || prev.category
                }));
                toast.success('Tags and title generated!');
            } else {
                toast.error('No tags generated.');
            }
        } catch (error) {
            console.error('Error generating tags:', error);
            toast.error('Failed to generate tags');
        } finally {
            setGeneratingTags(false);
        }
    };

    const openEditModal = (image: GalleryImageDB) => {
        setEditingImage(image);
        setFormData({
            url: image.url,
            title: image.title || '',
            prompt: image.prompt,
            category: image.category,
            tags: image.tags.join(', '),
            aspect_ratio: image.aspect_ratio,
        });
        setSelectedFile(null);
        setUploadError(null);
        setIsAddModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            let imageUrl = formData.url;
            if (selectedFile) {
                const uploadedUrl = await handleImageUpload();
                if (!uploadedUrl) {
                    setFormLoading(false);
                    return;
                }
                imageUrl = uploadedUrl;
            }

            if (!imageUrl) {
                toast.error('Image is required');
                setFormLoading(false);
                return;
            }

            const imageData = {
                url: imageUrl,
                title: formData.title?.trim() || null,
                prompt: formData.prompt,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                aspect_ratio: formData.aspect_ratio,
            };

            if (editingImage) {
                const { error } = await supabase
                    .from('gallery_images')
                    .update(imageData)
                    .eq('id', editingImage.id);

                if (error) throw error;
                toast.success('Image updated');
            } else {
                const { error } = await supabase
                    .from('gallery_images')
                    .insert([imageData]);

                if (error) throw error;
                toast.success('Image added');
            }

            setIsAddModalOpen(false);
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error saving image:', error);
            toast.error('Failed to save image');
        } finally {
            setFormLoading(false);
        }
    };

    return {
        isAddModalOpen,
        setIsAddModalOpen,
        editingImage,
        formLoading,
        uploadingImage,
        selectedFile,
        uploadError,
        generatingTags,
        aiProvider,
        setAiProvider,
        formData,
        setFormData,
        resetForm,
        handleFileSelect,
        handleGenerateTags,
        openEditModal,
        handleSubmit,
        setSelectedFile,
        previewUrl,
        setPreviewUrl
    };
}
