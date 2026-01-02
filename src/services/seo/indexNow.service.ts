/**
 * ═══════════════════════════════════════════════════════════════
 * 🚀 IndexNow Service - Instant Search Engine Indexing
 * ═══════════════════════════════════════════════════════════════
 * 
 * IndexNow allows instant notification to search engines when content changes.
 * Supported by: Bing, Yandex, Seznam.cz, Naver, and others.
 * 
 * Benefits:
 * - Instant indexing (minutes vs days)
 * - No crawl budget waste
 * - Real-time content updates
 */

const SITE_DOMAIN = 'https://artistudio.fun';

// IndexNow API Key - Should be stored in env, but for now we generate it
// This key should also exist as a file at /indexnow-key.txt
const INDEX_NOW_KEY = 'arti-studio-indexnow-2026-key';

interface IndexNowResult {
    success: boolean;
    message: string;
    submittedUrls: string[];
    failedUrls: string[];
}

/**
 * Submit URLs to IndexNow for instant indexing
 * Submits to multiple search engines simultaneously
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
    if (!urls.length) {
        return {
            success: false,
            message: 'No URLs provided',
            submittedUrls: [],
            failedUrls: [],
        };
    }

    // Normalize URLs
    const normalizedUrls = urls.map(url => {
        if (url.startsWith('/')) {
            return `${SITE_DOMAIN}${url}`;
        }
        return url;
    });

    // IndexNow endpoints (submit to all for maximum coverage)
    const endpoints = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
        'https://yandex.com/indexnow',
    ];

    const payload = {
        host: 'artistudio.fun',
        key: INDEX_NOW_KEY,
        keyLocation: `${SITE_DOMAIN}/${INDEX_NOW_KEY}.txt`,
        urlList: normalizedUrls,
    };

    const results = await Promise.allSettled(
        endpoints.map(endpoint =>
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(payload),
            })
        )
    );

    const successCount = results.filter(
        r => r.status === 'fulfilled' && (r.value.status === 200 || r.value.status === 202)
    ).length;

    return {
        success: successCount > 0,
        message: `Submitted to ${successCount}/${endpoints.length} indexing services`,
        submittedUrls: normalizedUrls,
        failedUrls: [],
    };
}

/**
 * Submit a single new image to IndexNow
 * Call this after uploading a new image to the gallery
 */
export async function notifyNewImage(imageId: string): Promise<IndexNowResult> {
    return submitToIndexNow([`/image/${imageId}`]);
}

/**
 * Submit a new user profile to IndexNow
 */
export async function notifyNewProfile(username: string): Promise<IndexNowResult> {
    return submitToIndexNow([`/user/${username}`]);
}

/**
 * Submit multiple URLs in batch (max 10,000 per request)
 * Use this for bulk operations like sitemap regeneration
 */
export async function batchSubmitUrls(urls: string[]): Promise<IndexNowResult> {
    // IndexNow allows up to 10,000 URLs per request
    const BATCH_SIZE = 10000;
    const batches = [];

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        batches.push(urls.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(
        batches.map(batch => submitToIndexNow(batch))
    );

    const allSubmitted = results.flatMap(r => r.submittedUrls);
    const allFailed = results.flatMap(r => r.failedUrls);
    const allSuccessful = results.every(r => r.success);

    return {
        success: allSuccessful,
        message: `Submitted ${allSubmitted.length} URLs in ${batches.length} batches`,
        submittedUrls: allSubmitted,
        failedUrls: allFailed,
    };
}

/**
 * Notify about category page updates
 */
export async function notifyCategoryUpdate(categoryId: string): Promise<IndexNowResult> {
    return submitToIndexNow([
        `/category/${categoryId}`,
        '/explore',
        '/trends',
    ]);
}
