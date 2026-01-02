/**
 * Image Optimization Utilities
 * Functions for responsive images with srcset and lazy loading
 */

/**
 * Generate srcset string for responsive images
 * @param baseUrl - The base image URL
 * @param widths - Array of widths to generate
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280]): string {
    // For Supabase Storage URLs, we can add width transform
    if (baseUrl.includes('supabase')) {
        return widths
            .map(w => `${baseUrl}?width=${w} ${w}w`)
            .join(', ');
    }

    // For other URLs, just return the base URL
    return baseUrl;
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object with breakpoint sizes
 */
export function generateSizes(breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    default?: string;
}): string {
    const defaultBreakpoints = {
        sm: '(max-width: 640px) 100vw',
        md: '(max-width: 768px) 50vw',
        lg: '(max-width: 1024px) 33vw',
        default: '25vw'
    };

    const merged = { ...defaultBreakpoints, ...breakpoints };

    return [
        merged.sm,
        merged.md,
        merged.lg,
        merged.default
    ].filter(Boolean).join(', ');
}

/**
 * Create a blur placeholder data URL
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @param color - Background color (hex)
 */
export function createBlurPlaceholder(
    width: number = 10,
    height: number = 10,
    color: string = '#1a1a2e'
): string {
    // Create a simple SVG placeholder
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect width="100%" height="100%" fill="${color}"/>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

/**
 * Get optimized image props for use in img elements
 */
export function getOptimizedImageProps(
    src: string,
    alt: string,
    options?: {
        widths?: number[];
        sizes?: string;
        lazy?: boolean;
        aspectRatio?: number;
    }
): {
    src: string;
    srcSet: string;
    sizes: string;
    alt: string;
    loading: 'lazy' | 'eager';
    decoding: 'async' | 'sync';
    style?: React.CSSProperties;
} {
    const {
        widths = [320, 640, 768, 1024],
        sizes = generateSizes(),
        lazy = true,
        aspectRatio
    } = options || {};

    return {
        src,
        srcSet: generateSrcSet(src, widths),
        sizes,
        alt,
        loading: lazy ? 'lazy' : 'eager',
        decoding: 'async',
        ...(aspectRatio && {
            style: { aspectRatio: `${aspectRatio}` }
        })
    };
}

/**
 * Check if browser supports WebP
 */
export async function supportsWebP(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Convert image URL to WebP if supported
 * (For Supabase Storage URLs)
 */
export function toWebP(url: string): string {
    if (url.includes('supabase')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}format=webp`;
    }
    return url;
}

/**
 * Intersection Observer hook for lazy loading
 * Returns ref and isVisible state
 */
export function createLazyLoadObserver(
    callback: (isVisible: boolean) => void,
    options?: IntersectionObserverInit
): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        callback(true); // Fallback: always visible
        return null;
    }

    return new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                callback(entry.isIntersecting);
            });
        },
        {
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        }
    );
}
