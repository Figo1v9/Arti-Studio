
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, LogIn, Search, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, CATEGORIES } from '@/types/gallery';
import { useAuth } from '@/components/auth';
import { toast } from 'sonner';
import { CATEGORY_ICONS, CATEGORY_GRADIENTS, getGradientShadow } from '@/constants/categories';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { NAV_ITEMS, LIBRARY_ITEMS } from '@/constants/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCategory: Category | null;
    onCategoryChange: (category: Category | null) => void;
}

export function MobileMenu({
    isOpen,
    onClose,
    selectedCategory,
    onCategoryChange,
}: MobileMenuProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
        onClose();
        if (item.requiresAuth && !user) {
            toast.info('Please sign in to use this feature');
            navigate('/login');
            return;
        }

        if (item.id === 'favorites') {
            navigate('/favorites');
            return;
        }

        // Usually navigate to home with query param or just simple navigation
        // Since 'explore' is default index, we might just reload or reset filters
        navigate('/explore');
    };

    const handleLibraryClick = (itemId: string) => {
        onClose();
        if (!user) {
            toast.info('Please sign in to use Library');
            navigate('/login');
            return;
        }
        toast.info('This feature is coming soon');
    };

    const handleCategoryClick = (catId: Category) => {
        onCategoryChange(selectedCategory === catId ? null : catId);
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto glass border-r border-border/50">
                <SheetHeader className="p-4 border-b border-border/30 text-left">
                    <img
                        src="/arti_studio.png"
                        alt="Arti Studio"
                        className="h-7 w-auto"
                    />
                    <SheetTitle className="sr-only">Arti Studio</SheetTitle>
                    <SheetDescription className="sr-only">
                        Mobile navigation menu
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 p-4">
                    {/* Search Button */}
                    <button
                        onClick={() => {
                            onClose();
                            // Trigger search modal - this might need a prop or just rely on global shortcut/bottom nav
                            // For now, let's assume bottom nav search is primary for mobile
                            const searchBtn = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
                            if (searchBtn) searchBtn.click();
                        }}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                            'bg-secondary/40 hover:bg-secondary/60',
                            'border border-border/40 transition-all',
                            'text-muted-foreground hover:text-foreground group'
                        )}
                    >
                        <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="flex-1 text-left text-sm">Search</span>
                    </button>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/40 text-foreground/70 hover:text-foreground transition-all group"
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                                >
                                    <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Categories */}
                    <div>
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                            Categories
                        </h3>
                        <div className="space-y-1">
                            {CATEGORIES.map((cat) => {
                                const Icon = CATEGORY_ICONS[cat.id] || Palette;
                                const gradient = CATEGORY_GRADIENTS[cat.id];
                                const isActive = selectedCategory === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm group',
                                            isActive
                                                ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                                                : 'hover:bg-secondary/40 text-foreground/70 hover:text-foreground'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                                                isActive ? 'bg-white/20' : `bg-gradient-to-br ${gradient}`
                                            )}
                                        >
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>



                    {/* User Section */}
                    {user ? (
                        <div className="mt-auto pt-4 border-t border-border/30">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user.displayName || 'User'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Sign out</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to sign out?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    signOut();
                                                    navigate('/explore');
                                                    onClose();
                                                    toast.success('Signed out successfully');
                                                }}
                                            >
                                                Confirm
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto pt-4 border-t border-border/30">
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                            >
                                <LogIn className="w-5 h-5" />
                                <span className="font-medium">Sign In</span>
                            </button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
