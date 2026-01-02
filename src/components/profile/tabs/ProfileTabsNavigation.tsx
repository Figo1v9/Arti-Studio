import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Image, LayoutGrid, Heart, Settings, FolderHeart } from 'lucide-react';

interface ProfileTabsNavigationProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TAB_ICONS: Record<string, React.ElementType> = {
    creations: Image,
    collections: FolderHeart,
    overview: LayoutGrid,
    favorites: Heart,
    settings: Settings,
};

export const ProfileTabsNavigation: React.FC<ProfileTabsNavigationProps> = React.memo(({
    tabs,
    activeTab,
    setActiveTab
}) => {
    return (
        <div className="w-full mb-6 md:mb-8">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex bg-card/30 backdrop-blur-sm p-1.5 rounded-2xl border border-white/5 w-fit">
                {tabs.map((tab) => {
                    const Icon = TAB_ICONS[tab] || LayoutGrid;
                    const isActive = activeTab === tab;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeProfileTab"
                                    className="absolute inset-0 bg-violet-600 rounded-xl"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Tabs - Icons Only */}
            <div className="flex sm:hidden w-full bg-card/30 backdrop-blur-sm p-1.5 rounded-2xl border border-white/5">
                {tabs.map((tab) => {
                    const Icon = TAB_ICONS[tab] || LayoutGrid;
                    const isActive = activeTab === tab;
                    const label = tab.charAt(0).toUpperCase() + tab.slice(1);

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            title={label}
                            aria-label={label}
                            className={cn(
                                "relative flex-1 flex items-center justify-center py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground active:scale-95"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeMobileProfileTab"
                                    className="absolute inset-0 bg-violet-600 rounded-xl"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon className="w-5 h-5 relative z-10" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

ProfileTabsNavigation.displayName = 'ProfileTabsNavigation';
