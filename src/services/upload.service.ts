// R2 Upload Service via Cloudflare Worker

// Configuration
// Configuration with Fallbacks for Production
const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || "https://r2-upload-worker.arti-studio.workers.dev";
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || "https://pub-d1b86c05aa324c30b2a76b02f0d102ae.r2.dev";

// ============================================
// Ultra-Aggressive Smart Compression Settings
// ============================================

// Target: 40-70KB - Ultra small with maintained visual quality
const TARGET_SIZE_KB = 55; // Ideal target
const MIN_SIZE_KB = 40;    // Minimum acceptable
const MAX_SIZE_KB = 70;    // Maximum acceptable

// Progressive quality search
const INITIAL_QUALITY = 0.92; // Start high
const MIN_QUALITY = 0.25;     // Can go very low if needed
const QUALITY_STEP = 0.05;    // Small steps for precision

/**
 * Ultra-Smart Compression System
 * 
 * Strategy:
 * 1. Keep original dimensions (NO resize)
 * 2. Use binary-search-like quality adjustment
 * 3. Target 40-70KB final size
 * 4. Maintain perceptual quality
 */
export const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Skip GIFs
        if (file.type === 'image/gif') {
            // GIF - skipping compression
            resolve(file);
            return;
        }

        const img = new Image();

        img.onload = async () => {
            try {
                const originalSizeKB = file.size / 1024;
                const { width, height } = img; // Keep original dimensions

                // Smart progressive compression to hit 40-70KB target
                let quality = INITIAL_QUALITY;
                let compressedFile = await compressWithCanvas(img, width, height, quality);
                let attempts = 0;
                const maxAttempts = 15; // Allow many attempts for precision

                // Binary search approach for optimal quality
                let lowQuality = MIN_QUALITY;
                let highQuality = INITIAL_QUALITY;

                while (attempts < maxAttempts) {
                    const currentSizeKB = compressedFile.size / 1024;

                    // Perfect range - stop
                    if (currentSizeKB >= MIN_SIZE_KB && currentSizeKB <= MAX_SIZE_KB) {
                        break;
                    }

                    // Too large - reduce quality
                    if (currentSizeKB > MAX_SIZE_KB) {
                        highQuality = quality;
                        quality = (lowQuality + quality) / 2;
                    }
                    // Too small - increase quality
                    else if (currentSizeKB < MIN_SIZE_KB) {
                        lowQuality = quality;
                        quality = (quality + highQuality) / 2;
                    }

                    // Prevent infinite loop
                    if (Math.abs(highQuality - lowQuality) < 0.01) {
                        break;
                    }

                    compressedFile = await compressWithCanvas(img, width, height, quality);

                    // Yield to main thread to prevent UI freeze
                    await new Promise(resolve => setTimeout(resolve, 0));

                    attempts++;
                }

                const finalSizeKB = compressedFile.size / 1024;
                const compressionRatio = ((1 - finalSizeKB / originalSizeKB) * 100).toFixed(1);

                // Compression complete

                URL.revokeObjectURL(img.src);
                resolve(compressedFile);

            } catch (error) {
                console.error('Compression error:', error);
                URL.revokeObjectURL(img.src);
                resolve(file);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
};


function compressWithCanvas(
    img: HTMLImageElement,
    width: number,
    height: number,
    quality: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', {
            alpha: false,  // Disable alpha for smaller files
            willReadFrequently: false
        });

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        canvas.width = width;
        canvas.height = height;

        // Balanced quality for speed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Faster than 'high'

        // Draw image directly (no white background for speed)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP with aggressive compression
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const fileName = `img_${Date.now()}.webp`;
                    resolve(new File([blob], fileName, { type: 'image/webp' }));
                } else {
                    reject(new Error('Canvas toBlob failed'));
                }
            },
            'image/webp',
            quality
        );
    });
}


// Upload image via Cloudflare Worker to R2
// Automatically compresses image before upload
export const uploadImage = async (file: File, skipCompression = false): Promise<string | null> => {
    try {
        const headers: HeadersInit = {};

        // --- Check if Admin Session Exists (Admin uses Secret, not Firebase Token) ---
        const adminSession = localStorage.getItem('admin_session');
        const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
        const ADMIN_UPLOAD_SECRET = import.meta.env.VITE_ADMIN_UPLOAD_SECRET || "arti-admin-secret-2024-xyz";

        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                // Verify it's a valid admin session
                if (session.email === ADMIN_EMAIL && session.isAdmin) {
                    // Use Admin Secret instead of Firebase Token
                    headers['X-Admin-Secret'] = ADMIN_UPLOAD_SECRET;
                    // Using Admin Secret for authentication
                }
            } catch (e) {
                console.warn('Invalid admin session, falling back to Firebase auth');
            }
        }

        // --- Fallback to Firebase Token for Regular Users ---
        if (!headers['X-Admin-Secret']) {
            const { auth } = await import('@/lib/firebase');

            let user = auth.currentUser;
            if (!user) {
                await new Promise<void>(resolve => {
                    const unsubscribe = auth.onAuthStateChanged((u) => {
                        user = u;
                        unsubscribe();
                        resolve();
                    });
                });
            }

            if (user) {
                const token = await user.getIdToken(true);
                headers['Authorization'] = `Bearer ${token}`;
                // Firebase token acquired
            } else {
                console.error('Upload: User is not logged in. Upload will fail.');
            }
        }

        // Compress image before upload (unless skipped)
        const fileToUpload = skipCompression ? file : await compressImage(file);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const response = await fetch(`${WORKER_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                ...headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Upload error:', error);
            throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();

        if (result.success && result.fileName) {
            // Construct the public URL
            return `${R2_PUBLIC_URL}/${result.fileName}`;
        }

        return null;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};

// Delete image from R2 via Worker
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
        // Get current auth session from Firebase
        const { auth } = await import('@/lib/firebase');
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : undefined;

        // Extract filename from URL
        const url = new URL(imageUrl);
        const fileName = url.pathname.substring(1); // Remove leading slash

        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${WORKER_URL}/delete/${encodeURIComponent(fileName)}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Delete failed:', error);
        return false;
    }
};

// Convert file to base64 (useful for previews)
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// Get image dimensions from file
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

// Calculate aspect ratio
export const calculateAspectRatio = (width: number, height: number): number => {
    return Number((width / height).toFixed(2));
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Unsupported file type. Allowed: JPEG, PNG, GIF, WebP' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File too large. Maximum: 10MB' };
    }

    return { valid: true };
};
