/**
 * Image Processing Utility
 * 
 * Automatically scales and optimizes images before upload to reduce backend load.
 * Users can upload large files, but they're automatically scaled down to acceptable sizes.
 * 
 * For photos: generates both FULL (1920px) and THUMBNAIL (400px) versions
 * For avatars: generates single version (256px square)
 * 
 * Usage:
 *   const { full, thumbnail } = await processImageForUpload(file, 'photo');
 *   const { full } = await processImageForUpload(file, 'avatar');
 */

import { SIZE_LIMITS } from '../shared/sizeLimits';

/**
 * Process an image file for upload
 * For photos: generates FULL (1920px) + THUMBNAIL (400px) versions
 * For avatars: generates single version (256px square)
 * 
 * @param {File} file - The original image file
 * @param {string} type - Type of image: 'photo' or 'avatar'
 * @returns {Promise<{full: File, thumbnail?: File}>} Processed image files ready for upload
 */
export async function processImageForUpload(file, type = 'photo') {
    // Validate input
    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image.');
    }
    
    // Check upload size limit
    const maxUploadSize = type === 'avatar' 
        ? SIZE_LIMITS.MAX_AVATAR_UPLOAD_SIZE 
        : SIZE_LIMITS.MAX_PHOTO_UPLOAD_SIZE;
    
    if (file.size > maxUploadSize) {
        const maxMB = Math.round(maxUploadSize / (1024 * 1024));
        throw new Error(`File too large. Maximum size is ${maxMB}MB.`);
    }
    
    // Load image
    const img = await loadImage(file);
    const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove old extension
    
    // For avatars - single square version
    if (type === 'avatar') {
        const size = Math.min(SIZE_LIMITS.AVATAR_SIZE, img.width, img.height);
        const result = await scaleImage(img, size, size, file.type, SIZE_LIMITS.WEBP_QUALITY / 100);
        
        const fullFile = new File(
            [result.blob],
            baseName + result.extension,
            { type: result.mimeType }
        );
        
        return { full: fullFile };
    }
    
    // For photos - generate FULL + THUMBNAIL
    const fullSize = SIZE_LIMITS.FULL_SIZE;
    const thumbSize = SIZE_LIMITS.THUMBNAIL_SIZE;
    const fullQuality = SIZE_LIMITS.WEBP_QUALITY / 100;
    const thumbQuality = SIZE_LIMITS.WEBP_QUALITY_THUMBNAIL / 100;
    
    // Calculate dimensions for full size
    const fullDims = calculateDimensions(img.width, img.height, fullSize, false);
    
    // Calculate dimensions for thumbnail
    const thumbDims = calculateDimensions(img.width, img.height, thumbSize, false);
    
    // Generate both versions in parallel
    const [fullResult, thumbResult] = await Promise.all([
        scaleImage(img, fullDims.width, fullDims.height, file.type, fullQuality),
        scaleImage(img, thumbDims.width, thumbDims.height, file.type, thumbQuality)
    ]);
    
    // Check if full version needs more compression
    const maxStoredSize = SIZE_LIMITS.MAX_PHOTO_STORED_SIZE;
    let finalFullResult = fullResult;
    
    if (fullResult.blob.size > maxStoredSize) {
        finalFullResult = await scaleImage(img, fullDims.width, fullDims.height, file.type, 0.7);
        
        if (finalFullResult.blob.size > maxStoredSize) {
            const reducedWidth = Math.floor(fullDims.width * 0.8);
            const reducedHeight = Math.floor(fullDims.height * 0.8);
            finalFullResult = await scaleImage(img, reducedWidth, reducedHeight, file.type, 0.7);
        }
    }
    
    // Create File objects
    const fullFile = new File(
        [finalFullResult.blob],
        baseName + finalFullResult.extension,
        { type: finalFullResult.mimeType }
    );
    
    const thumbnailFile = new File(
        [thumbResult.blob],
        baseName + '_thumb' + thumbResult.extension,
        { type: thumbResult.mimeType }
    );
    
    return { full: fullFile, thumbnail: thumbnailFile };
}

/**
 * Load an image file into an Image element
 * @param {File} file - Image file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

/**
 * Calculate target dimensions maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxDimension - Maximum size for width OR height
 * @param {boolean} isSquare - If true, crop to square
 * @returns {{ width: number, height: number }}
 */
function calculateDimensions(originalWidth, originalHeight, maxDimension, isSquare = false) {
    if (isSquare) {
        // For avatars, use the smaller dimension to ensure it fits
        const size = Math.min(maxDimension, originalWidth, originalHeight);
        return { width: size, height: size };
    }
    
    // For photos, maintain aspect ratio
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if larger than max dimension
    if (width > maxDimension || height > maxDimension) {
        const ratio = maxDimension / Math.max(width, height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }
    
    return { width, height };
}

/**
 * Scale an image to specified dimensions using canvas
 * Converts to WebP format for smaller file size
 * @param {HTMLImageElement} img - Source image
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {string} originalMimeType - Original MIME type (used as fallback)
 * @param {number} quality - WebP quality (0-1)
 * @returns {Promise<{blob: Blob, mimeType: string, extension: string}>}
 */
function scaleImage(img, width, height, originalMimeType, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw scaled image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first (smaller files, better quality)
        canvas.toBlob(
            (webpBlob) => {
                if (webpBlob) {
                    resolve({ blob: webpBlob, mimeType: 'image/webp', extension: '.webp' });
                } else {
                    // Fallback to JPEG if WebP not supported
                    canvas.toBlob(
                        (jpegBlob) => {
                            if (jpegBlob) {
                                resolve({ blob: jpegBlob, mimeType: 'image/jpeg', extension: '.jpg' });
                            } else {
                                reject(new Error('Failed to create blob'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                }
            },
            'image/webp',
            quality
        );
    });
}

/**
 * Get human-readable file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file before processing
 * @param {File} file - File to validate
 * @param {string} type - Type: 'photo' or 'avatar'
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImageFile(file, type = 'photo') {
    // Check if file exists
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image' };
    }
    
    // Check allowed formats
    const allowedTypes = SIZE_LIMITS.ALLOWED_IMAGE_MIMETYPES;
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Image format not supported. Please use JPG, PNG, GIF, or WebP.' };
    }
    
    // Check size
    const maxSize = type === 'avatar' 
        ? SIZE_LIMITS.MAX_AVATAR_UPLOAD_SIZE 
        : SIZE_LIMITS.MAX_PHOTO_UPLOAD_SIZE;
    
    if (file.size > maxSize) {
        const maxMB = Math.round(maxSize / (1024 * 1024));
        return { valid: false, error: `File too large. Maximum size is ${maxMB}MB.` };
    }
    
    return { valid: true, error: null };
}

/**
 * Batch process multiple images
 * @param {File[]} files - Array of image files
 * @param {string} type - Type: 'photo' or 'avatar'
 * @param {function} onProgress - Progress callback (current, total)
 * @returns {Promise<Array<{full: File, thumbnail?: File}>>} Array of processed file objects
 */
export async function batchProcessImages(files, type = 'photo', onProgress = null) {
    const processed = [];
    
    for (let i = 0; i < files.length; i++) {
        try {
            const result = await processImageForUpload(files[i], type);
            processed.push(result);
            
            if (onProgress) {
                onProgress(i + 1, files.length);
            }
        } catch (error) {
            console.error(`Failed to process ${files[i].name}:`, error);
            // Continue with other files
        }
    }
    
    return processed;
}
