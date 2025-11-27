/**
 * Size limits loaded from shared JSON config.
 * Edit SHARED_SETTINGS/sizeLimits.json and run sync.bat
 */
import sizeLimitsJson from './sizeLimits.json';

// Convert MB/KB to bytes
const MB = 1024 * 1024;
const KB = 1024;

export const SIZE_LIMITS = {
  // Global limits
  MAX_TOTAL_STORAGE_PER_USER: sizeLimitsJson.MAX_TOTAL_STORAGE_PER_USER_MB * MB,
  MAX_PAGES_PER_USER: sizeLimitsJson.MAX_PAGES_PER_USER,
  MAX_SITE_SIZE: sizeLimitsJson.MAX_SITE_SIZE_MB * MB,

  // Photo limits
  MAX_PHOTO_UPLOAD_SIZE: sizeLimitsJson.MAX_PHOTO_UPLOAD_SIZE_MB * MB,
  MAX_PHOTO_STORED_SIZE: sizeLimitsJson.MAX_PHOTO_STORED_SIZE_MB * MB,
  MAX_PHOTO_DIMENSION: sizeLimitsJson.MAX_PHOTO_DIMENSION_PX,

  // Avatar limits
  MAX_AVATAR_UPLOAD_SIZE: sizeLimitsJson.MAX_AVATAR_UPLOAD_SIZE_MB * MB,
  MAX_AVATAR_STORED_SIZE: sizeLimitsJson.MAX_AVATAR_STORED_SIZE_MB * MB,
  TARGET_AVATAR_SIZE: sizeLimitsJson.TARGET_AVATAR_SIZE_PX,

  // Backend validation
  BACKEND_MAX_IMAGE_SIZE: sizeLimitsJson.BACKEND_MAX_IMAGE_SIZE_MB * MB,
  BACKEND_MAX_AVATAR_SIZE: sizeLimitsJson.BACKEND_MAX_AVATAR_SIZE_MB * MB,

  // Image formats
  ALLOWED_IMAGE_FORMATS: sizeLimitsJson.ALLOWED_IMAGE_FORMATS,
  ALLOWED_IMAGE_MIMETYPES: sizeLimitsJson.ALLOWED_IMAGE_MIMETYPES,
  MAX_SVG_SIZE: sizeLimitsJson.MAX_SVG_SIZE_KB * KB,

  // Video limits
  MAX_VIDEO_UPLOAD_SIZE: sizeLimitsJson.MAX_VIDEO_UPLOAD_SIZE_MB * MB,
  MAX_VIDEO_DURATION: sizeLimitsJson.MAX_VIDEO_DURATION_SECONDS,
  ALLOWED_VIDEO_FORMATS: sizeLimitsJson.ALLOWED_VIDEO_FORMATS,
  ALLOWED_VIDEO_MIMETYPES: sizeLimitsJson.ALLOWED_VIDEO_MIMETYPES,

  // WebP conversion
  WEBP_QUALITY: sizeLimitsJson.WEBP_QUALITY,
  WEBP_QUALITY_THUMBNAIL: sizeLimitsJson.WEBP_QUALITY_THUMBNAIL,

  // Image sizes
  THUMBNAIL_SIZE: sizeLimitsJson.THUMBNAIL_SIZE_PX,
  FULL_SIZE: sizeLimitsJson.FULL_SIZE_PX,
  AVATAR_SIZE: sizeLimitsJson.AVATAR_SIZE_PX,
};
