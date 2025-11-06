import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';

const StandardVideo = ({ content, vibe, theme }) => {
  const { videoUrl, caption, captionColor, bgColor, muted } = content;
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted });
  const isSelfHosted = Boolean(embedUrl && embedUrl.startsWith('/media/'));
  const fullSelfHostedUrl = isSelfHosted ? resolveMediaUrl(embedUrl) : '';
  const hasValidVideo = fullSelfHostedUrl ? fullSelfHostedUrl.trim() !== '' : Boolean(embedUrl);

  return (
    <section className={`${vibe.spacing} px-6`} style={{ backgroundColor: bgColor || theme.background }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className={`w-full aspect-video ${vibe.rounded} overflow-hidden ${vibe.shadows} bg-black/20`}
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
              >
                Your browser does not support the video tag.
              </video>
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
              <div className="w-full h-full grid place-items-center text-sm text-gray-500 bg-white/60">
                Ustaw adres URL wideo w konfiguratorze
              </div>
            )
          )}
        </motion.div>
        {caption && (
          <p
            className="text-sm text-center max-w-3xl"
            style={{ color: captionColor || theme.grey }}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  );
};

export default StandardVideo;
