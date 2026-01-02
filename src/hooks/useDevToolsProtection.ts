/**
 * DevTools Protection Hook
 * 
 * Provides soft protection against casual inspection:
 * - Disables common DevTools shortcuts (F12, Ctrl+Shift+I, etc.)
 * - Disables right-click on images only (not entire page)
 * - Clears console on load
 * - Shows warning message in console
 * 
 * IMPORTANT: This is "security through obscurity" - not real security.
 * Real security is handled by:
 * - Supabase RLS (server-side data protection)
 * - Firebase Auth (encrypted tokens)
 * - Cloudflare Worker (validated uploads)
 * 
 * This hook only runs in PRODUCTION mode.
 */

import { useEffect } from 'react';

// Check if we're in production
const isProduction = import.meta.env.PROD;

export function useDevToolsProtection() {
    useEffect(() => {
        // Skip in development mode
        if (!isProduction) return;

        // --- 1. Console Warning Message ---
        const warningStyle = 'color: red; font-size: 24px; font-weight: bold;';
        const infoStyle = 'color: #888; font-size: 14px;';

        console.clear();
        console.log('%c⛔ STOP!', warningStyle);
        console.log('%cThis browser feature is intended for developers.', infoStyle);
        console.log('%cIf someone told you to paste something here, it\'s likely a scam.', infoStyle);
        console.log('%cFor more info, see: https://en.wikipedia.org/wiki/Self-XSS', infoStyle);

        // --- 2. Disable DevTools Keyboard Shortcuts ---
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+I (macOS DevTools)
            if (e.metaKey && e.altKey && e.key === 'i') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+J (macOS Console)
            if (e.metaKey && e.altKey && e.key === 'j') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+U (macOS View Source)
            if (e.metaKey && e.altKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        };

        // --- 3. Disable Right-Click on Images Only ---
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Only block right-click on images and canvas
            if (target.tagName === 'IMG' || target.tagName === 'CANVAS') {
                e.preventDefault();
                return false;
            }
        };

        // --- 4. Disable Image Dragging ---
        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        };

        // --- 5. Periodic Console Clear (Subtle) ---
        // This makes it harder to see network responses in console
        const clearConsoleInterval = setInterval(() => {
            // Only clear if DevTools might be open (heuristic check)
            const threshold = 160; // DevTools usually adds >160px
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            if (widthDiff > threshold || heightDiff > threshold) {
                console.clear();
                console.log('%c⛔ Inspection Detected', warningStyle);
                console.log('%cThis area is protected.', infoStyle);
            }
        }, 2000);

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown, { capture: true });
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown, { capture: true });
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            clearInterval(clearConsoleInterval);
        };
    }, []);
}

/**
 * Additional CSS-based protection (add to global styles):
 * 
 * img {
 *   -webkit-user-drag: none;
 *   user-select: none;
 *   -webkit-touch-callout: none;
 * }
 */
