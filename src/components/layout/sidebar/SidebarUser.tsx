import { LogOut, LogIn, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, Profile } from '@/types/database.types'; // Assuming User type is compatible
import { getAvatarUrl } from '@/lib/avatar';
import { NotificationsButton } from '@/components/notifications/NotificationsButton';
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
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

interface FirebaseUserWithExtras extends FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface SidebarUserProps {
    isCollapsed: boolean;
    user: FirebaseUserWithExtras | null;
    profile: Profile | null;
    showSkeleton: boolean;
    onSignOut: () => void;
    onToggleCollapse: () => void;
}

export function SidebarUser({ isCollapsed, user, profile, showSkeleton, onSignOut, onToggleCollapse }: SidebarUserProps) {
    const navigate = useNavigate();
    const displayedUser = user;

    if (!displayedUser && !showSkeleton) return null;

    // Collapsed Mode
    if (isCollapsed && displayedUser) {
        return (
            <div className="px-2 pb-4 space-y-2">
                {/* Notifications */}
                <div className="flex justify-center">
                    <NotificationsButton userId={displayedUser.uid} />
                </div>

                {/* Profile Avatar */}
                <button
                    onClick={() => navigate(profile?.username ? `/${profile.username}` : '/profile')}
                    title="View Public Profile"
                    className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold p-1 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                        {profile?.avatar_url || displayedUser.photoURL ? (
                            <img src={profile?.avatar_url || displayedUser.photoURL || undefined} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            (profile?.full_name || displayedUser.displayName)?.charAt(0) || displayedUser.email?.charAt(0) || 'U'
                        )}
                    </div>
                </button>

                {/* Sign Out Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            title="Sign Out"
                            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sign Out</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to sign out?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onSignOut}>
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Collapse Handler reused here if needed or kept separate */}
                <div className="pt-2 flex justify-center">
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-xl hover:bg-secondary/50 transition-colors border border-border/30"
                    >
                        <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </button>
                </div>
            </div>
        );
    }

    // Expanded Mode
    return (
        <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
                <NotificationsButton userId={displayedUser?.uid} />

                <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 overflow-hidden">
                    {showSkeleton ? (
                        <>
                            <div className="w-10 h-10 rounded-full bg-secondary/60 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-20 bg-secondary/60 rounded animate-pulse" />
                                <div className="h-2 w-32 bg-secondary/60 rounded animate-pulse" />
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(profile?.username ? `/${profile.username}` : '/profile')}
                                className="hover:ring-2 hover:ring-primary/50 rounded-full transition-all shrink-0"
                                title="View Public Profile"
                            >
                                <img
                                    src={getAvatarUrl(displayedUser?.email || 'user', profile?.avatar_url || displayedUser?.photoURL)}
                                    alt="Avatar"
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                />
                            </button>
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => navigate(profile?.username ? `/${profile.username}` : '/profile')}
                            >
                                <p className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
                                    {profile?.full_name || displayedUser?.displayName || displayedUser?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {displayedUser?.email}
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to sign out?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onSignOut}>
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
