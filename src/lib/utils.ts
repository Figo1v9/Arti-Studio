import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
}

/**
 * Remove emojis and special characters from category ID for clean URLs
 * Example: "christmas🎁❄️" -> "christmas"
 */
export function getCategorySlug(categoryId: string): string {
  // Remove emojis and trim whitespace
  return categoryId
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]/gu, '')
    .trim();
}

/**
 * Find category by slug (matches start of category id without emojis)
 */
export function findCategoryBySlug<T extends { id: string }>(
  categories: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase().trim();
  return categories.find(cat => {
    const catSlug = getCategorySlug(cat.id).toLowerCase();
    return catSlug === normalizedSlug || cat.id.toLowerCase() === normalizedSlug;
  });
}
