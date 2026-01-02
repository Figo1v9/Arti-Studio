import React from 'react';
import { Shield, BadgeCheck, Calendar } from 'lucide-react';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { formatDate } from '@/lib/utils';
import { UserProfile } from '../types';

interface ProfileInfoProps {
    viewedProfile: UserProfile;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ viewedProfile }) => {
    const isAdmin = viewedProfile.role === 'admin';

    return (
        <div className="space-y-2">
            {/* Name & Badges */}
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center">
                    {viewedProfile.full_name || 'User'}
                    <VerificationBadge tier={viewedProfile.verification_tier} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ml-2" />
                </h1>
                {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                        <Shield className="w-3 h-3" />
                        Admin
                    </span>
                )}
            </div>

            {/* Username */}
            <p className="text-violet-400/90 font-medium text-base md:text-lg">
                @{viewedProfile.username || 'user'}
            </p>

            {/* Bio */}
            {
                viewedProfile.bio && (
                    <p className="text-gray-300/80 text-sm md:text-base leading-relaxed whitespace-pre-wrap max-w-xl mx-auto md:mx-0 pt-1">
                        {viewedProfile.bio}
                    </p>
                )
            }

            {/* Join Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 justify-center md:justify-start">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {formatDate(viewedProfile.created_at)}</span>
            </div>
        </div >
    );
};
