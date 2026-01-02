import React from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type VerificationTier = 'none' | 'blue' | 'gold';

interface VerificationBadgeProps {
    tier: VerificationTier;
    className?: string;
    showTooltip?: boolean;
}

export const VerificationBadge = ({ tier, className, showTooltip = true }: VerificationBadgeProps) => {
    if (!tier || tier === 'none') return null;

    const BadgeIcon = tier === 'gold' ? ShieldCheck : BadgeCheck;
    const colorClass = tier === 'gold' ? 'text-amber-400 fill-amber-500/10' : 'text-blue-400 fill-blue-500/10';
    const tooltipText = tier === 'gold' ? 'Verified Organization' : 'Verified User';

    const BadgeElement = (
        <BadgeIcon
            className={cn("w-4 h-4 ml-1 inline-block align-text-bottom", colorClass, className)}
            strokeWidth={2.5}
        />
    );

    if (!showTooltip) return BadgeElement;

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help inline-flex items-center">
                        {BadgeElement}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-800 text-xs">
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
