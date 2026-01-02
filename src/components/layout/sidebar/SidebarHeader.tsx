import { ChevronLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
            <Link
                to="/explore"
                className={cn(
                    'flex items-center transition-opacity hover:opacity-80',
                    isCollapsed ? 'justify-center w-full' : 'gap-3'
                )}
            >
                {isCollapsed ? (
                    <img
                        src="/arti_studio_icon.png"
                        alt="Arti Studio"
                        className="w-9 h-9 object-contain"
                    />
                ) : (
                    <img
                        src="/arti_studio.png"
                        alt="Arti Studio"
                        className="h-8 w-auto"
                    />
                )}
            </Link>
            {!isCollapsed && (
                <button
                    onClick={onToggleCollapse}
                    className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
            )}
        </div>
    );
}
