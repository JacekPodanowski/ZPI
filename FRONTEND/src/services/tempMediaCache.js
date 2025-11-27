// FRONTEND/src/services/tempMediaCache.js

import { processImageForUpload } from '../utils/imageProcessing';

const CACHE_NAME = 'temp-image-cache';

// Global map to track blob URLs to their cache IDs and metadata
// This allows us to retrieve files when we need to upload them
// and track file types for proper rendering
const blobToCacheMap = new Map();

/**
 * Gets a handle to the temporary image cache.
 * @returns {Promise<Cache>}
 */
const getCache = () => caches.open(CACHE_NAME);

/**
 * Stores a file in the browser's cache and returns a blob URL.
 * Images are automatically processed (scaled + thumbnail generated).
 * The blob URL can be used directly in <img> tags and state.
 * @param {File} file The file object to store.
 * @param {string} imageType 'photo' or 'avatar' - determines processing
 * @returns {Promise<{blobUrl: string, thumbnailBlobUrl?: string, cacheId: string, thumbnailCacheId?: string, isVideo: boolean}>}
 */
export const storeTempImage = async (file, imageType = 'photo') => {
    if (!file) return null;
    
    const cache = await getCache();
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    // For videos - just store as-is
    if (isVideo) {
        const cacheId = `temp-video-${crypto.randomUUID()}`;
        await cache.put(cacheId, new Response(file));
        const blobUrl = URL.createObjectURL(file);
        blobToCacheMap.set(blobUrl, { cacheId, isVideo: true });
        
        console.log('[TempMediaCache] Stored video in cache:', { blobUrl, cacheId });
        return { blobUrl, cacheId, isVideo: true };
    }
    
    // For images - process (scale + generate thumbnail)
    if (isImage) {
        try {
            const processed = await processImageForUpload(file, imageType);
            
            // Store full-size image
            const fullCacheId = `temp-image-full-${crypto.randomUUID()}`;
            await cache.put(fullCacheId, new Response(processed.full));
            const fullBlobUrl = URL.createObjectURL(processed.full);
            
            // Store metadata for full image
            const fullMetadata = { 
                cacheId: fullCacheId, 
                isVideo: false,
                hasThumb: !!processed.thumbnail
            };
            
            // Store thumbnail if available (photos have thumbnails, avatars don't)
            let thumbnailBlobUrl = null;
            let thumbnailCacheId = null;
            
            if (processed.thumbnail) {
                thumbnailCacheId = `temp-image-thumb-${crypto.randomUUID()}`;
                await cache.put(thumbnailCacheId, new Response(processed.thumbnail));
                thumbnailBlobUrl = URL.createObjectURL(processed.thumbnail);
                
                // Track thumbnail separately
                blobToCacheMap.set(thumbnailBlobUrl, { 
                    cacheId: thumbnailCacheId, 
                    isVideo: false,
                    isThumbnail: true,
                    fullBlobUrl: fullBlobUrl
                });
                
                // Link full to thumbnail
                fullMetadata.thumbnailBlobUrl = thumbnailBlobUrl;
                fullMetadata.thumbnailCacheId = thumbnailCacheId;
            }
            
            blobToCacheMap.set(fullBlobUrl, fullMetadata);
            
            console.log('[TempMediaCache] Stored processed image in cache:', {
                fullBlobUrl,
                thumbnailBlobUrl,
                fullCacheId,
                thumbnailCacheId,
                originalSize: file.size,
                processedSize: processed.full.size,
                thumbnailSize: processed.thumbnail?.size
            });
            
            return { 
                blobUrl: fullBlobUrl, 
                thumbnailBlobUrl,
                cacheId: fullCacheId,
                thumbnailCacheId,
                isVideo: false 
            };
        } catch (error) {
            console.error('[TempMediaCache] Failed to process image, storing original:', error);
            // Fallback - store original file
            const cacheId = `temp-image-${crypto.randomUUID()}`;
            await cache.put(cacheId, new Response(file));
            const blobUrl = URL.createObjectURL(file);
            blobToCacheMap.set(blobUrl, { cacheId, isVideo: false });
            return { blobUrl, cacheId, isVideo: false };
        }
    }
    
    // Unknown type - store as-is
    const cacheId = `temp-file-${crypto.randomUUID()}`;
    await cache.put(cacheId, new Response(file));
    const blobUrl = URL.createObjectURL(file);
    blobToCacheMap.set(blobUrl, { cacheId, isVideo: false });
    return { blobUrl, cacheId, isVideo: false };
};

