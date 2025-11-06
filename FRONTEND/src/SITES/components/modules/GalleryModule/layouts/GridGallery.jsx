import React from 'react';
import { motion } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const GridGallery = ({ content, vibe, theme }) => {
  const { images = [], columns = 3, gap = '1rem', backgroundImage, backgroundOverlayColor } = content;
  const overlayColor = backgroundOverlayColor ?? (backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);

  if (!images || images.length === 0) {
    return (
      <div className={`${vibe.spacing} px-4 text-center`} style={{ color: theme.text }}>
        <div className="max-w-4xl mx-auto">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Galeria - dodaj zdjęcia w konfiguratorze</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${vibe.spacing} px-4 relative overflow-hidden`}
      style={{
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={backgroundImage} overlayColor={overlayColor} />
      <div 
        className="max-w-6xl mx-auto grid relative z-10"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gap
        }}
      >
        {images.map((item, idx) => {
          const imgUrlRaw = typeof item === 'string' ? item : item.url;
          const caption = typeof item === 'object' ? item.caption : '';
          const resolvedUrl = imgUrlRaw ? resolveMediaUrl(imgUrlRaw) : '';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${vibe.rounded} overflow-hidden ${vibe.shadows} cursor-pointer`}
            >
              <img 
                src={resolvedUrl} 
                alt={caption || `Gallery ${idx + 1}`}
                className="w-full h-64 object-cover"
              />
              {caption && (
                <div className="p-3 bg-white">
                  <p className="text-sm text-center" style={{ color: theme.text }}>
                    {caption}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GridGallery;
