import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, UserMinus, Loader2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FollowService, FollowUser } from '@/services/follow.service';
import { useAuth } from '@/components/auth';
import { getAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FollowListModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
    type: 'followers' | 'following';
    profileName?: string;
}

export function FollowListModal({ open, onClose, userId, type, profileName }: FollowListModalProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
    const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

    useEffect(() => {
        if (open && userId) {
            fetchUsers();
        }
    }, [open, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = type === 'followers'
                ? await FollowService.getFollowers(userId)
                : await FollowService.getFollowing(userId);

            setUsers(data);

            // Check follow status for each user if logged in
            if (user) {
                const states: Record<string, boolean> = {};
                for (const u of data) {
                    if (u.id !== user.uid) {
                        states[u.id] = await FollowService.isFollowing(user.uid, u.id);
                    }
                }
                setFollowingStates(states);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (targetUserId: string) => {
        if (!user) {
            toast.error('Please sign in to follow users');
            navigate('/login');
            return;
        }

        setLoadingFollow(targetUserId);
        try {
            const isCurrentlyFollowing = followingStates[targetUserId];

            if (isCurrentlyFollowing) {
                await FollowService.unfollow(user.uid, targetUserId);
                setFollowingStates(prev => ({ ...prev, [targetUserId]: false }));
                toast.success('Unfollowed');
            } else {
                await FollowService.follow(user.uid, targetUserId);
                setFollowingStates(prev => ({ ...prev, [targetUserId]: true }));
                toast.success('Following');
            }
        } catch (error) {
            toast.error('Failed to update follow status');
        } finally {
            setLoadingFollow(null);
        }
    };

    const handleUserClick = (u: FollowUser) => {
        onClose();
        navigate(`/${u.username || u.id}`);
    };

    const title = type === 'followers'
        ? `${profileName ? `${profileName}'s ` : ''}Followers`
        : `${profileName ? `${profileName} is ` : ''}Following`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-white/10 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        List of {type} for {profileName || 'user'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">
                                {type === 'followers'
                                    ? 'No followers yet'
                                    : 'Not following anyone yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    {/* Avatar */}
                                    <button
                                        onClick={() => handleUserClick(u)}
                                        className="shrink-0"
                                    >
                                        <img
                                            src={getAvatarUrl(u.email || 'user', u.avatar_url)}
                                            alt={u.full_name || 'User'}
                                            referrerPolicy="no-referrer"
                                            className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary/50 transition-all"
                                        />
                                    </button>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <button
                                            onClick={() => handleUserClick(u)}
                                            className="text-left w-full"
                                        >
                                            <p className="font-medium text-white truncate hover:text-violet-400 transition-colors">
                                                {u.full_name || u.username || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                @{u.username || 'user'}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Follow Button (not for self) */}
                                    {user && u.id !== user.uid && (
                                        <Button
                                            size="sm"
                                            variant={followingStates[u.id] ? 'outline' : 'default'}
                                            disabled={loadingFollow === u.id}
                                            onClick={() => handleFollowToggle(u.id)}
                                            className={cn(
                                                "shrink-0 min-w-[90px]",
                                                followingStates[u.id]
                                                    ? "border-white/10 hover:border-red-500/50 hover:text-red-400"
                                                    : "bg-violet-600 hover:bg-violet-700"
                                            )}
                                        >
                                            {loadingFollow === u.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : followingStates[u.id] ? (
                                                <>
                                                    <UserMinus className="w-3.5 h-3.5 mr-1" />
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                                                    Follow
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
