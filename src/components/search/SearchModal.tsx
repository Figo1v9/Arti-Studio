import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, CornerDownLeft, Loader2 } from 'lucide-react';
import { Category, CATEGORIES, GalleryImage } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { useGallerySearch } from '@/hooks/useGallery';
import { useDebounce } from 'react-use';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  onImageSelect: (image: GalleryImage) => void;
  // images prop removed as we use server search
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  design: 'from-violet-500 to-purple-600',
  architecture: 'from-blue-500 to-cyan-500',
  interior: 'from-amber-500 to-orange-500',
  fashion: 'from-pink-500 to-rose-500',
  art: 'from-red-500 to-pink-500',
  coding: 'from-emerald-500 to-teal-500',
  lovable: 'from-rose-500 to-red-500',
  bolt: 'from-yellow-400 to-amber-500',
  base44: 'from-cyan-500 to-blue-500',
  vite: 'from-orange-500 to-yellow-500',
};

export function SearchModal({
  isOpen,
  onClose,
  query,
  onQueryChange,
  onImageSelect,
}: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Sync local query with prop when modal opens
  useEffect(() => {
    setLocalQuery(query);
    setDebouncedQuery(query);
  }, [query, isOpen]);

  // Debounce query update for API call
  useDebounce(
    () => {
      setDebouncedQuery(localQuery);
    },
    300,
    [localQuery]
  );

  // Server-side search
  const { data: searchResults = [], isLoading } = useGallerySearch(debouncedQuery);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      // We do NOT clear the query here anymore, to persist state or allow cancelling without side effects.
      // If the user wants to clear, they can delete the text.
    }, 200);
  };

  const handleSearchSubmit = () => {
    if (!localQuery.trim()) return;

    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onQueryChange(localQuery); // Update global state
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectImage = (image: GalleryImage) => {
    onImageSelect(image);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center pt-[15vh]',
        'transition-all duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden',
          'glass border border-border/50',
          'transition-all duration-300',
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border/30">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search prompts..."
            className="flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>
            </div>
          )}

          {!isLoading && localQuery.trim() && (
            <div className="px-5 py-3 text-sm text-muted-foreground">
              {searchResults.length} results found
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              className="pb-2"
            >
              {searchResults.map((image) => {
                const gradient = CATEGORY_GRADIENTS[image.category] || 'from-gray-500 to-gray-600';
                const category = CATEGORIES.find(c => c.id === image.category);

                return (
                  <motion.button
                    key={image.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    onClick={() => handleSelectImage(image)}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-secondary/50 transition-colors text-left group"
                  >
                    {/* Thumbnail with gradient border */}
                    <div className={cn(
                      'relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0',
                      'ring-2 ring-offset-2 ring-offset-background',
                      `ring-gradient-to-r ${gradient}`
                    )}
                      style={{
                        background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      }}
                    >
                      <div className={cn(
                        'absolute inset-0 rounded-xl p-0.5 bg-gradient-to-br',
                        gradient
                      )}>
                        <div className="w-full h-full rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {image.prompt.slice(0, 60)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {image.author} • {category?.label || image.category}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {!isLoading && localQuery.trim() && searchResults.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-muted-foreground">No results found for "{localQuery}"</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          )}

          {!localQuery.trim() && (
            <div className="px-5 py-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['cyberpunk', 'minimalist', 'portrait', 'landscape', 'architecture', 'fashion'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLocalQuery(term)}
                    className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 text-xs text-muted-foreground">
          <button
            onClick={handleSearchSubmit}
            className="flex items-center gap-4 hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3.5 h-3.5" />
              to search
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 text-[10px]">esc</kbd>
              to close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
