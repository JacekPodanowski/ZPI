import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';

const FullWidthVideo = ({ content, style }) => {
  const { videoUrl, caption, captionColor, muted } = content;
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted });
  const isSelfHosted = Boolean(embedUrl && embedUrl.startsWith('/media/'));
  const fullSelfHostedUrl = isSelfHosted ? resolveMediaUrl(embedUrl) : '';
  const hasValidVideo = fullSelfHostedUrl ? fullSelfHostedUrl.trim() !== '' : Boolean(embedUrl);

  return (
    <section className="w-full" style={{ backgroundColor: style.background }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full aspect-video bg-black"
      >
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
              title={caption || 'Embedded Video'}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-gray-500">
              Ustaw adres URL wideo
            </div>
          )
        )}
      </motion.div>
      {caption && (
        <div className={`${style.spacing} px-6 text-center`}>
          <p className="max-w-3xl mx-auto text-sm" style={{ color: captionColor || style.text }}>
            {caption}
          </p>
        </div>
      )}
    </section>
  );
};

export default FullWidthVideo;
