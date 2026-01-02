import { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Image } from 'lucide-react';
import { Category, CATEGORIES } from '@/types/gallery';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  isOpen,
  onOpenChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div
        className={cn(
          'relative transition-all duration-300',
          isFocused || query ? 'scale-105' : ''
        )}
      >
        {/* Main Search Bar */}
        <div
          className={cn(
            'search-glass flex items-center gap-3 transition-all duration-300',
            isFocused && 'ring-2 ring-primary/50'
          )}
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              onOpenChange(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search prompts, categories, or keywords..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />

          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pl-3 border-l border-border/50">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-sm">
              <Image className="w-4 h-4" />
              Image
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-sm">
              2:3
            </button>
          </div>
        </div>

        {/* Category Pills (shown when focused) */}
        {(isFocused || query) && (
          <div className="absolute left-0 right-0 -top-14 flex items-center justify-center gap-2 fade-in">
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'glass hover:bg-secondary/80'
              )}
            >
              All
            </button>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'glass hover:bg-secondary/80'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
