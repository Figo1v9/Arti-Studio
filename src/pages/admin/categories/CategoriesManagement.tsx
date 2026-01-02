
import { useCategoriesManagement } from './hooks/useCategoriesManagement';
import { useCategoryForm } from './hooks/useCategoryForm';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesGrid } from './components/CategoriesGrid';
import { CategoryFormDialog } from './components/CategoryFormDialog';

export default function CategoriesManagement() {
    const {
        categories,
        loading,
        fetchCategories,
        handleDragEnd,
        deleteCategory
    } = useCategoriesManagement();

    const formState = useCategoryForm(() => {
        fetchCategories();
    });

    return (
        <div className="space-y-6">
            <CategoriesHeader
                count={categories.length}
                onRefresh={() => fetchCategories(false)}
                onAdd={() => formState.openAddModal(categories.length)}
            />

            <CategoriesGrid
                categories={categories}
                loading={loading}
                onDragEnd={handleDragEnd}
                onEdit={formState.openEditModal}
                onDelete={deleteCategory}
            />

            <CategoryFormDialog
                open={formState.isModalOpen}
                onOpenChange={formState.setIsModalOpen}
                isEditing={!!formState.editingCategory}
                formState={formState}
            />
        </div>
    );
}
