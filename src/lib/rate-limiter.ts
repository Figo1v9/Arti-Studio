/**
 * Token Bucket Rate Limiter for Frontend
 * 
 * Prevents spam requests from overwhelming the backend.
 * Memory-efficient implementation using sliding window.
 * 
 * Use cases:
 * - Limit API calls per user action (e.g., like button spam)
 * - Prevent infinite scroll bugs from hammering the server
 * - Throttle search-as-you-type requests
 */

interface RateLimiterConfig {
    maxTokens: number;      // Maximum burst capacity
    refillRate: number;     // Tokens added per second
    refillInterval: number; // How often to refill (ms)
}

interface RateLimiterBucket {
    tokens: number;
    lastRefill: number;
}

const buckets = new Map<string, RateLimiterBucket>();

// Default configurations for different use cases
export const RATE_LIMIT_CONFIGS = {
    // High-frequency actions (views, scrolling)
    highFrequency: { maxTokens: 100, refillRate: 10, refillInterval: 100 },

    // Medium-frequency actions (likes, favorites)
    mediumFrequency: { maxTokens: 30, refillRate: 2, refillInterval: 500 },

    // Low-frequency actions (uploads, follows)
    lowFrequency: { maxTokens: 10, refillRate: 1, refillInterval: 1000 },

    // Search (debounced but still limited)
    search: { maxTokens: 20, refillRate: 5, refillInterval: 200 },
} as const;

/**
 * Check if an action is allowed under rate limiting
 * 
 * @param key - Unique identifier for the rate limit bucket (e.g., 'api:gallery:list')
 * @param config - Rate limit configuration
 * @returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(
    key: string,
    config: RateLimiterConfig = RATE_LIMIT_CONFIGS.mediumFrequency
): boolean {
    const now = Date.now();
    let bucket = buckets.get(key);

    // Create new bucket if doesn't exist
    if (!bucket) {
        bucket = { tokens: config.maxTokens, lastRefill: now };
        buckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / config.refillInterval) * config.refillRate;

    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
    }

    // Check if we have tokens available
    if (bucket.tokens > 0) {
        bucket.tokens--;
        return true;
    }

    return false;
}

/**
 * Rate-limited wrapper for async functions
 * Returns cached/stale result if rate limited
 * 
 * @param key - Rate limit bucket key
 * @param fn - Async function to execute
 * @param fallback - Fallback value if rate limited
 * @param config - Rate limit configuration
 */
export async function withRateLimit<T>(
    key: string,
    fn: () => Promise<T>,
    fallback: T,
    config: RateLimiterConfig = RATE_LIMIT_CONFIGS.mediumFrequency
): Promise<T> {
    if (!checkRateLimit(key, config)) {
        console.warn(`Rate limited: ${key}`);
        return fallback;
    }
    return fn();
}

/**
 * Debounce utility - Only execute after delay with no new calls
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * Throttle utility - Execute at most once per delay period
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let pendingCall: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else if (!pendingCall) {
            // Schedule a trailing call
            pendingCall = setTimeout(() => {
                lastCall = Date.now();
                fn(...args);
                pendingCall = null;
            }, delay - (now - lastCall));
        }
    };
}

/**
 * Cleanup old buckets periodically to prevent memory leaks
 * Call this on app init
 */
export function initRateLimiterCleanup(intervalMs: number = 60000): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes

        for (const [key, bucket] of buckets.entries()) {
            if (now - bucket.lastRefill > maxAge) {
                buckets.delete(key);
            }
        }
    }, intervalMs);
}
