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
    user_id?: string;
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
            `${env.SUPABASE_URL}/rest/v1/gallery_images?id=eq.${imageId}&select=id,title,prompt,url,category,created_at,user_id`,
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
 * Fetch user metadata from Supabase
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
 * Generate image-specific meta HTML with rich Schema.org
 */
function generateImageMetaHTML(image: ImageMeta): string {
    const title = `${image.title || 'AI Generated Art'} - ${SITE_NAME}`;
    const description = image.prompt
        ? `${image.prompt.substring(0, 150)}...`
        : 'Discover AI-generated artwork and prompts at Arti Studio';
    const url = `${SITE_URL}/image/${image.id}`;

    const schemaLD = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": "${image.title || 'AI Generated Art'}",
    "description": "${description.replace(/"/g, '\\"')}",
    "contentUrl": "${image.url}",
    "url": "${url}",
    "thumbnailUrl": "${image.url}",
    "uploadDate": "${image.created_at}",
    "creator": {
      "@type": "Organization",
      "name": "${SITE_NAME}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${SITE_NAME}",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_URL}/arti_studio.png"
      }
    },
    "keywords": ["AI Art", "AI Prompt", "${image.category || 'Digital Art'}", "Midjourney", "Stable Diffusion"],
    "genre": "${image.category || 'Digital Art'}",
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
      "name": "${user.full_name || user.username}",
      "alternateName": "@${user.username}",
      "url": "${url}",
      "image": "${image}",
      "description": "${(user.bio || '').replace(/"/g, '\\"')}"
    }
  }
  </script>`;

    return generateMetaHTML(title, description, url, image, 'website', schemaLD);
}

/**
 * Generate category meta HTML
 */
function generateCategoryMetaHTML(category: string): string {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const title = `${formattedCategory} AI Prompts & Art - ${SITE_NAME}`;
    const description = `Explore stunning ${formattedCategory.toLowerCase()} AI-generated images and prompts. Find inspiration for your ${formattedCategory.toLowerCase()} projects at ${SITE_NAME}.`;
    const url = `${SITE_URL}/category/${encodeURIComponent(category)}`;

    return generateMetaHTML(title, description, url, DEFAULT_OG_IMAGE);
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
                    return new Response(generateImageMetaHTML(imageMeta), {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                            'X-Robots-Tag': 'index, follow',
                        },
                    });
                }
            }

            // Handle /user/:username routes
            if (path.startsWith('/user/')) {
                const username = path.replace('/user/', '');
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

            // Handle /category/:id routes
            if (path.startsWith('/category/')) {
                const category = decodeURIComponent(path.replace('/category/', ''));
                return new Response(generateCategoryMetaHTML(category), {
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
                    title: 'Arti Studio - AI Prompt Inspiration Platform',
                    description: 'Discover stunning AI-generated images with their prompts. Find inspiration for design, architecture, fashion, art, and coding at Arti Studio.',
                },
                '/explore': {
                    title: 'Explore AI Art Gallery - Arti Studio',
                    description: 'Browse thousands of AI-generated images with their prompts. Find inspiration for your next AI art project.',
                },
                '/trends': {
                    title: 'Trending AI Art & Prompts - Arti Studio',
                    description: 'Discover the most popular AI-generated art and trending prompts on Arti Studio.',
                },
                '/about': {
                    title: 'About Arti Studio - AI Prompt Inspiration Platform',
                    description: 'Learn about Arti Studio, the premier platform for AI art inspiration and prompt sharing.',
                },
                '/contact': {
                    title: 'Contact Us - Arti Studio',
                    description: 'Get in touch with the Arti Studio team. We\'d love to hear from you!',
                },
                '/privacy': {
                    title: 'Privacy Policy - Arti Studio',
                    description: 'Read our privacy policy to understand how we protect your data at Arti Studio.',
                },
                '/terms': {
                    title: 'Terms of Service - Arti Studio',
                    description: 'Review the terms of service for using Arti Studio platform.',
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
