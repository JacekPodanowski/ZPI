/**
 * Image Processing Utility
 * 
 * Automatically scales and optimizes images before upload to reduce backend load.
 * Users can upload large files, but they're automatically scaled down to acceptable sizes.
 * 
 * Usage:
 *   const processedFile = await processImageForUpload(file, 'photo');
 *   const processedAvatar = await processImageForUpload(file, 'avatar');
 */

import { SIZE_LIMITS } from '@shared/sizeLimits';

/**
 * Process an image file for upload
 * Automatically scales down to target dimensions and quality
 * 
 * @param {File} file - The original image file
 * @param {string} type - Type of image: 'photo' or 'avatar'
 * @returns {Promise<File>} Processed image file ready for upload
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
    
    // Get target dimensions
    const targetSize = type === 'avatar' 
        ? SIZE_LIMITS.TARGET_AVATAR_SIZE 
        : null; // Photos use width/height separately
    
    const targetWidth = type === 'avatar' 
        ? targetSize 
        : SIZE_LIMITS.TARGET_PHOTO_WIDTH;
    
    const targetHeight = type === 'avatar' 
        ? targetSize 
        : SIZE_LIMITS.TARGET_PHOTO_HEIGHT;
    
    // Get target storage size
    const maxStoredSize = type === 'avatar'
        ? SIZE_LIMITS.MAX_AVATAR_STORED_SIZE
        : SIZE_LIMITS.MAX_PHOTO_STORED_SIZE;
    
    // Load image
    const img = await loadImage(file);
    
    // Calculate new dimensions
    const { width, height } = calculateDimensions(
        img.width, 
        img.height, 
        targetWidth, 
        targetHeight,
        type === 'avatar' // isSquare
    );
    
    // Scale and compress image
    const processedBlob = await scaleImage(img, width, height, file.type);
    
    // Check if we need to compress more
    let finalBlob = processedBlob;
    if (processedBlob.size > maxStoredSize) {
        // Try with lower quality
        finalBlob = await scaleImage(img, width, height, file.type, 0.7);
        
        // If still too large, scale down dimensions more
        if (finalBlob.size > maxStoredSize) {
            const reducedWidth = Math.floor(width * 0.8);
            const reducedHeight = Math.floor(height * 0.8);
            finalBlob = await scaleImage(img, reducedWidth, reducedHeight, file.type, 0.7);
        }
    }
    
    // Create new File object with processed image
    const processedFile = new File(
        [finalBlob],
        file.name,
        { type: file.type }
    );
    
    return processedFile;
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
 * @param {number} maxWidth - Maximum target width
 * @param {number} maxHeight - Maximum target height
 * @param {boolean} isSquare - If true, crop to square
 * @returns {{ width: number, height: number }}
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight, isSquare = false) {
    if (isSquare) {
        // For avatars, use the smaller dimension to ensure it fits
        const size = Math.min(maxWidth, originalWidth, originalHeight);
        return { width: size, height: size };
    }
    
    // For photos, maintain aspect ratio
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }
    
    return { width, height };
}

/**
 * Scale an image to specified dimensions using canvas
 * @param {HTMLImageElement} img - Source image
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {string} mimeType - Output MIME type
 * @param {number} quality - JPEG/WebP quality (0-1)
 * @returns {Promise<Blob>}
 */
function scaleImage(img, width, height, mimeType, quality = 0.9) {
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
        
        // Convert to blob
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            },
            mimeType,
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
 * @returns {Promise<File[]>} Array of processed files
 */
export async function batchProcessImages(files, type = 'photo', onProgress = null) {
    const processed = [];
    
    for (let i = 0; i < files.length; i++) {
        try {
            const processedFile = await processImageForUpload(files[i], type);
            processed.push(processedFile);
            
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
