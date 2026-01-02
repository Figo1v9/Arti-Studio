import { useState } from 'react';
import { Search, X as XIcon } from 'lucide-react';
import { getIconByName, Palette } from '@/lib/icons';
import { cn, getCategorySlug } from '@/lib/utils';
import { Category } from '@/types/gallery';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryGradient, getGradientShadow } from '@/constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarCategoriesProps {
    isCollapsed: boolean;
    selectedCategory: Category | null;
    onCategoryChange: (category: Category | null) => void;
}

export function SidebarCategories({ isCollapsed, selectedCategory, onCategoryChange }: SidebarCategoriesProps) {
    const { categories } = useCategories();
    const navigate = useNavigate();
    const [categoryQuery, setCategoryQuery] = useState('');

    return (
        <div className={cn("mt-6", isCollapsed ? "px-2" : "px-3")}>
            {/* Separator for collapsed mode */}
            {isCollapsed && (
                <div className="border-t border-border/30 mx-2 mb-3" />
            )}

            {!isCollapsed && (
                <div className="px-4 mb-2 flex items-center justify-between gap-2 h-8">
                    <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex-shrink-0">
                        Categories
                    </h3>

                    <div className="relative flex-1 max-w-[120px] group/search">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 group-focus-within/search:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find..."
                            value={categoryQuery}
                            onChange={(e) => setCategoryQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && categoryQuery.trim()) {
                                    navigate(`/?q=${encodeURIComponent(categoryQuery.trim())}`);
                                }
                            }}
                            className="w-full bg-transparent hover:bg-secondary/30 focus:bg-secondary/30 rounded-md pl-6 pr-5 py-0.5 text-[11px] text-foreground placeholder:text-muted-foreground/40 border border-transparent hover:border-border/20 focus:border-border/30 focus:outline-none transition-all h-6"
                        />
                        {categoryQuery && (
                            <button
                                onClick={() => setCategoryQuery('')}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-muted-foreground/50 hover:text-foreground"
                            >
                                <XIcon className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                    {categories
                        .filter(cat =>
                            !categoryQuery ||
                            cat.label.toLowerCase().includes(categoryQuery.toLowerCase())
                        )
                        .slice(0, (isCollapsed || !categoryQuery) ? (isCollapsed ? 4 : 8) : undefined)
                        .map((cat) => {
                            const Icon = getIconByName(cat.icon, Palette);
                            const gradient = getCategoryGradient(cat.color);
                            const catSlug = getCategorySlug(cat.id);
                            const selectedSlug = selectedCategory ? getCategorySlug(selectedCategory) : null;
                            const isActive = selectedSlug === catSlug;

                            const ButtonContent = (
                                <button
                                    onClick={() => onCategoryChange(isActive ? null : cat.id as Category)}
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-xl transition-all text-sm group relative',
                                        isActive
                                            ? 'text-white'
                                            : 'hover:bg-secondary/40 text-foreground/70 hover:text-foreground',
                                        isCollapsed ? 'justify-center py-1.5' : 'px-4 py-2.5'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={cn(
                                                "absolute inset-0 bg-gradient-to-r z-0 rounded-xl",
                                                gradient
                                            )}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <div
                                        className={cn(
                                            'rounded-lg flex items-center justify-center transition-all relative z-10',
                                            isActive ? 'bg-white/20' : `bg-gradient-to-br ${gradient}`,
                                            isCollapsed ? 'w-8 h-8 shadow-md' : 'w-7 h-7'
                                        )}
                                        style={{
                                            boxShadow: isCollapsed && !isActive ? `0 3px 10px -3px ${getGradientShadow(gradient)}` : undefined,
                                        }}
                                    >
                                        <Icon className={cn("text-white", isCollapsed ? "w-4 h-4" : "w-4 h-4")} />
                                    </div>
                                    {!isCollapsed && <span className="font-medium relative z-10">{cat.label}</span>}
                                </button>
                            );

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    transition={{ duration: 0.15 }}
                                    key={cat.id}
                                >
                                    {isCollapsed ? (
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                {ButtonContent}
                                            </TooltipTrigger>
                                            <TooltipContent side="right" sideOffset={12} className="font-medium">
                                                {cat.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        ButtonContent
                                    )}
                                </motion.div>
                            );
                        })}
                </AnimatePresence>
            </div>
        </div>
    );
}
