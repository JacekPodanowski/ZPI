// FRONTEND/src/services/tempMediaCache.js

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
 * The blob URL can be used directly in <img> tags and state.
 * @param {File} file The file object to store.
 * @returns {Promise<{blobUrl: string, cacheId: string, isVideo: boolean}>} The blob URL, cache ID, and file type.
 */
export const storeTempImage = async (file) => {
    if (!file) return null;
    
    const cache = await getCache();
    const cacheId = `temp-image-${crypto.randomUUID()}`;
    
    // Store in Cache API
    await cache.put(cacheId, new Response(file));
    
    // Create blob URL for display
    const blobUrl = URL.createObjectURL(file);
    
    // Track the mapping with metadata
    const isVideo = file.type.startsWith('video/');
    blobToCacheMap.set(blobUrl, { cacheId, isVideo });
    
    console.log('[TempMediaCache] Stored file in cache:', {
        blobUrl,
        cacheId,
        isVideo,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    });
    console.log('[TempMediaCache] Total tracked blob URLs:', blobToCacheMap.size);
    
    return { blobUrl, cacheId, isVideo };
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

