import React from 'react';
import { motion } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { renderMedia } from '../helpers';

const GridGallery = ({ content, style }) => {
  const { images = [], columns = 3, gap = '1rem', backgroundImage, backgroundOverlayColor } = content;
  const overlayColor = backgroundOverlayColor ?? (backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);

  if (!images || images.length === 0) {
    return (
  <div className={`${style.spacing} px-4 text-center`} style={{ color: style.text }}>
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
  <div className={`${style.spacing} py-12 px-4 md:py-20 md:px-6 relative overflow-hidden`} style={{ backgroundColor: content.bgColor || style.background }}>
      <BackgroundMedia media={backgroundImage} overlayColor={overlayColor} />
      <div 
        className={`max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 relative z-10`}
        style={{
          gridTemplateColumns: {
            1: '1fr',
            2: 'repeat(1, 1fr)',
            3: 'repeat(1, 1fr)'
          }[columns] || `repeat(1, 1fr)`,
          gap: gap
        }}
        // Responsive grid for desktop
        data-columns={columns}
      >
        <style>{`
          @media (min-width: 640px) {
            [data-columns="2"] { grid-template-columns: repeat(2, 1fr); }
            [data-columns="3"] { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            [data-columns="3"] { grid-template-columns: repeat(3, 1fr); }
          }
        `}</style>
        {images.map((item, idx) => {
          const imgUrlRaw = typeof item === 'string' ? item : item.url;
          const caption = typeof item === 'object' ? item.caption : '';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${style.rounded} overflow-hidden ${style.shadows} cursor-pointer`}
            >
              {renderMedia(imgUrlRaw, caption || `Gallery ${idx + 1}`, 'w-full h-64 object-cover')}
              {caption && (
                <div className="p-3 bg-white">
                  <p className="text-sm text-center" style={{ color: style.text }}>
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
