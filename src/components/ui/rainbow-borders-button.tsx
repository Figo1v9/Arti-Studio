import React from 'react';
import { cn } from '@/lib/utils';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

/**
 * RainbowButton - A button with animated rainbow gradient border
 * The rainbow animation creates a mesmerizing color-shifting effect
 * Uses ::before for the solid border and ::after for the blur glow effect
 */
export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'rainbow-border',
                    'relative flex items-center justify-center gap-2.5',
                    'px-8 h-14 min-w-[160px]',
                    'bg-slate-950 rounded-full border-none',
                    'text-white font-bold text-lg',
                    'cursor-pointer transition-all duration-200',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

RainbowButton.displayName = 'RainbowButton';

export { RainbowButton as Button };
