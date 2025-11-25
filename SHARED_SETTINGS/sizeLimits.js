// config/sizeLimits.js

/**
 * Size limits and media constraints for the application
 * All sizes are in bytes unless specified otherwise
 */

export const SIZE_LIMITS = {
  // ============================================
  // GLOBAL USER LIMITS
  // ============================================
  MAX_TOTAL_STORAGE_PER_USER: 1024 * 1024 * 1024, // 1GB per user
  MAX_PAGES_PER_USER: 10, // Maximum number of pages per user
  MAX_SITE_SIZE: 500 * 1024 * 1024, // 500MB per site
  
  // ============================================
  // IMAGE LIMITS
  // ============================================
  // Upload limits (before optimization)
  MAX_IMAGE_UPLOAD_SIZE: 25 * 1024 * 1024, // 25MB raw upload
  
  // Final storage limits (after WebP conversion)
  MAX_IMAGE_FINAL_SIZE: 5 * 1024 * 1024, // 5MB after compression
  
  // Image dimensions
  MAX_IMAGE_WIDTH: 1920, // pixels
  MAX_IMAGE_HEIGHT: 1080, // pixels
  
  // Allowed formats
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_IMAGE_MIMETYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // ============================================
  // VIDEO LIMITS
  // ============================================
  MAX_VIDEO_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB per video
  MAX_VIDEO_DURATION: 600, // 10 minutes in seconds
  
  // Allowed formats
  ALLOWED_VIDEO_FORMATS: ['mp4', 'webm', 'mov'],
  ALLOWED_VIDEO_MIMETYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ],
  
  // ============================================
  // WEBP CONVERSION SETTINGS
  // ============================================
  WEBP_QUALITY: 90, // Default quality for images
  WEBP_QUALITY_THUMBNAIL: 75, // Lower quality for thumbnails
  WEBP_QUALITY_AVATAR: 90, // High quality for avatars (small size)
  
  // ============================================
  // RESPONSIVE IMAGE SIZES
  // ============================================
  THUMBNAIL_SIZE: 300, // pixels (width)
  MEDIUM_SIZE: 800, // pixels (width)
  LARGE_SIZE: 1920, // pixels (width)
  AVATAR_SIZE: 512, // pixels (square, will be displayed as circle in CSS)
  
  // ============================================
  // CACHE & TEMPORARY STORAGE
  // ============================================
  TEMP_STORAGE_EXPIRE: 24 * 60 * 60, // 24 hours in seconds
  TEMP_STORAGE_CLEANUP_INTERVAL: 6 * 60 * 60, // Clean every 6 hours
  MAX_TEMP_STORAGE_PER_USER: 100 * 1024 * 1024, // 100MB in temp/cache
  
  // ============================================
  // FILE PROCESSING
  // ============================================
  BATCH_PROCESSING_LIMIT: 5, // Process max 5 files simultaneously
  PROCESSING_TIMEOUT: 30000, // 30 seconds per file
  
  // ============================================
  // BANDWIDTH & TRANSFER
  // ============================================
  MAX_MONTHLY_BANDWIDTH_PER_USER: 10 * 1024 * 1024 * 1024, // 10GB/month
};