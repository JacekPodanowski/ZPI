import React from 'react';
import { motion } from 'framer-motion';
import { renderMedia } from '../helpers';

const MasonryGallery = ({ content, vibe, theme }) => {
  const { images = [], columns = 3, gap = '1rem' } = content;

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`${vibe.spacing} px-4`} style={{ backgroundColor: theme.background }}>
      <div 
        className="max-w-6xl mx-auto"
        style={{
          columnCount: columns,
          columnGap: gap
        }}
      >
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
              className={`mb-4 ${vibe.rounded} overflow-hidden ${vibe.shadows} cursor-pointer break-inside-avoid`}
            >
              {renderMedia(imgUrlRaw, caption || `Gallery ${idx + 1}`, 'w-full object-cover')}
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

export default MasonryGallery;
