/**
 * Cloudflare Worker for R2 Image Upload
 * 
 * HIGH-SCALE FEATURES (1M+ users):
 * - Edge Rate Limiting (IP + endpoint)
 * - Circuit Breaker for Firebase Auth
 * - CDN Cache Headers for responses
 * - Request timeouts
 */

export interface Env {
    R2_BUCKET: R2Bucket;
    AI: { run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }> };
    ALLOWED_ORIGINS: string;
    FIREBASE_API_KEY: string;
    ADMIN_UPLOAD_SECRET: string;
    // KV for rate limiting (optional - falls back to in-memory)
    RATE_LIMIT_KV?: KVNamespace;
}

// ============================================
// RATE LIMITING - Edge Layer Protection
// ============================================

interface RateLimitConfig {
    requests: number;  // Max requests
    window: number;    // Time window in seconds
}

// Per-endpoint rate limits
const RATE_LIMITS: Record<string, RateLimitConfig> = {
    '/upload': { requests: 10, window: 60 },    // 10 uploads/min
    '/embeddings': { requests: 30, window: 60 },    // 30 searches/min
    '/delete': { requests: 20, window: 60 },    // 20 deletes/min
    'default': { requests: 100, window: 60 },   // 100 req/min general
};

// In-memory rate limit store (per-isolate, resets on cold start)
// For production: Use Cloudflare KV or Durable Objects
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(ip: string, endpoint: string): string {
    return `rl:${ip}:${endpoint}`;
}

function checkRateLimit(ip: string, endpoint: string): { allowed: boolean; remaining: number; resetAt: number } {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS['default'];
    const key = getRateLimitKey(ip, endpoint);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Create new window if expired or doesn't exist
    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + (config.window * 1000) };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    // Cleanup old entries periodically (every 1000 checks)
    if (Math.random() < 0.001) {
        for (const [k, v] of rateLimitStore.entries()) {
            if (now > v.resetAt) rateLimitStore.delete(k);
        }
    }

    return {
        allowed: entry.count <= config.requests,
        remaining: Math.max(0, config.requests - entry.count),
        resetAt: entry.resetAt,
    };
}

// ============================================
// CIRCUIT BREAKER - Firebase Auth Protection
// ============================================

interface CircuitState {
    failures: number;
    lastFailure: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const firebaseCircuit: CircuitState = { failures: 0, lastFailure: 0, state: 'CLOSED' };
const CIRCUIT_THRESHOLD = 5;      // Open after 5 failures
const CIRCUIT_RESET_MS = 30000;   // Try again after 30s

function isCircuitOpen(): boolean {
    if (firebaseCircuit.state === 'OPEN') {
        if (Date.now() - firebaseCircuit.lastFailure > CIRCUIT_RESET_MS) {
            firebaseCircuit.state = 'HALF_OPEN';
            return false;
        }
        return true;
    }
    return false;
}

function recordFirebaseSuccess() {
    firebaseCircuit.failures = 0;
    firebaseCircuit.state = 'CLOSED';
}

function recordFirebaseFailure() {
    firebaseCircuit.failures++;
    firebaseCircuit.lastFailure = Date.now();
    if (firebaseCircuit.failures >= CIRCUIT_THRESHOLD) {
        firebaseCircuit.state = 'OPEN';
        console.warn('Circuit breaker OPEN for Firebase Auth');
    }
}

// ============================================
// AUTHENTICATION WITH CIRCUIT BREAKER
// ============================================

async function authenticateUser(request: Request, env: Env): Promise<boolean> {
    // Circuit breaker check
    if (isCircuitOpen()) {
        console.warn('Firebase auth skipped - circuit open');
        return false;
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Timeout for Firebase request (5 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            recordFirebaseFailure();
            return false;
        }

        const data = await response.json() as { users?: unknown[] };
        const isValid = Array.isArray(data.users) && data.users.length > 0;

        if (isValid) {
            recordFirebaseSuccess();
        }

        return isValid;

    } catch (e) {
        recordFirebaseFailure();
        console.error('Auth verification failed:', e);
        return false;
    }
}

// ============================================
// HELPERS
// ============================================

function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `gallery/${timestamp}-${randomString}.${extension}`;
}

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
    const origins = (allowedOrigins || '*').split(',').map(o => o.trim());
    const isAllowed = origins.includes(origin) || origins.includes('*');

    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : (origins[0] || '*'),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret',
        'Access-Control-Max-Age': '86400',
    };
}

