import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/navigation';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGradientShadow } from '@/constants/categories';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Category } from '@/types/gallery';
import { useAuth } from '@/components/auth';

interface SidebarNavigationProps {
    isCollapsed: boolean;
    selectedCategory: Category | null;
    onNavClick: (item: typeof NAV_ITEMS[0]) => void;
}

export function SidebarNavigation({ isCollapsed, selectedCategory, onNavClick }: SidebarNavigationProps) {
    const location = useLocation();
    const { profile } = useAuth();

    const getLinkTo = (item: typeof NAV_ITEMS[0]) => {
        if (item.id === 'favorites') return '/favorites';
        if (item.id === 'following') return '/following';
        if (item.id === 'trends') return '/trends';
        if (item.id === 'profile') {
            return profile?.username ? `/${profile.username}` : '/profile';
        }
        if (item.id === 'explore') return '/explore';
        return '/explore';
    };

    return (
        <nav className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
            {NAV_ITEMS.map((item) => {
                const isActive = (() => {
                    if (item.id === 'favorites') return location.pathname.startsWith('/favorites');
                    if (item.id === 'following') return location.pathname.startsWith('/following');
                    if (item.id === 'trends') return location.pathname.startsWith('/trends');
                    if (item.id === 'profile') {
                        // Check both /profile and /{username}
                        if (location.pathname === '/profile') return true;
                        if (profile?.username && location.pathname === `/${profile.username}`) return true;
                        return false;
                    }
                    if (item.id === 'explore') return location.pathname === '/explore' && !selectedCategory;
                    return false;
                })();

                const linkElement = (
                    <Link
                        key={item.id}
                        to={getLinkTo(item)}
                        onClick={(e) => {
                            // Let the Link handle navigation usually, but we keep onNavClick if it does extra logic
                            // Actually, onNavClick mainly just navigates. We can keep it for custom logic if any.
                            if (item.requiresAuth) {
                                // If auth required, we might want to intercept.
                                // But for SEO, the link should exist.
                                // We can use onNavClick solely for the interception logic.
                                e.preventDefault();
                                onNavClick(item);
                            } else {
                                onNavClick(item);
                            }
                        }}
                        className={cn(
                            'block w-full flex items-center gap-3 transition-all group relative',
                            isCollapsed
                                ? 'justify-center py-1.5'
                                : 'px-4 py-3 rounded-xl',
                            isActive
                                ? 'text-white'
                                : 'hover:bg-secondary/40 text-foreground/70 hover:text-foreground'
                        )}
                        style={{
                            boxShadow: !isCollapsed && isActive ? `0 4px 15px -4px ${getGradientShadow(item.gradient)}` : undefined,
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="sidebar-nav-active"
                                className={cn(
                                    "absolute inset-0 bg-gradient-to-r shadow-lg z-0",
                                    item.gradient,
                                    "rounded-xl"
                                )}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div
                            className={cn(
                                'flex items-center justify-center transition-all relative z-10',
                                isCollapsed
                                    ? cn(
                                        'w-10 h-10 rounded-xl',
                                        isActive
                                            ? 'bg-white/20 ring-2 ring-white/30'
                                            : `bg-gradient-to-br ${item.gradient} hover:scale-105 shadow-lg`
                                    )
                                    : cn(
                                        'w-9 h-9 rounded-xl',
                                        isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}`
                                    )
                            )}
                            style={{
                                boxShadow: isCollapsed && !isActive ? `0 4px 12px -4px ${getGradientShadow(item.gradient)}` : undefined,
                            }}
                        >
                            <item.icon className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium relative z-10">{item.label}</span>}
                    </Link>
                );

                if (isCollapsed) {
                    return (
                        <Tooltip key={item.id} delayDuration={0}>
                            <TooltipTrigger asChild>
                                {linkElement}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12} className="font-medium">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    );
                }

                return linkElement;
            })}
        </nav>
    );
}
