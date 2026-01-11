/**
 * ═══════════════════════════════════════════════════════════════
 * 🔄 Service Worker Update Manager - Enterprise Grade
 * ═══════════════════════════════════════════════════════════════
 * 
 * Handles automatic SW updates without requiring manual cache clear.
 * Uses the "skipWaiting" + "clientsClaim" pattern for instant updates.
 */

/**
 * Check for SW updates and apply them immediately
 */
export async function checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return false;

        // Check for update
        await registration.update();

        // If there's a waiting worker, activate it immediately
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return true;
        }

        return false;
    } catch (error) {
        console.warn('[SW] Update check failed:', error);
        return false;
    }
}

/**
 * Force reload the page when new content is available
 */
export function setupAutoReload(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New SW has taken control - reload to get fresh content
        window.location.reload();
    });
}

/**
 * Clear all caches - use sparingly
 */
export async function clearAllCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Failed to clear caches:', error);
    }
}

/**
 * Get current SW status
 */
export async function getSwStatus(): Promise<{
    active: boolean;
    waiting: boolean;
    installing: boolean;
}> {
    if (!('serviceWorker' in navigator)) {
        return { active: false, waiting: false, installing: false };
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return { active: false, waiting: false, installing: false };
        }

        return {
            active: !!registration.active,
            waiting: !!registration.waiting,
            installing: !!registration.installing,
        };
    } catch {
        return { active: false, waiting: false, installing: false };
    }
}

/**
 * Initialize SW update monitoring
 * Call this once in your app entry point
 */
export function initSwUpdateMonitor(): void {
    // Setup auto-reload on SW update
    setupAutoReload();

    // Check for updates on page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkForUpdates();
        }
    });

    // Check for updates periodically (every 5 minutes)
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            checkForUpdates();
        }
    }, 5 * 60 * 1000);

    // Initial check
    setTimeout(checkForUpdates, 3000);
}
