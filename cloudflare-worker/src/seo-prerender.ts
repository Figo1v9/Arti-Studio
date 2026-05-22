/**
 * ═══════════════════════════════════════════════════════════════
 * 🤖 Arti Studio - SEO Pre-render Worker
 * ═══════════════════════════════════════════════════════════════
 * 
 * This Cloudflare Worker intercepts requests from search engine bots
 * and serves pre-rendered HTML with proper meta tags for SEO.
 * 
 * WHY THIS IS CRITICAL:
 * - SPAs (Single Page Apps) serve empty HTML to crawlers
 * - Google sees: <div id="root"></div> (empty!)
 * - This worker injects real meta tags BEFORE the page loads
 * 
 * SUPPORTED BOTS:
 * - Googlebot, Bingbot, Slurp (Yahoo), DuckDuckBot
 * - facebookexternalhit, Twitterbot, LinkedInBot
 * - Pinterest, WhatsApp, Telegram
 */

export interface Env {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SITE_ORIGIN: string;
}

// Bot User-Agent patterns
const BOT_PATTERNS = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'pinterest',
    'whatsapp',
    'telegrambot',
    'discordbot',
    'applebot',
    'petalbot',
];

function isBot(userAgent: string): boolean {
    const ua = userAgent.toLowerCase();
    return BOT_PATTERNS.some(bot => ua.includes(bot));
}

// Default OG Image
const DEFAULT_OG_IMAGE = 'https://artistudio.fun/arti_studio.png';
const SITE_NAME = 'Arti Studio';
const SITE_URL = 'https://artistudio.fun';

interface ImageMeta {
    id: string;
    title: string;
    prompt: string;
    url: string;
    category: string;
    created_at: string;
    author_id?: string;
}

interface UserMeta {
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
}

/**
 * Fetch image metadata from Supabase
 */
async function fetchImageMeta(imageId: string, env: Env): Promise<ImageMeta | null> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/rest/v1/gallery_images?id=eq.${imageId}&select=id,title,prompt,url,category,created_at,author_id`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json() as ImageMeta[];
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Fetch user metadata from Supabase by username
 */
async function fetchUserMeta(username: string, env: Env): Promise<UserMeta | null> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/rest/v1/profiles?username=eq.${username}&select=username,full_name,avatar_url,bio`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json() as UserMeta[];
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Fetch user metadata from Supabase by ID
 */
async function fetchUserMetaById(userId: string, env: Env): Promise<UserMeta | null> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=username,full_name,avatar_url,bio`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json() as UserMeta[];
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Fetch category metadata from Supabase
 */
async function fetchCategoryMeta(categoryId: string, env: Env): Promise<CategoryMeta | null> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(categoryId)}&select=id,label,label_ar`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json() as CategoryMeta[];
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Fetch images containing a specific tag from Supabase
 */
async function fetchImagesByTag(tagName: string, env: Env): Promise<ImageMeta[]> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/rest/v1/gallery_images?tags=cs.{${encodeURIComponent(tagName)}}&select=id,title,prompt,url,category,created_at,author_id&limit=24`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) return [];

        return await response.json() as ImageMeta[];
    } catch {
        return [];
    }
}

/**
 * Fetch collection metadata and associated images from Supabase
 */
async function fetchCollectionMeta(username: string, slug: string, env: Env): Promise<{ collection: CollectionMeta; images: ImageMeta[] } | null> {
    try {
        // 1. Get user profile ID
        const profileResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );
        if (!profileResponse.ok) return null;
        const profiles = await profileResponse.json() as { id: string }[];
        if (profiles.length === 0) return null;
        const profileId = profiles[0].id;

        // 2. Get collection
        const colResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/collections?user_id=eq.${profileId}&slug=eq.${encodeURIComponent(slug)}&select=id,name,description,slug,is_public,image_count,created_at`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );
        if (!colResponse.ok) return null;
        const collections = await colResponse.json() as CollectionMeta[];
        if (collections.length === 0) return null;
        const collection = collections[0];

        // Only public collections should be pre-rendered
        if (!collection.is_public) return null;

        // 3. Get images in the collection (limit to 12)
        const colImagesResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/collection_images?collection_id=eq.${collection.id}&select=image_id,gallery_images!inner(id,title,prompt,url,category,created_at,author_id)&order=sort_order.asc&limit=12`,
            {
                headers: {
                    'apikey': env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                },
            }
        );
        let images: ImageMeta[] = [];
        if (colImagesResponse.ok) {
            const rawImages = await colImagesResponse.json() as { gallery_images: ImageMeta }[];
            images = rawImages.map(ri => ri.gallery_images).filter(Boolean);
        }

        return { collection, images };
    } catch {
        return null;
    }
}

/**
 * Generate HTML with proper meta tags for SEO
 */
function generateMetaHTML(
    title: string,
    description: string,
    url: string,
    image: string,
    type: 'website' | 'article' = 'website',
    additionalMeta: string = ''
): string {
    // Escape HTML entities
    const escapeHtml = (str: string) =>
        str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description.substring(0, 160));
    const safeUrl = escapeHtml(url);
    const safeImage = escapeHtml(image);

    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <meta name="google-adsense-account" content="ca-pub-5316139592191698">
  <title>${safeTitle}</title>
  <meta name="title" content="${safeTitle}">
  <meta name="description" content="${safeDesc}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${safeUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#000000">
  <meta name="author" content="${SITE_NAME}">
  <link rel="icon" type="image/png" href="/arti_studio_icon.png">
  ${additionalMeta}
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${safeTitle}",
    "description": "${safeDesc}",
    "url": "${safeUrl}",
    "image": "${safeImage}",
    "publisher": {
      "@type": "Organization",
      "name": "${SITE_NAME}",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_URL}/arti_studio.png"
      }
    }
  }
  </script>
</head>
<body>
  <div id="root">
    <h1>${safeTitle}</h1>
    <p>${safeDesc}</p>
    <img src="${safeImage}" alt="${safeTitle}" />
  </div>
  <script>
    // Redirect non-bots to the real SPA
    if (!/bot|crawl|spider|slurp/i.test(navigator.userAgent)) {
      window.location.replace('${safeUrl}');
    }
  </script>
</body>
</html>`;
}
/**
 * Escape string for safe inclusion in JSON-LD script blocks
 */
