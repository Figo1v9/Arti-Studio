import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Clock } from 'lucide-react';
import { getIconByName, Sparkles } from '@/lib/icons';
import { Category } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryGradient } from '@/constants/categories';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}



export function MobileSearchModal({
  isOpen,
  onClose,
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
}: MobileSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { categories } = useCategories();
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      // Save to recent searches
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
    onQueryChange(term);
    onClose();
  };

  const handleCategorySelect = (catId: string | null) => {
    onCategoryChange(catId as Category);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background"
        >
          {/* Header with Search */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pt-[env(safe-area-inset-top)] border-b border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 p-4">
              {/* Back button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                  placeholder="Search prompts..."
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-2 ring-primary/20 transition-all text-base"
                />
                {query && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onQueryChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-80px-env(safe-area-inset-top))] pb-safe-area-bottom">
            {/* Categories */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(null)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    !selectedCategory
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white/5 border border-white/10'
                  )}
                >
                  All
                </motion.button>
                {categories.map((cat) => {
                  const Icon = getIconByName(cat.icon, Sparkles);
                  const isActive = selectedCategory === cat.id;
                  const gradient = getCategoryGradient(cat.color);

                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategorySelect(isActive ? null : cat.id)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                        isActive
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : 'bg-white/5 border border-white/10'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="p-4 border-t border-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <motion.button
                      key={term}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{term}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}


          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