function rateLimitHeaders(remaining: number, resetAt: number): HeadersInit {
    return {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
    };
}

// ============================================
// MAIN HANDLER
// ============================================

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';
        const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers });
        }

        // ============================================
        // RATE LIMITING CHECK (All endpoints except health)
        // ============================================
        if (url.pathname !== '/health') {
            const endpoint = url.pathname.startsWith('/delete') ? '/delete' : url.pathname;
            const rateLimit = checkRateLimit(clientIP, endpoint);

            if (!rateLimit.allowed) {
                return new Response(
                    JSON.stringify({
                        error: 'Rate limit exceeded',
                        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                    }),
                    {
                        status: 429,
                        headers: {
                            ...headers,
                            ...rateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
                            'Content-Type': 'application/json',
                            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
                        }
                    }
                );
            }
        }

        // ============================================
        // AUTHENTICATION (Skip for health/embeddings)
        // ============================================
        if (url.pathname !== '/health' && url.pathname !== '/embeddings') {
            const adminSecret = request.headers.get('X-Admin-Secret');
            const isAdminAuth = adminSecret && adminSecret === env.ADMIN_UPLOAD_SECRET;
            const isAuthenticated = isAdminAuth || await authenticateUser(request, env);

            if (!isAuthenticated) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized: Invalid or missing token' }),
                    { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            }
        }

        // ============================================
        // ENDPOINTS
        // ============================================

        // Embeddings (Search)
        if (request.method === 'POST' && url.pathname === '/embeddings') {
            try {
                const { text } = await request.json() as { text: string };

                if (!text) {
                    return new Response(
                        JSON.stringify({ error: 'Text is required' }),
                        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
                    );
                }

                const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
                    text: [text]
                });

                return new Response(
                    JSON.stringify({ success: true, embedding: response.data[0] }),
                    {
                        status: 200,
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json',
                            // Cache embeddings for same query (1 hour)
                            'Cache-Control': 'public, max-age=3600',
                        }
                    }
                );

            } catch (error) {
                console.error('AI Embedding error:', error);
                return new Response(
                    JSON.stringify({ error: 'Embedding generation failed' }),
                    { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Upload
        if (request.method === 'POST' && url.pathname === '/upload') {
            try {
                const formData = await request.formData();
                const fileEntry = formData.get('file');

                if (!fileEntry || typeof fileEntry === 'string') {
                    return new Response(
                        JSON.stringify({ error: 'No file provided' }),
                        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
                    );
                }

                const file = fileEntry as File;

                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    return new Response(
                        JSON.stringify({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }),
                        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
                    );
                }

                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    return new Response(
                        JSON.stringify({ error: 'File too large. Maximum size: 10MB' }),
                        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
                    );
                }

                const fileName = generateFileName(file.name);
                const arrayBuffer = await file.arrayBuffer();

                await env.R2_BUCKET.put(fileName, arrayBuffer, {
                    httpMetadata: { contentType: file.type },
                });

                return new Response(
                    JSON.stringify({
                        success: true,
                        fileName: fileName,
                        size: file.size,
                        type: file.type,
                    }),
                    { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            } catch (error) {
                console.error('Upload error:', error);
                return new Response(
                    JSON.stringify({ error: 'Upload failed' }),
                    { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Delete
        if (request.method === 'DELETE' && url.pathname.startsWith('/delete/')) {
            try {
                const fileName = decodeURIComponent(url.pathname.replace('/delete/', ''));
                await env.R2_BUCKET.delete(fileName);

                return new Response(
                    JSON.stringify({ success: true }),
                    { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            } catch (error) {
                console.error('Delete error:', error);
                return new Response(
                    JSON.stringify({ error: 'Delete failed' }),
                    { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Health check with metrics
        if (request.method === 'GET' && url.pathname === '/health') {
            return new Response(
                JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    circuitBreaker: firebaseCircuit.state,
                    rateLimitBuckets: rateLimitStore.size,
                }),
                {
                    status: 200,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store',
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Not found' }),
            { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
    },
};

