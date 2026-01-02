import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CategoryDB } from '@/types/database.types';

export function useCategoryForm(onSuccess: () => void) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDB | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        label: '',
        icon: 'Palette',
        color: 'purple',
        sort_order: 0,
    });

    const resetForm = () => {
        setFormData({
            id: '',
            label: '',
            icon: 'Palette',
            color: 'purple',
            sort_order: 0, // Should be injected or handled by default
        });
        setEditingCategory(null);
    };

    const openEditModal = (category: CategoryDB) => {
        setEditingCategory(category);
        setFormData({
            id: category.id,
            label: category.label,
            icon: category.icon,
            color: category.color,
            sort_order: category.sort_order,
        });
        setIsModalOpen(true);
    };

    const openAddModal = (nextSortOrder: number) => {
        setFormData(prev => ({ ...prev, sort_order: nextSortOrder }));
        setIsModalOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingCategory) {
                const { error } = await supabase.from('categories')
                    .update({
                        label: formData.label,
                        label_ar: formData.label,
                        icon: formData.icon,
                        color: formData.color,
                        sort_order: formData.sort_order,
                    })
                    .eq('id', editingCategory.id);

                if (error) throw error;
                toast.success('Category updated successfully');
            } else {
                const { error } = await supabase.from('categories')
                    .insert([{
                        ...formData,
                        label_ar: formData.label
                    }]);

                if (error) throw error;
                toast.success('Category added successfully');
            }

            setIsModalOpen(false);
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setFormLoading(false);
        }
    };

    return {
        isModalOpen,
        setIsModalOpen,
        editingCategory,
        formLoading,
        formData,
        setFormData,
        openEditModal,
        openAddModal,
        handleSubmit,
        resetForm
    };
}
