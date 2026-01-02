import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Share2, UserMinus, UserPlus, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileActionsProps {
    authLoading: boolean;
    isOwner: boolean;
    setIsEditing: (value: boolean) => void;
    handleCopyProfileLink: () => void;
    copiedLink: boolean;
    handleFollowToggle: () => void;
    isLoadingFollow: boolean;
    isFollowing: boolean | null;
    profileName?: string;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
    authLoading,
    isOwner,
    setIsEditing,
    handleCopyProfileLink,
    copiedLink,
    handleFollowToggle,
    isLoadingFollow,
    isFollowing,
    profileName
}) => {
    const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

    // Show skeleton if auth is loading OR if following status is determined (null)
    const isLoadingState = authLoading || (isFollowing === null && !isOwner);

    // Handle follow button click - only show confirmation for unfollow
    const handleFollowClick = () => {
        if (isFollowing) {
            setShowUnfollowConfirm(true);
        } else {
            handleFollowToggle();
        }
    };

    // Confirm unfollow
    const confirmUnfollow = () => {
        setShowUnfollowConfirm(false);
        handleFollowToggle();
    };

    return (
        <>
            <div className="flex gap-2 justify-center md:justify-end w-full md:w-auto">
                {isLoadingState ? (
                    /* Loading Skeleton */
                    <div className="flex gap-2 w-full md:w-auto justify-center">
                        <div className="h-10 w-10 md:w-12 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-10 flex-1 md:flex-none md:w-28 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                ) : isOwner ? (
                    /* Owner Actions */
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 md:flex-none bg-violet-600 hover:bg-violet-500 text-white h-10 px-5 rounded-xl font-medium transition-colors"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button
                            onClick={handleCopyProfileLink}
                            variant="outline"
                            className="h-10 w-10 md:w-auto md:px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                        >
                            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            <span className="hidden md:inline ml-2">{copiedLink ? 'Copied' : 'Share'}</span>
                        </Button>
                    </div>
                ) : (
                    /* Visitor Actions */
                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Share Button */}
                        <Button
                            onClick={handleCopyProfileLink}
                            variant="outline"
                            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                        >
                            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </Button>

                        {/* Follow/Unfollow Button */}
                        <motion.button
                            layout
                            onClick={handleFollowClick}
                            disabled={isLoadingFollow}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={cn(
                                "relative h-10 flex-1 md:flex-none md:min-w-[130px] px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200",
                                isFollowing
                                    ? "border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                                    : "bg-violet-600 hover:bg-violet-500 text-white"
                            )}
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {isLoadingFollow ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"
                                    />
                                ) : isFollowing ? (
                                    <motion.div
                                        key="following"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="flex items-center gap-2"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                        <span>Unfollow</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="follow"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="flex items-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Follow</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Unfollow Confirmation Dialog */}
            <AlertDialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
                <AlertDialogContent className="bg-[#111] border-white/10 text-white max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unfollow {profileName || 'this user'}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            You will no longer see their creations in your Following feed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmUnfollow}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                        >
                            Unfollow
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
