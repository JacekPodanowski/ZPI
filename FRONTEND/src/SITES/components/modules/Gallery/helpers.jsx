import { resolveMediaUrl } from '../../../../config/api';
import { isVideoUrl } from '../../../../utils/mediaUtils';
import { SIZE_LIMITS } from '../../../../shared/sizeLimits';

export const renderMedia = (rawUrl, altText, className = 'w-full h-full object-cover', thumbnails = {}, sizes = '100vw') => {
  const resolvedUrl = resolveMediaUrl(rawUrl);
  const hasValidUrl = resolvedUrl && resolvedUrl.trim() !== '';
  
  if (!hasValidUrl) {
    return (
      <div className={`${className} bg-black/5 grid place-items-center text-sm text-black/40`}>
        Dodaj media
      </div>
    );
  }
  
  if (isVideoUrl(rawUrl)) {
    return (
      <video
        src={resolvedUrl}
        autoPlay
        muted
        loop
        playsInline
        className={className}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  // Check for thumbnail
  const thumbnailUrl = thumbnails[rawUrl] ? resolveMediaUrl(thumbnails[rawUrl]) : null;
  
  if (thumbnailUrl) {
    const thumbSize = SIZE_LIMITS.THUMBNAIL_SIZE || 400;
    const fullSize = SIZE_LIMITS.FULL_SIZE || 1920;
    
    return (
      <img
        src={resolvedUrl}
        srcSet={`${thumbnailUrl} ${thumbSize}w, ${resolvedUrl} ${fullSize}w`}
        sizes={sizes}
        alt={altText}
        className={className}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={altText}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};
