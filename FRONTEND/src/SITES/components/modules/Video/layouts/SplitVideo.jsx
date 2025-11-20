import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';

const SplitVideo = ({ content, style }) => {
  const { videoUrl, title, description, sideImage, videoPosition = 'left', captionColor, bgColor, muted } = content;
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted });
  const isSelfHosted = Boolean(embedUrl && embedUrl.startsWith('/media/'));
  const fullSelfHostedUrl = isSelfHosted ? resolveMediaUrl(embedUrl) : '';
  const hasValidVideo = fullSelfHostedUrl ? fullSelfHostedUrl.trim() !== '' : Boolean(embedUrl);
  const imageUrl = sideImage ? resolveMediaUrl(sideImage) : '';
  const videoOnLeft = videoPosition === 'left';
  
  const spacingClass = style?.spacing || 'py-12 px-4 md:py-20 md:px-6';
  const roundedClass = style?.rounded || 'rounded-xl';
  const shadowClass = style?.shadows || 'shadow-lg';
  const headingClass = style?.headingSize || 'text-3xl md:text-4xl';
  const textClass = style?.textSize || 'text-base';
  const backgroundColor = bgColor || style?.background || '#f0f0ed';
  const primaryColor = style?.primary || '#1e1e1e';
  const textColor = captionColor || style?.text || '#333333';

  return (
    <section className={spacingClass} style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 
            className={`${headingClass} text-center mb-8 md:mb-12`}
            style={{ color: primaryColor }}
          >
            {title}
          </h2>
        )}
        
        <div className={`
          grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center
          ${videoOnLeft ? '' : 'md:grid-flow-dense'}
        `}>
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className={`${videoOnLeft ? '' : 'md:col-start-2'}`}
          >
            <div className={`w-full aspect-video ${roundedClass} overflow-hidden ${shadowClass} bg-black/20`}>
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
                    title={title || 'Embedded Video'}
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
            </div>
          </motion.div>
          
          {/* Text or Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${videoOnLeft ? '' : 'md:col-start-1 md:row-start-1'}`}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title || 'Video companion image'}
                className={`w-full h-full object-cover ${roundedClass} ${shadowClass}`}
              />
            ) : description ? (
              <div className="space-y-4">
                <p 
                  className={`${textClass} leading-relaxed`}
                  style={{ color: textColor }}
                >
                  {description}
                </p>
              </div>
            ) : (
              <div 
                className={`w-full h-full min-h-[300px] ${roundedClass} ${shadowClass} bg-neutral-200 flex items-center justify-center`}
              >
                <p className="text-neutral-500">Dodaj opis lub obrazek w konfiguratorze</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SplitVideo;
