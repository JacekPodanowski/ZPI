import React from 'react';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';

const CompactVideo = ({ content, vibe, theme }) => {
  const { videoUrl, caption, captionColor, muted } = content;
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted });
  const isSelfHosted = Boolean(embedUrl && embedUrl.startsWith('/media/'));
  const fullSelfHostedUrl = isSelfHosted ? resolveMediaUrl(embedUrl) : '';
  const hasValidVideo = fullSelfHostedUrl ? fullSelfHostedUrl.trim() !== '' : Boolean(embedUrl);

  return (
    <section className="py-6 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-3xl mx-auto">
        <div className={`aspect-video ${vibe.rounded} overflow-hidden ${vibe.shadows} bg-black/10`}>
          {hasValidVideo && (
            isSelfHosted ? (
              <video
                src={fullSelfHostedUrl}
                controls
                muted={muted}
                autoPlay={muted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={caption || 'Video'}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm" style={{ color: theme.grey }}>
                Dodaj wideo
              </div>
            )
          )}
        </div>
        {caption && (
          <p className="text-sm text-center mt-3" style={{ color: captionColor || theme.grey }}>
            {caption}
          </p>
        )}
      </div>
    </section>
  );
};

export default CompactVideo;
