import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryDB } from '@/types/database.types';

interface SortableCategoryItemProps {
    category: CategoryDB;
    getIcon: (name: string) => React.ReactNode;
    getBgColorClass: (name: string) => string;
    onEdit: (category: CategoryDB) => void;
    onDelete: (id: string) => void;
}

export function SortableCategoryItem({
    category,
    getIcon,
    getBgColorClass,
    onEdit,
    onDelete
}: SortableCategoryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors group ${isDragging ? 'ring-2 ring-violet-500 shadow-xl bg-slate-800' : ''
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-2 -m-2 touch-none"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0"
                style={{
                    backgroundColor: `${getBgColorClass(category.color)}33`,
                    color: getBgColorClass(category.color)
                }}
            >
                {getIcon(category.icon)}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-lg truncate">{category.label}</p>
                <p className="text-xs text-gray-500 truncate" title={category.id}>{category.id}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-white/10"
                    onClick={() => onEdit(category)}
                    title="Edit Category"
                >
                    <Edit className="w-4 h-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                    onClick={() => onDelete(category.id)}
                    title="Delete Category"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
