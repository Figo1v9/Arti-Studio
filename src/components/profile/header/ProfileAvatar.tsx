import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/avatar';
import { UserProfile } from '../types';

interface ProfileAvatarProps {
    viewedProfile: UserProfile;
    isOwner: boolean;
    isUploadingAvatar: boolean;
    handleAvatarClick: () => void;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    viewedProfile,
    isOwner,
    isUploadingAvatar,
    handleAvatarClick,
    handleAvatarUpload,
    fileInputRef
}) => {
    const isAdmin = viewedProfile.role === 'admin';
    const verificationTier = viewedProfile.verification_tier || 'none';

    // Determine border gradient based on verification tier
    const getBorderGradient = () => {
        if (verificationTier === 'gold') {
            return "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600"; // Gold verified
        }
        if (verificationTier === 'blue') {
            return "bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400"; // Blue verified
        }
        if (isAdmin) {
            return "bg-gradient-to-br from-amber-500/50 via-yellow-500/30 to-amber-600/50"; // Admin
        }
        return "bg-gradient-to-br from-violet-500/30 via-indigo-500/20 to-purple-500/30"; // Default
    };

    return (
        <div className="shrink-0 mx-auto md:mx-0 relative z-20">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn("relative group", isOwner ? "cursor-pointer" : "")}
            >
                {/* Avatar Container with verification-based border */}
                <div className="relative">
                    {/* Outer ring - verification tier based */}
                    <div className={cn(
                        "absolute -inset-1 rounded-[28px] md:rounded-[32px] transition-all duration-300",
                        getBorderGradient()
                    )} />

                    {/* Inner container */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-3xl md:rounded-[28px] p-[3px] bg-background">
                        <div className="w-full h-full rounded-[22px] md:rounded-[24px] overflow-hidden bg-card">
                            <img
                                src={getAvatarUrl(viewedProfile.email || 'user', viewedProfile.avatar_url)}
                                alt={viewedProfile.full_name || 'Profile'}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        </div>
                    </div>

                    {/* Role Badge - Admin only */}
                    {isAdmin && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white p-2 rounded-xl border-2 border-background">
                            <Shield className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Upload Button - Only for owner */}
                {isOwner && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAvatarClick}
                        className="absolute -bottom-2 -right-2 bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl border-2 border-background transition-colors"
                    >
                        {isUploadingAvatar ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Camera className="w-4 h-4" />
                        )}
                    </motion.button>
                )}
            </motion.div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
            />
        </div>
    );
};
