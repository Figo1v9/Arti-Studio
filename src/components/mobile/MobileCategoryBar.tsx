import { useRef, useState, useCallback } from 'react';
import { Category } from '@/types/gallery';
import { cn, getCategorySlug } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';

interface MobileCategoryBarProps {
    selectedCategory: Category | null;
    onCategoryChange: (category: Category | null) => void;
}

export function MobileCategoryBar({ selectedCategory, onCategoryChange }: MobileCategoryBarProps) {
    const { categories } = useCategories();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Mouse drag to scroll
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        scrollRef.current.style.cursor = 'grabbing';
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (scrollRef.current) {
                scrollRef.current.style.cursor = 'grab';
            }
        }
    }, [isDragging]);

    return (
        <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "fixed top-[calc(3.5rem+env(safe-area-inset-top))] left-0 right-0 z-40",
                "bg-background/95 backdrop-blur-xl border-b border-white/5",
                "overflow-x-auto hide-scrollbar px-4 py-2 h-14 flex items-center",
                "cursor-grab select-none"
            )}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={() => !isDragging && onCategoryChange(null)}
                    className={cn(
                        'px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 min-h-[44px]',
                        !selectedCategory
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/5 border border-white/10 text-muted-foreground active:bg-white/10'
                    )}
                >
                    All
                </button>
                {categories.map((cat) => {
                    const catSlug = getCategorySlug(cat.id);
                    const selectedSlug = selectedCategory ? getCategorySlug(selectedCategory) : null;
                    const isActive = selectedSlug === catSlug;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => !isDragging && onCategoryChange(isActive ? null : cat.id as Category)}
                            className={cn(
                                'px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px]',
                                isActive
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/5 border border-white/10 text-muted-foreground active:bg-white/10'
                            )}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

