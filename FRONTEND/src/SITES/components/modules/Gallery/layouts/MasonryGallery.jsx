import React from 'react';
import { motion } from 'framer-motion';
import { renderMedia } from '../helpers';

const MasonryGallery = ({ content, style }) => {
  const { images = [], columns = 3, gap = '1rem' } = content;

  if (!images || images.length === 0) {
    return null;
  }

  return (
  <div className={`${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: style.background }}>
      <div 
        className="max-w-6xl mx-auto"
        style={{
          columnCount: 1,
          columnGap: gap
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .max-w-6xl.mx-auto {
              column-count: ${Math.min(columns, 2)} !important;
            }
          }
          @media (min-width: 1024px) {
            .max-w-6xl.mx-auto {
              column-count: ${columns} !important;
            }
          }
        `}</style>
        {images.map((item, idx) => {
          const imgUrlRaw = typeof item === 'string' ? item : item.url;
          const caption = typeof item === 'object' ? item.caption : '';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`mb-4 ${style.rounded} overflow-hidden ${style.shadows} cursor-pointer break-inside-avoid`}
            >
              {renderMedia(imgUrlRaw, caption || `Gallery ${idx + 1}`, 'w-full object-cover')}
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

export default MasonryGallery;
