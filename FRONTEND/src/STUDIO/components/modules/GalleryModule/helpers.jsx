import { resolveMediaUrl } from '../../../../config/api';
import { isVideoUrl } from '../../../../utils/mediaUtils';

export const renderMedia = (rawUrl, altText, className = 'w-full h-full object-cover') => {
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

  return (
    <img
      src={resolvedUrl}
      alt={altText}
      className={className}
    />
  );
};
