import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types/database.types';
import { getAvatarUrl } from '@/lib/avatar';
import {
    Calendar,
    Mail,
    Shield,
    User,
    CheckCircle,
    Ban,
    Heart,
    Copy,
    ExternalLink,
    Crown,
    UserCheck,
    Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getFavoritesCount } from '@/services/favorites.service';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { adminUpdateProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Extended user type that may include stats from the admin users table
 */
interface UserWithOptionalStats extends Profile {
    stats?: {
        followersCount: number;
        totalCopies: number;
        totalFavorites: number;
        imagesCount: number;
    };
}

interface UserDetailsModalProps {
    user: UserWithOptionalStats | null;
    open: boolean;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

export function UserDetailsModal({ user, open, onClose, onDelete }: UserDetailsModalProps) {
    // Only fetch favorites if stats are not already provided
    const hasStats = !!user?.stats;

    const { data: favoritesCount = 0, isLoading: loadingFavorites } = useQuery({
        queryKey: ['admin-user-favorites', user?.id],
        queryFn: async () => {
            if (!user?.id) return 0;
            return await getFavoritesCount(user.id);
        },
        enabled: !!user?.id && open && !hasStats,
    });

    // Use provided stats or fallback to fetched data
    const displayFavorites = hasStats ? user.stats!.totalFavorites : favoritesCount;
    const displayFollowers = hasStats ? user.stats!.followersCount : 0;
    const displayCopies = hasStats ? user.stats!.totalCopies : 0;
    const displayImages = hasStats ? user.stats!.imagesCount : 0;

    const [verificationTier, setVerificationTier] = React.useState<string>('none');
    const [isPremium, setIsPremium] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (user) {
            setVerificationTier(user.verification_tier || 'none');
            setIsPremium(user.is_premium || false);
        }
    }, [user]);

    const handleCopyId = () => {
        if (user?.id) {
            navigator.clipboard.writeText(user.id);
            toast.success('User ID copied');
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-[#0a0a0f] border-white/10 text-white p-0 gap-0 overflow-hidden">
                {/* Header Banner */}
                <div className="relative h-20 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-fuchsia-600/30">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjAzIiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-50" />
                </div>

                {/* Avatar overlapping banner */}
                <div className="relative px-6 -mt-12">
                    <div className="flex items-end gap-4">
                        {/* Avatar with dynamic verification border */}
                        <div className={cn(
                            "w-20 h-20 rounded-2xl p-1 shadow-xl",
                            verificationTier === 'gold'
                                ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600"
                                : verificationTier === 'blue'
                                    ? "bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400"
                                    : "bg-[#0a0a0f]"
                        )}>
                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900">
                                <img
                                    src={getAvatarUrl(user.email || 'u', user.avatar_url)}
                                    alt={user.full_name || 'User'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="pb-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold truncate">{user.full_name || 'Anonymous'}</h3>
                                {user.role === 'admin' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full">ADMIN</span>
                                )}
                                {isPremium && (
                                    <Crown className="w-4 h-4 text-violet-400" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">@{user.username || 'user'}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 space-y-5">
                    {/* Quick Info Row */}
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                            </span>
                        </div>
                        <button
                            onClick={handleCopyId}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground font-mono">{user.id.slice(0, 8)}...</span>
                        </button>
                    </div>

                    {/* User Statistics - Enhanced Display */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                            <UserCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-emerald-400">
                                {displayFollowers.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400/70 uppercase">Followers</div>
                        </div>

                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                            <Copy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-amber-400">
                                {displayCopies.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-amber-400/70 uppercase">Copies</div>
                        </div>

                        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-center">
                            <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-rose-400">
                                {hasStats ? displayFavorites.toLocaleString() : (loadingFavorites ? '...' : displayFavorites.toLocaleString())}
                            </div>
                            <div className="text-[10px] text-rose-400/70 uppercase">Favorites</div>
                        </div>

                        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-center">
                            <ImageIcon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-violet-400">
                                {displayImages.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-violet-400/70 uppercase">Images</div>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Verification */}
                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                                Verification Badge
                            </label>
                            <Select
                                value={verificationTier}
                                onValueChange={async (value) => {
                                    setVerificationTier(value);
                                    const result = await adminUpdateProfile(user.id, { verification_tier: value });
                                    if (!result.success) {
                                        toast.error('Failed to update');
                                        setVerificationTier(user.verification_tier || 'none');
                                    } else {
                                        toast.success('Badge updated');
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-10">
                                    <SelectValue placeholder="Select tier" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                                    <SelectItem value="none">
                                        <span className="text-muted-foreground">No Badge</span>
                                    </SelectItem>
                                    <SelectItem value="blue">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-400" />
                                            <span>Blue (Verified)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="gold">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-amber-400" />
                                            <span>Gold (Organization)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Premium */}
                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                                Premium Status
                            </label>
                            <div className="flex items-center justify-between h-10 px-3 bg-white/5 rounded-lg border border-white/10">
                                <span className={cn(
                                    "text-sm font-medium",
                                    isPremium ? "text-violet-400" : "text-muted-foreground"
                                )}>
                                    {isPremium ? '✨ Premium' : 'Standard'}
                                </span>
                                <Switch
                                    checked={isPremium}
                                    onCheckedChange={async (checked) => {
                                        setIsPremium(checked);
                                        const result = await adminUpdateProfile(user.id, { is_premium: checked });
                                        if (!result.success) {
                                            toast.error(`Failed: ${result.error}`);
                                            setIsPremium(user.is_premium || false);
                                        } else {
                                            toast.success('Premium updated');
                                        }
                                    }}
                                    className="data-[state=checked]:bg-violet-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={() => window.open(`/${user.username}`, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Profile
                        </Button>
                        {onDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                onClick={() => {
                                    onDelete(user.id);
                                    onClose();
                                }}
                            >
                                <Ban className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-muted-foreground hover:text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
