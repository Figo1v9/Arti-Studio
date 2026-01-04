
import { useCategories } from '@/hooks/useCategories';
import { useGalleryManagement } from './hooks/useGalleryManagement';
import { useGalleryForm } from './hooks/useGalleryForm';
import { GalleryHeader } from './components/GalleryHeader';
import { GalleryToolbar } from './components/GalleryToolbar';
import { GalleryTable } from './components/GalleryTable';
import { GalleryFormDialog } from './components/GalleryFormDialog';
import React, { useMemo } from 'react';

export default function GalleryManagement() {
    const { categories } = useCategories();

    // Main state & logic
    const {
        images,
        totalCount,
        loading,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        filteredImages,
        fetchImages,
        handleToggleFeatured,
        deleteImage,
        limit,
        setLimit
    } = useGalleryManagement();

    // Form logic
    const formState = useGalleryForm(categories, () => {
        fetchImages();
    });

    const categoryLabels = useMemo(() => {
        return Object.fromEntries(categories.map((cat) => [cat.id, cat.label]));
    }, [categories]);

    // Handle global paste for easy upload
    React.useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    e.preventDefault();
                    formState.handleFileSelect(file);
                    formState.setIsAddModalOpen(true);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [formState]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <GalleryHeader totalImages={totalCount} />
            </div>

            <GalleryToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categories={categories}
                filteredImages={filteredImages}
                categoryLabels={categoryLabels}
                imagesCount={images.length}
                fetchImages={fetchImages}
                onOpenAddModal={() => formState.setIsAddModalOpen(true)}
                limit={limit}
                setLimit={setLimit}
            />

            <GalleryTable
                images={images}
                filteredImages={filteredImages}
                loading={loading}
                categories={categories}
                onEdit={formState.openEditModal}
                onDelete={deleteImage}
                onToggleFeatured={handleToggleFeatured}
            />

            <GalleryFormDialog
                open={formState.isAddModalOpen}
                onOpenChange={formState.setIsAddModalOpen}
                isEditing={!!formState.editingImage}
                formState={formState}
                categories={categories}
            />
        </div>
    );
}
