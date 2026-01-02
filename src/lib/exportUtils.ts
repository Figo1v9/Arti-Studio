/**
 * Export Utilities
 * Functions for exporting data to CSV and Excel formats
 */

// Type definitions for export data
type ExportableValue = string | number | boolean | null | undefined | string[] | object;
type ExportableRecord = Record<string, ExportableValue>;

interface ExportableUser {
    id: string;
    email?: string | null;
    full_name?: string | null;
    username?: string | null;
    role?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface ExportableImage {
    id: string;
    url?: string | null;
    title?: string | null;
    prompt?: string | null;
    category?: string | null;
    tags?: string[] | string | null;
    author_id?: string | null;
    author_name?: string | null;
    author?: { full_name?: string | null; username?: string | null } | null;
    views?: number | null;
    copies?: number | null;
    likes?: number | null;
    downloads?: number | null;
    is_featured?: boolean;
    aspect_ratio?: number | null;
    width?: number | null;
    height?: number | null;
    created_at?: string | null;
}

/**
 * Convert array of objects to CSV string
 */
function objectsToCSV(data: ExportableRecord[]): string {
    if (!data || data.length === 0) return '';

    // Get all unique keys from all objects
    const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

    // Create header row
    const header = keys.join(',');

    // Create data rows
    const rows = data.map(obj => {
        return keys.map(key => {
            const value = obj[key];

            // Handle different value types
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            if (typeof value === 'string') {
                // Escape quotes and wrap in quotes if contains comma or newline
                const escaped = value.replace(/"/g, '""');
                if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
                    return `"${escaped}"`;
                }
                return escaped;
            }
            return String(value);
        }).join(',');
    });

    return [header, ...rows].join('\n');
}

/**
 * Download a string as a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data: ExportableRecord[], filename: string): void {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    const csv = objectsToCSV(data);
    const filenameWithExt = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    downloadFile(csv, filenameWithExt, 'text/csv;charset=utf-8;');
}

/**
 * Export data to Excel-compatible CSV (uses tab separator for better Excel compatibility)
 * Note: For full Excel support (.xlsx), a library like SheetJS would be needed
 */
export function exportToExcel(data: ExportableRecord[], filename: string): void {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // For basic Excel compatibility, we use CSV with UTF-8 BOM
    const csv = objectsToCSV(data);
    const csvWithBOM = '\ufeff' + csv; // Add BOM for Excel UTF-8 recognition
    const filenameWithExt = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    downloadFile(csvWithBOM, filenameWithExt, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Format data for user export
 */
export function formatUsersForExport(users: ExportableUser[]): ExportableRecord[] {
    return users.map(user => ({
        ID: user.id,
        Email: user.email,
        'Full Name': user.full_name,
        Username: user.username,
        Role: user.role,
        'Created At': user.created_at,
        'Updated At': user.updated_at,
    }));
}

/**
 * Format data for images export
 */
export function formatImagesForExport(
    images: ExportableImage[],
    options?: { categoryLabels?: Record<string, string> }
): ExportableRecord[] {
    const categoryLabels = options?.categoryLabels || {};

    const normalizeDate = (value: string | null | undefined): string => {
        if (!value) return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
    };

    const toYesNo = (value: boolean | null | undefined): string => (value ? 'Yes' : 'No');

    const toTags = (value: string[] | string | null | undefined): string => {
        if (Array.isArray(value)) return value.join(' | ');
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .join(' | ');
        }
        return '';
    };

    const getTagCount = (value: string[] | string | null | undefined): number => {
        if (Array.isArray(value)) return value.length;
        if (typeof value === 'string') {
            return value.split(',').map((tag) => tag.trim()).filter(Boolean).length;
        }
        return 0;
    };

    const getFileName = (url: string | null | undefined) => {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            return parsed.pathname.split('/').filter(Boolean).pop() || '';
        } catch {
            const parts = url.split('/');
            return parts[parts.length - 1] || '';
        }
    };

    return images.map((image) => {
        const categoryId = image.category || '';
        const categoryLabel = categoryLabels[categoryId] || categoryId;
        const tagsValue = toTags(image.tags);
        const tagCount = getTagCount(image.tags);

        return {
            ID: image.id,
            Title: image.title || 'Untitled',
            Prompt: image.prompt,
            'Category ID': categoryId,
            'Category Label': categoryLabel,
            Tags: tagsValue,
            'Tags Count': tagCount,
            'Author ID': image.author_id,
            'Author Name': image.author_name || image.author?.full_name || image.author?.username || '',
            Views: image.views ?? 0,
            Copies: image.copies ?? 0,
            Likes: image.likes ?? 0,
            Downloads: image.downloads ?? 0,
            Featured: toYesNo(image.is_featured),
            'Aspect Ratio': image.aspect_ratio ?? '',
            Width: image.width ?? '',
            Height: image.height ?? '',
            'Created At': normalizeDate(image.created_at),
            URL: image.url,
            'File Name': getFileName(image.url),
        };
    });
}
