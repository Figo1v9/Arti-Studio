import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeroProps {
    onCopyLink?: () => void;
    copiedLink?: boolean;
    coverImage?: string | null;
}

// Default cover image
const DEFAULT_COVER = 'https://img.freepik.com/free-vector/dark-wavy-background_23-2148388252.jpg?semt=ais_hybrid&w=740&q=80';

export const ProfileHero = React.memo(({ onCopyLink, copiedLink, coverImage }: ProfileHeroProps) => {
    const navigate = useNavigate();
    const backgroundImage = coverImage || DEFAULT_COVER;

    return (
        <div className="relative h-52 sm:h-56 md:h-72 w-full overflow-hidden">
            {/* === Cover Image === */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-indigo-900/20" />

            {/* Fade to content */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            {/* === Navigation === */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-xl bg-black/30 hover:bg-black/50 text-white/90 hover:text-white backdrop-blur-sm border border-white/10 h-10 w-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                {/* Share Button */}
                {onCopyLink && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCopyLink}
                        className="rounded-xl bg-black/30 hover:bg-black/50 text-white/90 hover:text-white backdrop-blur-sm border border-white/10 px-4 h-10 gap-2 transition-colors"
                    >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
                    </Button>
                )}
            </div>
        </div>
    );
});

ProfileHero.displayName = 'ProfileHero';