function escapeJson(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/<\/script/gi, '<\\/script');
}

/**
 * Generate image-specific meta HTML with rich Schema.org
 */
function generateImageMetaHTML(image: ImageMeta, author: UserMeta | null): string {
    const title = `${image.title || 'AI Generated Art'} - ${SITE_NAME}`;
    const description = image.prompt
        ? `${image.prompt.substring(0, 150)}...`
        : 'Discover AI-generated artwork and prompts at Arti Studio';
    const url = `${SITE_URL}/image/${image.id}`;



    const creatorLD = author
        ? `{
      "@type": "Person",
      "name": "${escapeJson(author.full_name || author.username)}",
      "alternateName": "@${escapeJson(author.username)}",
      "url": "${SITE_URL}/user/${encodeURIComponent(author.username)}",
      "image": "${escapeJson(author.avatar_url || DEFAULT_OG_IMAGE)}",
      "description": "${escapeJson(author.bio || '')}"
    }`
        : `{
      "@type": "Organization",
      "name": "${SITE_NAME}"
    }`;

    const schemaLD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": "${escapeJson(image.title || 'AI Generated Art')}",
    "description": "${escapeJson(description)}",
    "contentUrl": "${image.url}",
    "url": "${url}",
    "thumbnailUrl": "${image.url}",
    "uploadDate": "${image.created_at}",
    "creator": ${creatorLD},
    "publisher": {
      "@type": "Organization",
      "name": "${SITE_NAME}",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_URL}/arti_studio.png"
      }
    },
    "keywords": ["AI Art", "AI Prompt", "${escapeJson(image.category || 'Digital Art')}", "Midjourney", "Stable Diffusion"],
    "genre": "${escapeJson(image.category || 'Digital Art')}",
    "isAccessibleForFree": true
  }
  </script>`;

    return generateMetaHTML(title, description, url, image.url, 'article', schemaLD);
}

/**
 * Generate user profile meta HTML
 */
function generateUserMetaHTML(user: UserMeta): string {
    const title = `${user.full_name || user.username} (@${user.username}) - ${SITE_NAME}`;
    const description = user.bio || `Check out ${user.full_name || user.username}'s AI art and prompts on ${SITE_NAME}`;
    const url = `${SITE_URL}/user/${user.username}`;
    const image = user.avatar_url || DEFAULT_OG_IMAGE;



    const schemaLD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "${escapeJson(user.full_name || user.username)}",
      "alternateName": "@${escapeJson(user.username)}",
      "url": "${url}",
      "image": "${escapeJson(image)}",
      "description": "${escapeJson(user.bio || '')}"
    }
  }
  </script>`;

    return generateMetaHTML(title, description, url, image, 'website', schemaLD);
}

/**
 * Generate category meta HTML
 */
interface CategoryMeta {
    id: string;
    label: string;
    label_ar: string | null;
}

interface CollectionMeta {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    is_public: boolean;
    image_count: number;
    created_at: string;
}

/**
 * Helper to check if a string contains Arabic characters
 */
function hasArabic(text: string): boolean {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Generate category meta HTML (Bilingual English + Arabic)
 */
function generateCategoryMetaHTML(category: CategoryMeta | string): string {
    const id = typeof category === 'string' ? category : category.id;
    const label = typeof category === 'string' ? category : category.label;
    const labelAr = typeof category === 'string' ? '' : category.label_ar;

    const formattedCategory = label.charAt(0).toUpperCase() + label.slice(1);
    
    // Bilingual title
    let title = `${formattedCategory} AI Prompts & Art - ${SITE_NAME}`;
    if (labelAr && labelAr !== formattedCategory) {
        title = `${formattedCategory} (${labelAr}) AI Prompts & Art | صور وافكار ذكاء اصطناعي - ${SITE_NAME}`;
    }

    // Bilingual description
    let description = `Explore stunning ${label.toLowerCase()} AI-generated images and prompts. Find inspiration for your ${label.toLowerCase()} projects at ${SITE_NAME}.`;
    if (labelAr && labelAr !== formattedCategory) {
        description = `Explore ${formattedCategory} (${labelAr}) AI prompts and images. استكشف صور وافكار ومطالبات ذكاء اصطناعي مميزة لـ ${labelAr}. Find inspiration at ${SITE_NAME}.`;
    }

    const url = `${SITE_URL}/category/${encodeURIComponent(id)}`;

    return generateMetaHTML(title, description, url, DEFAULT_OG_IMAGE);
}

/**
 * Generate collection meta HTML
 */
function generateCollectionMetaHTML(username: string, collection: CollectionMeta, images: ImageMeta[]): string {
    const title = `${collection.name} AI Art Collection by @${username} - ${SITE_NAME}`;
    const description = collection.description || `Explore the "${collection.name}" AI art gallery by @${username} containing ${collection.image_count || 0} images and creative prompt styles.`;
    const url = `${SITE_URL}/user/${username}/collection/${collection.slug}`;
    const image = images.length > 0 ? images[0].url : DEFAULT_OG_IMAGE;



    const schemaLD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "${url}",
    "name": "${escapeJson(collection.name)}",
    "description": "${escapeJson(description)}",
    "url": "${url}",
    "image": "${escapeJson(image)}",
    "numberOfItems": ${collection.image_count || 0},
    "publisher": {
      "@type": "Organization",
      "name": "${SITE_NAME}",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_URL}/arti_studio.png"
      }
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "${SITE_URL}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "@${escapeJson(username)}",
        "item": "${SITE_URL}/user/${encodeURIComponent(username)}"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${escapeJson(collection.name)}",
        "item": "${url}"
      }
    ]
  }
  </script>`;

    return generateMetaHTML(title, description, url, image, 'website', schemaLD);
}

