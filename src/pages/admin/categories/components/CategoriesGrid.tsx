import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortableCategoryItem } from './SortableCategoryItem';
import { CategoryDB } from '@/types/database.types';
import { getIconByName } from '@/lib/icons';

interface CategoriesGridProps {
    categories: CategoryDB[];
    loading: boolean;
    onDragEnd: (event: DragEndEvent) => void;
    onEdit: (category: CategoryDB) => void;
    onDelete: (id: string) => void;
}

const colorOptions = [
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'amber', class: 'bg-amber-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'rose', class: 'bg-rose-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'cyan', class: 'bg-cyan-500' },
    { name: 'orange', class: 'bg-orange-500' },
];

export function CategoriesGrid({ categories, loading, onDragEnd, onEdit, onDelete }: CategoriesGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-5 h-5" />;
    };

    const getBgColorClass = (colorName: string) => {
        const colorMap: Record<string, string> = {
            purple: '#a855f7',
            blue: '#3b82f6',
            amber: '#f59e0b',
            pink: '#ec4899',
            red: '#ef4444',
            green: '#22c55e',
            rose: '#f43f5e',
            yellow: '#eab308',
            cyan: '#06b6d4',
            orange: '#f97316'
        };
        return colorMap[colorName] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-white/5 animate-pulse h-24" />
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="col-span-full text-center text-gray-400 py-12 flex flex-col items-center gap-4">
                    <p>No categories found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={categories.map(c => c.id)}
                    strategy={rectSortingStrategy}
                >
                    {categories.map((category) => (
                        <SortableCategoryItem
                            key={category.id}
                            category={category}
                            getIcon={getIcon}
                            getBgColorClass={getBgColorClass}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
