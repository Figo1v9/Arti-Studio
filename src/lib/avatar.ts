/**
 * Generate a random avatar URL using DiceBear API
 * Different styles for variety
 */

const AVATAR_STYLES = [
    'adventurer',      // Cartoon characters
    'adventurer-neutral', // Neutral cartoon
    'avataaars',       // Like Bitmoji
    'big-ears',        // Cute big ears
    'big-ears-neutral',
    'big-smile',       // Big smile faces
    'bottts',          // Robots
    'croodles',        // Doodle style
    'fun-emoji',       // Fun emojis
    'lorelei',         // Anime style
    'lorelei-neutral',
    'micah',           // Modern style
    'miniavs',         // Mini avatars
    'notionists',      // Notion style
    'open-peeps',      // Illustrated people
    'personas',        // Professional personas
    'pixel-art',       // Pixel art
    'pixel-art-neutral',
    'thumbs',          // Thumbs up
] as const;

const BACKGROUND_COLORS = [
    'b6e3f4', // Light blue
    'c0aede', // Light purple
    'd1d4f9', // Light lavender
    'ffdfbf', // Light peach
    'ffd5dc', // Light pink
    'c1f0c1', // Light green
    'fff4bd', // Light yellow
];

/**
 * Get avatar style based on email hash (consistent per user)
 */
function getStyleFromEmail(email: string): string {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % AVATAR_STYLES.length;
    return AVATAR_STYLES[index];
}

/**
 * Get background color based on email
 */
function getBackgroundFromEmail(email: string): string {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 3) - hash) + char;
        hash = hash & hash;
    }
    const index = Math.abs(hash) % BACKGROUND_COLORS.length;
    return BACKGROUND_COLORS[index];
}

/**
 * Generate avatar URL for a user
 * @param email - User's email (used as seed)
 * @param photoURL - Optional existing photo URL
 * @returns Avatar URL
 */
export function getAvatarUrl(email: string, photoURL?: string | null): string {
    // If user has a photo, use it
    if (photoURL) return photoURL;

    // Generate DiceBear avatar
    const style = getStyleFromEmail(email);
    const bgColor = getBackgroundFromEmail(email);
    const seed = encodeURIComponent(email);

    const baseUrl = import.meta.env.VITE_AVATAR_API_URL || 'https://api.dicebear.com/7.x';
    return `${baseUrl}/${style}/svg?seed=${seed}&backgroundColor=${bgColor}`;
}

/**
 * Get avatar style name for display
 */
export function getAvatarStyle(email: string): string {
    return getStyleFromEmail(email);
}
