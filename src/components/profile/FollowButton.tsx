import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth';
import { FollowService } from '@/services/follow.service';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    onToggle?: (newState: boolean) => void;
}

export function FollowButton({
    userId,
    initialIsFollowing = false,
    className,
    size = 'default',
    variant,
    onToggle
}: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card clicks

        if (!user) {
            toast.error("Please sign in to follow creators");
            return;
        }

        if (user.uid === userId) {
            toast.error("You cannot follow yourself");
            return;
        }

        setIsLoading(true);
        try {
            let success = false;

            if (isFollowing) {
                success = await FollowService.unfollow(user.uid, userId);
                if (success) {
                    setIsFollowing(false);
                    toast.success("Unfollowed user");
                }
            } else {
                success = await FollowService.follow(user.uid, userId);
                if (success) {
                    setIsFollowing(true);
                    toast.success("Following user");
                }
            }

            if (success && onToggle) {
                onToggle(!isFollowing);
            }
        } catch (error) {
            console.error("Follow action failed", error);
            toast.error("Failed to update follow status");
        } finally {
            setIsLoading(false);
        }
    };

    // Derived variant if not provided: Outline (if following) vs Default (if not)
    const buttonVariant = variant || (isFollowing ? "outline" : "default");

    return (
        <Button
            size={size}
            variant={buttonVariant}
            className={cn(
                "transition-all duration-300",
                isFollowing
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-red-400 hover:border-red-400/50"
                    : "bg-white text-black hover:bg-gray-200",
                className
            )}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    Follow
                </>
            )}
        </Button>
    );
}
