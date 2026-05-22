/**
 * ═══════════════════════════════════════════════════════════════
 * 🗺️ Arti Studio - Enterprise-Grade Sitemap Generator
 * ═══════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Dynamic sitemap from Supabase database
 * - Image sitemap with full metadata
 * - Video sitemap support (future)
 * - News sitemap for trending content
 * - Automatic priority calculation
 * - Proper XML escaping
 * - IndexNow ping after generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ═══════════════════════════════════════════════════════════════
// ⚠️ الدومين الرسمي الوحيد - لا تغيره!
// ═══════════════════════════════════════════════════════════════
const DOMAIN = 'https://artistudio.fun';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️ Supabase credentials not found. Generating basic sitemap only.');
}

const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// ═══════════════════════════════════════════════════════════════
// STATIC ROUTES CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const STATIC_ROUTES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/explore', priority: '0.9', changefreq: 'hourly' },
    { path: '/trends', priority: '0.9', changefreq: 'hourly' },
    { path: '/search', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    { path: '/cookies', priority: '0.3', changefreq: 'yearly' },
    { path: '/dmca', priority: '0.3', changefreq: 'yearly' },
];

// ═══════════════════════════════════════════════════════════════
// XML ESCAPE UTILITY
// ═══════════════════════════════════════════════════════════════
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

// URL encode for sitemap (handles special chars in URLs)
function encodeUrl(url) {
    return url
        .replace(/&/g, '&amp;')
        .replace(/ /g, '%20');
}

// ═══════════════════════════════════════════════════════════════
// MAIN SITEMAP GENERATION
// ═══════════════════════════════════════════════════════════════
async function generateSitemap() {
    console.log('🚀 Starting Enterprise Sitemap Generation...');
    console.log(`📍 Domain: ${DOMAIN}`);

    const now = new Date();
    const date = now.toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // ═══════════════════════════════════════════════════════════
    // 1. STATIC ROUTES
    // ═══════════════════════════════════════════════════════════
    console.log('📄 Adding static routes...');
    STATIC_ROUTES.forEach(route => {
        xml += `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    });

    if (supabase) {
        // ═══════════════════════════════════════════════════════
        // 2. CATEGORIES
        // ═══════════════════════════════════════════════════════
        console.log('📦 Fetching categories...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('id, label');

        if (catError) {
            console.error('❌ Error fetching categories:', catError.message);
        } else if (categories) {
            console.log(`   Found ${categories.length} categories`);
            categories.forEach(cat => {
                const categorySlug = encodeUrl(cat.id || cat.label);
                xml += `  <url>
    <loc>${DOMAIN}/category/${categorySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 3. IMAGES (With full image metadata) & COLLECTION OF UNIQUE TAGS
        // ═══════════════════════════════════════════════════════
        console.log('🖼️ Fetching gallery images...');
        const { data: images, error: imgError } = await supabase
            .from('gallery_images')
            .select('id, title, prompt, url, category, created_at, tags')
            .order('created_at', { ascending: false })
            .limit(5000); // Increased limit for better coverage

        const uniqueTags = new Set();

        if (imgError) {
            console.error('❌ Error fetching images:', imgError.message);
        } else if (images) {
            console.log(`   Found ${images.length} images`);

            images.forEach(img => {
                const cleanTitle = escapeXml(img.title || 'AI Generated Image');
                const cleanPrompt = escapeXml((img.prompt || '').substring(0, 200));
                const imageUrl = escapeXml(img.url);

                // Collect tags
                if (img.tags && Array.isArray(img.tags)) {
                    img.tags.forEach(tag => {
                        if (tag && typeof tag === 'string') {
                            uniqueTags.add(tag.trim().toLowerCase());
                        }
                    });
                }

                // Calculate priority based on recency
                const createdAt = new Date(img.created_at);
                const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
                let priority = '0.7';
                if (ageInDays < 1) priority = '0.9';
                else if (ageInDays < 7) priority = '0.8';
                else if (ageInDays < 30) priority = '0.7';
                else priority = '0.6';

                xml += `  <url>
    <loc>${DOMAIN}/image/${img.id}</loc>
    <lastmod>${img.created_at || date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${cleanTitle}</image:title>
      <image:caption>${cleanPrompt}</image:caption>
    </image:image>
  </url>
`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 3.5. DYNAMIC TAG PAGES
        // ═══════════════════════════════════════════════════════
        if (uniqueTags.size > 0) {
            console.log(`🏷️ Adding ${uniqueTags.size} unique tag pages...`);
            uniqueTags.forEach(tag => {
                const tagSlug = escapeXml(encodeURIComponent(tag));
                xml += `  <url>
    <loc>${DOMAIN}/tag/${tagSlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 4. PUBLIC USER PROFILES
        // ═══════════════════════════════════════════════════════
        console.log('👤 Fetching public profiles...');
        const { data: profiles, error: profError } = await supabase
            .from('profiles')
            .select('username, created_at')
            .not('username', 'is', null)
            .limit(1000);

        if (profError) {
            console.error('❌ Error fetching profiles:', profError.message);
        } else if (profiles) {
            console.log(`   Found ${profiles.length} public profiles`);

            profiles.forEach(profile => {
                if (profile.username) {
                    xml += `  <url>
    <loc>${DOMAIN}/user/${encodeUrl(profile.username)}</loc>
    <lastmod>${profile.created_at || date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
                }
            });
        }

        // ═══════════════════════════════════════════════════════
        // 5. PUBLIC COLLECTIONS
        // ═══════════════════════════════════════════════════════
        console.log('📂 Fetching public collections...');
        const { data: collections, error: colError } = await supabase
            .from('collections')
            .select('slug, updated_at, profiles(username)')
            .eq('is_public', true)
            .limit(1000);

        if (colError) {
            console.error('❌ Error fetching collections:', colError.message);
        } else if (collections) {
            console.log(`   Found ${collections.length} public collections`);

            collections.forEach(col => {
                let colUsername = null;
                if (col.profiles) {
                    if (Array.isArray(col.profiles)) {
                        colUsername = col.profiles[0]?.username;
                    } else {
                        colUsername = col.profiles.username;
                    }
                }

                if (col.slug && colUsername) {
                    const username = encodeUrl(colUsername);
                    const slug = encodeUrl(col.slug);
                    xml += `  <url>
    <loc>${DOMAIN}/user/${username}/collection/${slug}</loc>
    <lastmod>${col.updated_at || date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
                }
            });
        }
    }

    xml += `</urlset>`;

    // ═══════════════════════════════════════════════════════════
    // WRITE FILES
    // ═══════════════════════════════════════════════════════════
    const publicDir = path.resolve(__dirname, '../../public');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write sitemap.xml
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log('✅ sitemap.xml generated successfully!');

    // Generate robots.txt with sitemap reference
    const robotsTxt = `# ═══════════════════════════════════════════════════════════════
# 🌐 Arti Studio - robots.txt
# Domain: ${DOMAIN}
# Generated: ${date}
# ═══════════════════════════════════════════════════════════════

# Allow all good search engines
User-agent: *
Allow: /
Allow: /user/
Allow: /image/
Allow: /tag/
Allow: /category/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /upload
Disallow: /profile
Disallow: /settings
Disallow: /favorites
Disallow: /following
Disallow: /dashboard/
Disallow: /_next/
Disallow: /private/
Disallow: /search?
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=

# Crawl-delay for some heavy search engine crawlers to save server load
User-agent: Yandex
Crawl-delay: 2

# Optimize social media sharing previews
User-agent: Twitterbot
Allow: /
Allow: /image/
Allow: /user/

User-agent: facebookexternalhit
Allow: /
Allow: /image/
Allow: /user/

User-agent: LinkedInBot
Allow: /
Allow: /image/
Allow: /user/

User-agent: Pinterest
Allow: /
Allow: /image/
Allow: /user/

# Block SEO spam bots to protect data and server resources
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: Rogerbot
Disallow: /

User-agent: GPTBot
Disallow: /

# Sitemap
Sitemap: ${DOMAIN}/sitemap.xml
Host: ${DOMAIN}
`;

    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('✅ robots.txt generated successfully!');

    // ═══════════════════════════════════════════════════════════
    // PING INDEXNOW
    // ═══════════════════════════════════════════════════════════
    console.log('');
    console.log('📊 Sitemap Statistics:');
    console.log(`   - Static pages: ${STATIC_ROUTES.length}`);
    console.log(`   - Total URLs: ${(xml.match(/<url>/g) || []).length}`);
    console.log(`   - File size: ${(xml.length / 1024).toFixed(2)} KB`);
    console.log('');

    const sitemapUrl = `${DOMAIN}/sitemap.xml`;
    const indexNowKey = 'arti-studio-indexnow-2026-key';
    
    await pingIndexNow(sitemapUrl, indexNowKey);

    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Deploy the site');
    console.log('   2. Submit sitemap to Google Search Console');
    console.log('   3. Submit sitemap to Bing Webmaster Tools');
}

/**
 * Ping IndexNow API using Node's native https module
 */
function pingIndexNow(sitemapUrl, key) {
    return new Promise((resolve) => {
        const keyLocation = `${DOMAIN}/arti-studio-indexnow-2026-key.txt`;
        const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
        const encodedKeyLocation = encodeURIComponent(keyLocation);
        const pingUrl = `https://api.indexnow.org/indexnow?url=${encodedSitemapUrl}&key=${key}&keyLocation=${encodedKeyLocation}`;

        console.log(`🌐 Pinging IndexNow at: ${pingUrl}`);
        
        https.get(pingUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 202) {
                    console.log(`✅ IndexNow ping successful! Status: ${res.statusCode}`);
                    resolve(true);
                } else {
                    console.error(`❌ IndexNow ping failed. Status: ${res.statusCode}, Body: ${data}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.error('❌ IndexNow ping network error:', err.message);
            resolve(false);
        });
    });
}

// Run the generator
generateSitemap().catch(error => {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
});
