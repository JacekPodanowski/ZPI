/**
 * ResponsiveImage - SEO-optimized image component with srcset support
 * 
 * === THUMBNAIL SYSTEM ===
 * When images are uploaded via EditorTopBar, two versions are created:
 * - Full size (1920px max) - stored as main URL
 * - Thumbnail (400px) - stored in config._thumbnails map
 * 
 * The thumbnails map format: { "full-image-url.webp": "thumbnail-url.webp" }
 * 
 * This component uses srcset to let the browser choose optimal size:
 * - Mobile/small screens → load 400px thumbnail (faster)
 * - Desktop/large screens → load 1920px full image (quality)
 * 
 * The 'sizes' prop hints to the browser what display size to expect.
 * Default '100vw' = image fills viewport width.
 * Use '50vw' for half-width images, '(max-width: 768px) 100vw, 50vw' for responsive.
 * 
 * Usage:
 *   <ResponsiveImage 
 *     src="/images/photo.webp" 
 *     thumbnails={config._thumbnails}  // from SiteApp
 *     alt="Description" 
 *     sizes="(max-width: 768px) 100vw, 50vw"
 *   />
 * 
 * Flow: Upload → imageProcessing.js creates both sizes → backend stores both
 *       → EditorTopBar saves _thumbnails map → SiteApp passes to modules
 */

import { SIZE_LIMITS } from '../../shared/sizeLimits';
import { resolveMediaUrl } from '../../config/api';

const ResponsiveImage = ({ 
  src, 
  thumbnails = {},
  alt = '', 
  className = '', 
  style = {},
  loading = 'lazy',
  sizes = '100vw',
  objectFit = 'cover',
  ...props 
}) => {
  // Resolve URLs
  const resolvedSrc = resolveMediaUrl(src);
  const thumbnailUrl = thumbnails[src] ? resolveMediaUrl(thumbnails[src]) : null;
  
  // If we have a thumbnail, use srcset for responsive loading
  if (thumbnailUrl && resolvedSrc) {
    const thumbSize = SIZE_LIMITS.THUMBNAIL_SIZE || 400;
    const fullSize = SIZE_LIMITS.FULL_SIZE || 1920;
    
    return (
      <img
        src={resolvedSrc}
        srcSet={`${thumbnailUrl} ${thumbSize}w, ${resolvedSrc} ${fullSize}w`}
        sizes={sizes}
        alt={alt}
        className={className}
        style={{ objectFit, ...style }}
        loading={loading}
        decoding="async"
        {...props}
      />
    );
  }
  
  // Fallback - no thumbnail available
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={{ objectFit, ...style }}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
};

export default ResponsiveImage;
