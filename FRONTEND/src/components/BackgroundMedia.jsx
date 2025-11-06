import PropTypes from 'prop-types';
import { resolveMediaUrl } from '../config/api';
import { isVideoUrl } from '../utils/mediaUtils';

const BackgroundMedia = ({
  media,
  className = '',
  imageClassName = 'object-cover',
  videoClassName = 'object-cover',
  overlayColor,
  overlayOpacity = 0.35,
  overlayClassName = '',
  objectFit = 'cover',
  objectPosition = 'center',
  videoProps = {}
}) => {
  const resolvedUrl = media ? resolveMediaUrl(media) : '';

  if (!resolvedUrl) {
    return null;
  }

  const isVideo = isVideoUrl(resolvedUrl);
  const renderOverlay = overlayColor !== undefined && overlayColor !== null && overlayColor !== '';
  const baseMediaStyle = {
    objectFit,
    objectPosition
  };

  const sharedPosterProps = {
    className: `h-full w-full ${isVideo ? videoClassName : imageClassName}`.trim(),
    style: baseMediaStyle
  };

  const videoAttributes = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    ...videoProps
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`.trim()} aria-hidden="true">
      {isVideo ? (
        <video {...videoAttributes} src={resolvedUrl} {...sharedPosterProps} />
      ) : (
        <img src={resolvedUrl} alt="" loading="lazy" decoding="async" {...sharedPosterProps} />
      )}
      {renderOverlay ? (
        <div
          className={`absolute inset-0 ${overlayClassName}`.trim()}
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      ) : null}
    </div>
  );
};

BackgroundMedia.propTypes = {
  media: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  videoClassName: PropTypes.string,
  overlayColor: PropTypes.string,
  overlayOpacity: PropTypes.number,
  overlayClassName: PropTypes.string,
  objectFit: PropTypes.string,
  objectPosition: PropTypes.string,
  videoProps: PropTypes.object
};

export default BackgroundMedia;
