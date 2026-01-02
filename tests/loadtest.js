/**
 * k6 Load Test Script for Arti Studio
 * 
 * HOW TO RUN:
 * 1. Install k6: https://k6.io/docs/getting-started/installation/
 * 2. Run: k6 run loadtest.js
 * 3. For cloud: k6 cloud loadtest.js
 * 
 * SCENARIOS:
 * - browse: Feed/Trends browsing (high volume)
 * - search: Search queries (medium volume)
 * - interact: Like/Follow/Copy (low volume, write-heavy)
 * - upload: Image uploads (very low volume)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';
const WORKER_URL = __ENV.WORKER_URL || 'https://your-worker.workers.dev';

// Custom metrics
const errorRate = new Rate('errors');
const feedLatency = new Trend('feed_latency');
const searchLatency = new Trend('search_latency');
const uploadLatency = new Trend('upload_latency');

// ============================================
// LOAD PROFILE
// ============================================

export const options = {
    scenarios: {
        // Scenario 1: Browse Feed/Trends (80% of traffic)
        browse: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 100 },   // Ramp up
                { duration: '3m', target: 500 },   // Sustained load
                { duration: '1m', target: 1000 },  // Peak
                { duration: '1m', target: 0 },     // Ramp down
            ],
            exec: 'browseFeed',
        },

        // Scenario 2: Search (10% of traffic)
        search: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 20 },
                { duration: '3m', target: 100 },
                { duration: '1m', target: 200 },
                { duration: '1m', target: 0 },
            ],
            exec: 'searchImages',
        },

        // Scenario 3: Interactions (8% of traffic, write-heavy)
        interact: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 10 },
                { duration: '3m', target: 50 },
                { duration: '1m', target: 100 },
                { duration: '1m', target: 0 },
            ],
            exec: 'interactWithContent',
        },

        // Scenario 4: Uploads (2% of traffic)
        upload: {
            executor: 'constant-arrival-rate',
            rate: 10,              // 10 uploads per second
            duration: '5m',
            preAllocatedVUs: 20,
            exec: 'uploadImage',
        },
    },

    thresholds: {
        // Response time thresholds
        http_req_duration: ['p(95)<500', 'p(99)<1000'],   // 95% < 500ms, 99% < 1s
        'feed_latency': ['p(95)<300'],                     // Feed should be fast
        'search_latency': ['p(95)<500'],                   // Search slightly slower

        // Error rate thresholds
        'errors': ['rate<0.01'],                           // < 1% error rate
        'http_req_failed': ['rate<0.01'],

        // Rate limit should be < 5%
        'http_req_failed{status:429}': ['rate<0.05'],
    },
};

// ============================================
// TEST FUNCTIONS
// ============================================

// Scenario 1: Browse Feed
export function browseFeed() {
    group('Browse Feed', () => {
        // Load main feed
        const feedRes = http.get(`${SUPABASE_URL}/rest/v1/gallery_images?select=*&order=created_at.desc&limit=30`, {
            headers: {
                'apikey': __ENV.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
            },
        });

        feedLatency.add(feedRes.timings.duration);

        check(feedRes, {
            'feed status 200': (r) => r.status === 200,
            'feed has data': (r) => JSON.parse(r.body).length > 0,
            'feed latency < 500ms': (r) => r.timings.duration < 500,
        }) || errorRate.add(1);

        // Load trending
        const trendRes = http.get(`${SUPABASE_URL}/rest/v1/rpc/get_trending_images_v2`, {
            headers: {
                'apikey': __ENV.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
            },
        });

        check(trendRes, {
            'trending status 200': (r) => r.status === 200,
        }) || errorRate.add(1);
    });

    sleep(Math.random() * 2 + 1); // 1-3s think time
}

// Scenario 2: Search
export function searchImages() {
    const queries = ['design', 'logo', 'website', 'mobile', 'illustration', 'icon'];
    const query = queries[Math.floor(Math.random() * queries.length)];

    group('Search', () => {
        const res = http.get(
            `${SUPABASE_URL}/rest/v1/gallery_images?or=(prompt.ilike.*${query}*,tags.cs.{${query}})&limit=20`,
            {
                headers: {
                    'apikey': __ENV.SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        searchLatency.add(res.timings.duration);

        check(res, {
            'search status 200': (r) => r.status === 200,
            'search latency < 1s': (r) => r.timings.duration < 1000,
        }) || errorRate.add(1);
    });

    sleep(Math.random() * 3 + 2); // 2-5s think time
}

// Scenario 3: Interactions (Like/Follow/Copy)
export function interactWithContent() {
    // Simulate view tracking (batched in frontend, but we test the batch endpoint)
    group('Interactions', () => {
        const viewPayload = JSON.stringify({
            payload: [
                { id: 'test-image-1', count: 1 },
                { id: 'test-image-2', count: 1 },
            ]
        });

        const res = http.post(`${SUPABASE_URL}/rest/v1/rpc/increment_views_batch`, viewPayload, {
            headers: {
                'apikey': __ENV.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
            },
        });

        check(res, {
            'batch view status ok': (r) => r.status >= 200 && r.status < 300,
        }) || errorRate.add(1);
    });

    sleep(Math.random() * 5 + 3); // 3-8s think time
}

// Scenario 4: Upload
export function uploadImage() {
    // Note: Actual file upload requires FormData which k6 supports
    // This tests the worker health/rate limiting
    group('Upload Flow', () => {
        // Test worker health
        const healthRes = http.get(`${WORKER_URL}/health`);

        check(healthRes, {
            'worker healthy': (r) => r.status === 200,
            'circuit breaker closed': (r) => {
                const body = JSON.parse(r.body);
                return body.circuitBreaker === 'CLOSED';
            },
        }) || errorRate.add(1);

        uploadLatency.add(healthRes.timings.duration);
    });

    sleep(Math.random() * 10 + 5); // 5-15s think time
}

// ============================================
// SETUP & TEARDOWN
// ============================================

export function setup() {
    console.log('Starting load test for Arti Studio');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log(`Worker URL: ${WORKER_URL}`);

    // Verify services are up
    const healthRes = http.get(`${WORKER_URL}/health`);
    if (healthRes.status !== 200) {
        throw new Error('Worker is not healthy!');
    }

    return { startTime: Date.now() };
}

export function teardown(data) {
    const duration = (Date.now() - data.startTime) / 1000;
    console.log(`Load test completed in ${duration}s`);
}
