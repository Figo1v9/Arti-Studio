
import { Category } from '@/types/gallery';
import { motion } from 'framer-motion';
import { cn, getCategorySlug } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useRef, useEffect, useState, useCallback } from 'react';
import { getCategoryGradient } from '@/constants/categories';
import { getIconByName } from '@/lib/icons';

interface HeaderProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function Header({ selectedCategory, onCategoryChange }: HeaderProps) {
  const { categories } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
      }
    }
  }, [isDragging]);

  // Wheel scroll translation (Vertical -> Horizontal)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if scrolling vertically
      if (e.deltaY !== 0) {
        // Prevent default only if we can scroll
        if (
          (container.scrollLeft === 0 && e.deltaY < 0) ||
          (container.scrollLeft >= container.scrollWidth - container.clientWidth && e.deltaY > 0)
        ) {
          return; // At edges, let parent scroll
        }

        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Category Pills */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 w-full",
            "cursor-grab select-none touch-pan-x"
          )}
        >
          <button
            onClick={() => !isDragging && onCategoryChange(null)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap relative',
              !selectedCategory
                ? 'text-white'
                : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/40'
            )}
          >
            {!selectedCategory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative z-10">All</span>
          </button>

          {categories.map((cat) => {
            // Compare using slug for clean URL matching
            const catSlug = getCategorySlug(cat.id);
            const selectedSlug = selectedCategory ? getCategorySlug(selectedCategory) : null;
            const isActive = selectedSlug === catSlug;
            const gradient = getCategoryGradient(cat.color);
            const IconComponent = getIconByName(cat.icon);

            return (
              <button
                key={cat.id}
                onClick={() => !isDragging && onCategoryChange(isActive ? null : cat.id as Category)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap relative group',
                  isActive
                    ? 'text-white'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/40'
                )}
              >
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-xl",
                      gradient
                    )}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {cat.label}
                </span>
                {!isActive && (
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity rounded-xl',
                      gradient
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