/**
 * Generate tag meta HTML
 */
function generateTagMetaHTML(tagName: string, images: ImageMeta[]): string {
    const isAr = hasArabic(tagName);
    
    let title = `#${tagName} AI Art & Prompt Styles - ${SITE_NAME}`;
    let description = `Explore ${images.length} stunning AI-generated images and creative prompt styles tagged with #${tagName} on ${SITE_NAME}.`;
    
    if (isAr) {
        title = `هاشتاغ #${tagName} - صور ومطالبات ذكاء اصطناعي | ${SITE_NAME}`;
        description = `استكشف ${images.length} من الصور الفنية والمطالبات الإبداعية للذكاء الاصطناعي تحت هاشتاغ #${tagName} على ${SITE_NAME}.`;
    } else {
        title = `#${tagName} AI Art & Prompt Styles | مطالبات ذكاء اصطناعي - ${SITE_NAME}`;
        description = `Explore ${images.length} stunning AI-generated images and creative prompt styles tagged with #${tagName} on ${SITE_NAME}. استكشف أفكار ومطالبات التصميم.`;
    }

    const url = `${SITE_URL}/tag/${encodeURIComponent(tagName)}`;
    const image = images.length > 0 ? images[0].url : DEFAULT_OG_IMAGE;
    
    const breadcrumbLD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "${SITE_URL}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore",
        "item": "${SITE_URL}/explore"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "#${escapeJson(tagName)}",
        "item": "${url}"
      }
    ]
  }
  </script>`;

    return generateMetaHTML(title, description, url, image, 'website', breadcrumbLD);
}

/**
 * Main Worker Handler
 */
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent') || '';

        // Only intercept for bots
        if (!isBot(userAgent)) {
            // Pass through to origin for real users
            return fetch(request);
        }

        console.log(`[SEO Worker] Bot detected: ${userAgent.substring(0, 50)}`);

        // Parse the path
        const path = url.pathname;

        try {
            // Handle /image/:id routes
            if (path.startsWith('/image/')) {
                const imageId = path.replace('/image/', '');
                const imageMeta = await fetchImageMeta(imageId, env);

                if (imageMeta) {
                    let authorMeta: UserMeta | null = null;
                    if (imageMeta.author_id) {
                        authorMeta = await fetchUserMetaById(imageMeta.author_id, env);
                    }
                    return new Response(generateImageMetaHTML(imageMeta, authorMeta), {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                            'X-Robots-Tag': 'index, follow',
                        },
                    });
                }
            }

            // Handle /user/:username/collection/:slug and /user/:username routes
            if (path.startsWith('/user/')) {
                if (path.includes('/collection/')) {
                    const relativePath = path.substring(6); // Remove '/user/'
                    const parts = relativePath.split('/collection/');
                    if (parts.length === 2) {
                        const username = decodeURIComponent(parts[0]);
                        const slug = decodeURIComponent(parts[1]);
                        const collectionData = await fetchCollectionMeta(username, slug, env);
                        if (collectionData) {
                            return new Response(generateCollectionMetaHTML(username, collectionData.collection, collectionData.images), {
                                headers: {
                                    'Content-Type': 'text/html; charset=utf-8',
                                    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                                    'X-Robots-Tag': 'index, follow',
                                },
                            });
                        }
                    }
                } else {
                    const username = decodeURIComponent(path.replace('/user/', ''));
                    const userMeta = await fetchUserMeta(username, env);

                    if (userMeta) {
                        return new Response(generateUserMetaHTML(userMeta), {
                            headers: {
                                'Content-Type': 'text/html; charset=utf-8',
                                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                                'X-Robots-Tag': 'index, follow',
                            },
                        });
                    }
                }
            }

            // Handle /tag/:tagName routes
            if (path.startsWith('/tag/')) {
                const tagName = decodeURIComponent(path.replace('/tag/', ''));
                const images = await fetchImagesByTag(tagName, env);
                return new Response(generateTagMetaHTML(tagName, images), {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                        'X-Robots-Tag': 'index, follow',
                    },
                });
            }

            // Handle /category/:id routes
            if (path.startsWith('/category/')) {
                const categoryId = decodeURIComponent(path.replace('/category/', ''));
                const categoryMeta = await fetchCategoryMeta(categoryId, env);
                const metaHtml = categoryMeta 
                    ? generateCategoryMetaHTML(categoryMeta) 
                    : generateCategoryMetaHTML(categoryId);

                return new Response(metaHtml, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'public, max-age=86400',
                        'X-Robots-Tag': 'index, follow',
                    },
                });
            }

            // Handle static pages
            const staticPages: Record<string, { title: string; description: string }> = {
                '/': {
                    title: 'Arti Studio - AI Art & Prompt Inspiration Platform',
                    description: 'Discover stunning AI-generated images with prompts. Find inspiration for design, architecture, fashion, and coding on the #1 AI prompt platform.',
                },
                '/explore': {
                    title: 'Explore AI Art Gallery & Prompts - Arti Studio',
                    description: 'Browse thousands of stunning AI-generated images with their prompts. Find creative inspiration for Midjourney, Stable Diffusion, and DALL-E.',
                },
                '/trends': {
                    title: 'Trending AI Art & Prompts - Arti Studio',
                    description: 'Discover the most popular AI-generated art and trending prompts on Arti Studio. Explore daily and weekly design trends from the community.',
                },
                '/about': {
                    title: 'About Arti Studio - AI Art & Prompt Platform',
                    description: 'Learn about Arti Studio, the premier platform for AI art inspiration. Meet our global community of creators and explore our prompt engineering tools.',
                },
                '/contact': {
                    title: 'Contact Us & Support - Arti Studio',
                    description: 'Get in touch with the Arti Studio team for support, feature requests, or DMCA inquiries. We are here to help our community of creators.',
                },
                '/privacy': {
                    title: 'Privacy Policy & Data Protection - Arti Studio',
                    description: 'Read the Arti Studio privacy policy to understand how we collect, store, protect, and use your personal information and uploaded assets.',
                },
                '/terms': {
                    title: 'Terms of Service & Usage - Arti Studio',
                    description: 'Review the Arti Studio terms of service, user guidelines, intellectual property policies, and commercial usage rights for AI art.',
                },
            };

            if (staticPages[path]) {
                const page = staticPages[path];
                return new Response(
                    generateMetaHTML(page.title, page.description, `${SITE_URL}${path}`, DEFAULT_OG_IMAGE),
                    {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=86400',
                            'X-Robots-Tag': 'index, follow',
                        },
                    }
                );
            }

        } catch (error) {
            console.error('[SEO Worker] Error:', error);
        }

        // If we can't handle it, pass through to origin
        return fetch(request);
    },
};
