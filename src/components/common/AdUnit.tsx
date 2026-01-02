import { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdUnitProps {
    slotId: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    layoutKey?: string; // For In-feed ads
    className?: string;
    style?: React.CSSProperties;
    minHeight?: string | number; // Critical for CLS protection
}

export function AdUnit({
    slotId,
    format = 'auto',
    layoutKey,
    className = '',
    style = {},
    minHeight = '280px' // Default standard height to prevent layout shift
}: AdUnitProps) {
    const [adLoaded, setAdLoaded] = useState(false);
    const [adError, setAdError] = useState(false);

    // Smart Lazy Loading: Load ad only when user scrolls near it (200px before)
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    const initialized = useRef(false);

    useEffect(() => {
        // Only load if in view, not already loaded, and not in error state
        if (inView && !initialized.current && !adError) {
            if (process.env.NODE_ENV === 'production') {
                try {
                    // Double check if script is loaded
                    if (typeof window !== 'undefined') {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        initialized.current = true;
                        setAdLoaded(true);
                    }
                } catch (e) {
                    console.error('AdSense Push Error:', e);
                    setAdError(true);
                }
            }
        }
    }, [inView, adError]);

    // Development Placeholder
    if (process.env.NODE_ENV !== 'production') {
        return (
            <div
                ref={ref}
                className={`bg-gray-800/30 border border-dashed border-gray-600 p-4 flex flex-col items-center justify-center text-center rounded-lg ${className}`}
                style={{ minHeight: minHeight, ...style }}
            >
                <p className="text-gray-400 text-xs font-mono mb-1">GOOGLE ADSENSE</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Slot: {slotId}</p>
                <p className="text-gray-600 text-[9px] mt-2">Lazy Loaded when visible</p>
            </div>
        );
    }

    // Hide completely if error occurs (Anti-AdBlock or Load Fail) to maintain clean UI
    if (adError) return null;

    return (
        <div
            ref={ref}
            className={`ad-container relative w-full overflow-hidden transition-opacity duration-700 ${adLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            style={{ minHeight: adLoaded ? 'auto' : minHeight, ...style }}
        >
            {!adLoaded && (
                <div
                    className="absolute inset-0 bg-muted/5 animate-pulse rounded-lg"
                    aria-hidden="true"
                />
            )}

            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', ...style }}
                data-ad-client="ca-pub-5316139592191698"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
                {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
            />
        </div>
    );
}
