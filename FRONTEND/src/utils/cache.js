/**
 * Simple localStorage cache utility
 * Provides a type-safe way to cache data with expiration support
 */

const CACHE_PREFIX = 'youreasySite_';
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour default

/**
 * Cache keys used throughout the application
 */
export const CACHE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    SITES: 'sites',
    EVENTS: 'events',
    AVAILABILITY_BLOCKS: 'availability_blocks',
};

/**
 * Get item from cache
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if expired/not found
 */
export const getCache = (key) => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;

        const { value, expiry } = JSON.parse(item);
        
        // Check if expired
        if (expiry && Date.now() > expiry) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }

        return value;
    } catch (error) {
        console.error(`[Cache] Error reading ${key}:`, error);
        return null;
    }
};

/**
 * Set item in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
export const setCache = (key, value, ttl = DEFAULT_TTL) => {
    try {
        const item = {
            value,
            expiry: ttl ? Date.now() + ttl : null
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
        console.error(`[Cache] Error writing ${key}:`, error);
    }
};

/**
 * Remove item from cache
 * @param {string} key - Cache key
 */
export const removeCache = (key) => {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
        console.error(`[Cache] Error removing ${key}:`, error);
    }
};

/**
 * Clear all cache entries
 */
export const clearCache = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('[Cache] Error clearing cache:', error);
    }
};

/**
 * Clear cache for specific user (called on logout)
 * @param {number} userId - User ID
 */
export const clearUserCache = (userId) => {
    try {
        // Clear user-specific caches
        removeCache(`${CACHE_KEYS.USER_PREFERENCES}_${userId}`);
        removeCache(`${CACHE_KEYS.SITES}_${userId}`);
        removeCache(`${CACHE_KEYS.EVENTS}_${userId}`);
        removeCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`);
    } catch (error) {
        console.error('[Cache] Error clearing user cache:', error);
    }
};
