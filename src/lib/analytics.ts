/**
 * Google Analytics 4 Integration
 * Tracking utilities for page views and user actions
 */

// GA4 Measurement ID - configured in environment
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// GA4 Event Parameter Types
type GtagCommand = 'js' | 'config' | 'event' | 'set' | 'consent';
type GtagEventParams = Record<string, string | number | boolean | undefined>;
type DataLayerItem = [GtagCommand, ...unknown[]];

declare global {
    interface Window {
        gtag: (command: GtagCommand, targetOrEventName: string | Date, params?: GtagEventParams) => void;
        dataLayer: DataLayerItem[];
    }
}

/**
 * Initialize Google Analytics
 * Call this in App.tsx or main entry point
 */
export function initGA(): void {
    if (typeof window === 'undefined') return;

    // Check if already initialized
    if (window.gtag) return;

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(command: GtagCommand, targetOrEventName: string | Date, params?: GtagEventParams) {
        window.dataLayer.push([command, targetOrEventName, params] as DataLayerItem);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true, // GDPR compliance
        cookie_flags: 'SameSite=None;Secure'
    });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title
    });
}

/**
 * Track custom event
 */
export function trackEvent(
    eventName: string,
    params?: GtagEventParams
): void {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', eventName, params);
}

/**
 * Pre-defined event tracking functions
 */
export const Analytics = {
    // User actions
    copyPrompt: (imageId: string) => {
        trackEvent('copy_prompt', { image_id: imageId });
    },

    saveImage: (imageId: string) => {
        trackEvent('save_image', { image_id: imageId });
    },

    shareImage: (imageId: string, platform: string) => {
        trackEvent('share', {
            image_id: imageId,
            method: platform
        });
    },

    followUser: (targetUserId: string) => {
        trackEvent('follow', { target_user_id: targetUserId });
    },

    unfollowUser: (targetUserId: string) => {
        trackEvent('unfollow', { target_user_id: targetUserId });
    },

    // Authentication
    signUp: (method: string) => {
        trackEvent('sign_up', { method });
    },

    login: (method: string) => {
        trackEvent('login', { method });
    },

    // Search
    search: (query: string, category?: string) => {
        trackEvent('search', {
            search_term: query,
            category
        });
    },

    // Image interactions
    viewImage: (imageId: string, category: string) => {
        trackEvent('view_item', {
            item_id: imageId,
            item_category: category
        });
    },

    uploadImage: () => {
        trackEvent('upload_image');
    },

    // Navigation
    categoryChange: (category: string) => {
        trackEvent('select_content', {
            content_type: 'category',
            item_id: category
        });
    }
};

/**
 * Hook to track page views on route change
 * Use in App.tsx with useLocation
 */
export function usePageTracking(): void {
    // This is a placeholder - implement in component with useEffect + useLocation
}