/**
 * Retrieves the File object from cache using a blob URL.
 * @param {string} blobUrl The blob URL (e.g., "blob:http://...").
 * @returns {Promise<File|null>} The File object, or null if not found.
 */
export const retrieveTempImage = async (blobUrl) => {
    if (!blobUrl || !blobUrl.startsWith('blob:')) return null;

    try {
        const metadata = blobToCacheMap.get(blobUrl);
        if (!metadata) {
            console.warn('No cache metadata found for blob URL:', blobUrl);
            return null;
        }

        const cache = await getCache();
        const response = await cache.match(metadata.cacheId);
        if (!response) {
            console.warn('No cached response found for:', metadata.cacheId);
            return null;
        }

        const blob = await response.blob();
        const fileName = metadata.cacheId.split('-').pop() || 'cached-image';
        return new File([blob], fileName, { type: blob.type });
    } catch (error) {
        console.error('Failed to retrieve image from cache:', error);
        return null;
    }
};

/**
 * Clears all cached images and blob URLs. Useful for cleanup.
 * @returns {Promise<boolean>}
 */
export const clearTempImageCache = async () => {
    try {
        // Revoke all blob URLs
        blobToCacheMap.forEach((cacheId, blobUrl) => {
            if (blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(blobUrl);
            }
        });
        
        // Clear the map
        blobToCacheMap.clear();
        
        // Delete the cache
        return await caches.delete(CACHE_NAME);
    } catch (error) {
        console.error('Failed to clear image cache:', error);
        return false;
    }
};

/**
 * Check if a URL is a temporary blob URL from our cache.
 * @param {string} url The URL to check.
 * @returns {boolean}
 */
export const isTempBlobUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const isTracked = url.startsWith('blob:') && blobToCacheMap.has(url);
    if (url.startsWith('blob:') && !isTracked) {
        console.warn('[TempMediaCache] Blob URL not tracked:', url, 'Total tracked:', blobToCacheMap.size);
    }
    return isTracked;
};

/**
 * Check if a blob URL points to a video file.
 * @param {string} url The URL to check.
 * @returns {boolean}
 */
export const isBlobVideo = (url) => {
    if (!isTempBlobUrl(url)) return false;
    const metadata = blobToCacheMap.get(url);
    return metadata ? metadata.isVideo : false;
};

/**
 * Get thumbnail blob URL for a full-size image.
 * @param {string} fullBlobUrl The full-size blob URL.
 * @returns {string|null} Thumbnail blob URL or null if not available.
 */
export const getThumbnailBlobUrl = (fullBlobUrl) => {
    if (!isTempBlobUrl(fullBlobUrl)) return null;
    const metadata = blobToCacheMap.get(fullBlobUrl);
    return metadata?.thumbnailBlobUrl || null;
};

/**
 * Retrieve both full and thumbnail files from cache.
 * @param {string} blobUrl The blob URL (full or thumbnail).
 * @returns {Promise<{full: File|null, thumbnail: File|null}>}
 */
export const retrieveTempImageWithThumbnail = async (blobUrl) => {
    if (!isTempBlobUrl(blobUrl)) return { full: null, thumbnail: null };
    
    const metadata = blobToCacheMap.get(blobUrl);
    if (!metadata) return { full: null, thumbnail: null };
    
    const cache = await getCache();
    
    // Get full image
    const fullResponse = await cache.match(metadata.cacheId);
    const fullBlob = fullResponse ? await fullResponse.blob() : null;
    const fullFile = fullBlob ? new File([fullBlob], 'image.webp', { type: fullBlob.type }) : null;
    
    // Get thumbnail if exists
    let thumbnailFile = null;
    if (metadata.thumbnailCacheId) {
        const thumbResponse = await cache.match(metadata.thumbnailCacheId);
        const thumbBlob = thumbResponse ? await thumbResponse.blob() : null;
        thumbnailFile = thumbBlob ? new File([thumbBlob], 'image_thumb.webp', { type: thumbBlob.type }) : null;
    }
    
    return { full: fullFile, thumbnail: thumbnailFile };
};