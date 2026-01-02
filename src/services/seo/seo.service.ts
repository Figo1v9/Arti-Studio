/**
 * ═══════════════════════════════════════════════════════════════
 * 🌐 SEO Service - Core SEO Utilities for Arti Studio
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized SEO utilities for generating meta tags, structured data,
 * and handling SEO-related operations across the application.
 */

const SITE_URL = 'https://artistudio.fun';
const SITE_NAME = 'Arti Studio';
const DEFAULT_OG_IMAGE = `${SITE_URL}/arti_studio.png`;

export interface SEOData {
    title: string;
    description: string;
    url?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
    keywords?: string[];
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

/**
 * Generate complete meta tags for a page
 */
export function generateMetaTags(seo: SEOData): Record<string, string> {
    const url = seo.url || SITE_URL;
    const image = seo.image || DEFAULT_OG_IMAGE;
    const type = seo.type || 'website';

    return {
        // Primary
        title: seo.title,
        description: seo.description.substring(0, 160),

        // Open Graph
        'og:type': type,
        'og:url': url,
        'og:title': seo.title,
        'og:description': seo.description.substring(0, 160),
        'og:image': image,
        'og:site_name': SITE_NAME,
        'og:locale': 'en_US',

        // Twitter
        'twitter:card': 'summary_large_image',
        'twitter:url': url,
        'twitter:title': seo.title,
        'twitter:description': seo.description.substring(0, 160),
        'twitter:image': image,

        // Additional
        'robots': 'index, follow, max-image-preview:large',
        'googlebot': 'index, follow',

        // Keywords
        ...(seo.keywords && { keywords: seo.keywords.join(', ') }),

        // Author
        ...(seo.author && { author: seo.author }),

        // Article dates
        ...(seo.publishedTime && { 'article:published_time': seo.publishedTime }),
        ...(seo.modifiedTime && { 'article:modified_time': seo.modifiedTime }),
    };
}

/**
 * Generate ImageObject schema for SEO
 */
export function generateImageSchema(image: {
    id: string;
    title?: string;
    prompt?: string;
    url: string;
    author?: string;
    authorUsername?: string;
    category?: string;
    tags?: string[];
    views?: number;
    copies?: number;
    createdAt?: string | Date;
}) {
    const safeDate = (date?: string | Date) => {
        if (!date) return new Date().toISOString();
        const d = new Date(date);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    };

    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/image/${image.id}`,
        'name': image.title || 'AI Generated Art',
        'description': image.prompt?.substring(0, 300) || 'AI generated artwork',
        'contentUrl': image.url,
        'thumbnailUrl': image.url,
        'url': `${SITE_URL}/image/${image.id}`,
        'encodingFormat': 'image/webp',
        'license': `${SITE_URL}/terms`,
        'acquireLicensePage': `${SITE_URL}/image/${image.id}`,
        'creditText': image.author || SITE_NAME,
        'copyrightNotice': `© ${new Date().getFullYear()} ${image.author || SITE_NAME}`,
        'creator': {
            '@type': 'Person',
            'name': image.author || 'Anonymous',
            ...(image.authorUsername && { 'url': `${SITE_URL}/user/${image.authorUsername}` })
        },
        'publisher': {
            '@type': 'Organization',
            'name': SITE_NAME,
            'logo': {
                '@type': 'ImageObject',
                'url': `${SITE_URL}/arti_studio.png`
            },
            'url': SITE_URL
        },
        'caption': image.prompt,
        'keywords': [
            'AI Art',
            'AI Prompt',
            image.category || 'Digital Art',
            'Midjourney',
            'Stable Diffusion',
            ...(image.tags || []).slice(0, 5)
        ].join(', '),
        'genre': image.category || 'Digital Art',
        'datePublished': safeDate(image.createdAt),
        'dateModified': safeDate(image.createdAt),
        'interactionStatistic': [
            {
                '@type': 'InteractionCounter',
                'interactionType': 'https://schema.org/ViewAction',
                'userInteractionCount': image.views || 0
            },
            {
                '@type': 'InteractionCounter',
                'interactionType': 'https://schema.org/ShareAction',
                'userInteractionCount': image.copies || 0
            }
        ],
        'isAccessibleForFree': true,
        'isFamilyFriendly': true,
        'inLanguage': 'en'
    };
}

/**
 * Generate WebSite schema (for homepage)
 */
export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'name': SITE_NAME,
        'url': SITE_URL,
        'description': 'Discover stunning AI-generated images with their prompts. Find inspiration for design, architecture, fashion, art, and coding.',
        'publisher': {
            '@type': 'Organization',
            'name': SITE_NAME,
            'logo': {
                '@type': 'ImageObject',
                'url': `${SITE_URL}/arti_studio.png`
            }
        },
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${SITE_URL}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        },
        'inLanguage': 'en'
    };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        'name': SITE_NAME,
        'url': SITE_URL,
        'logo': {
            '@type': 'ImageObject',
            'url': `${SITE_URL}/arti_studio.png`,
            'width': 512,
            'height': 512
        },
        'sameAs': [
            // Add social media links here when available
            // 'https://twitter.com/artistudio',
            // 'https://www.instagram.com/artistudio',
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'customer service',
            'url': `${SITE_URL}/contact`,
            'availableLanguage': ['English', 'Arabic']
        }
    };
}

/**
 * Generate ProfilePage schema for user profiles
 */
export function generateProfileSchema(profile: {
    username: string;
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/user/${profile.username}`,
        'mainEntity': {
            '@type': 'Person',
            'name': profile.fullName || profile.username,
            'alternateName': `@${profile.username}`,
            'url': `${SITE_URL}/user/${profile.username}`,
            'image': profile.avatarUrl || DEFAULT_OG_IMAGE,
            'description': profile.bio || `Check out ${profile.fullName || profile.username}'s AI art on ${SITE_NAME}`
        }
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
        }))
    };
}

/**
 * Generate FAQPage schema (useful for About/Help pages)
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };
}

/**
 * Generate CollectionPage schema for category pages
 */
export function generateCollectionSchema(category: {
    id: string;
    name: string;
    description?: string;
    imageCount?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/category/${category.id}`,
        'name': `${category.name} AI Prompts`,
        'description': category.description || `Explore ${category.name} AI-generated images and prompts on ${SITE_NAME}`,
        'url': `${SITE_URL}/category/${category.id}`,
        'isPartOf': {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`
        },
        ...(category.imageCount && {
            'numberOfItems': category.imageCount
        })
    };
}

export const SEOService = {
    SITE_URL,
    SITE_NAME,
    DEFAULT_OG_IMAGE,
    generateMetaTags,
    generateImageSchema,
    generateWebsiteSchema,
    generateOrganizationSchema,
    generateProfileSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateCollectionSchema,
};
