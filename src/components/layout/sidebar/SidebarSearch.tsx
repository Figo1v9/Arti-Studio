import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarSearchProps {
    isCollapsed: boolean;
    onSearchFocus: () => void;
}

export function SidebarSearch({ isCollapsed, onSearchFocus }: SidebarSearchProps) {
    return (
        <div className={cn('p-3', isCollapsed ? 'px-2' : 'px-4')}>
            <motion.button
                onClick={onSearchFocus}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'bg-secondary/40 hover:bg-secondary/60',
                    'border border-border/40 transition-all',
                    'text-muted-foreground hover:text-foreground group',
                    isCollapsed && 'justify-center px-3'
                )}
            >
                <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left text-sm">Search</span>
                        <kbd className="px-2 py-1 text-xs bg-muted/40 rounded-lg text-muted-foreground/70 border border-border/40">
                            ⌘K
                        </kbd>
                    </>
                )}
            </motion.button>
        </div>
    );
}
