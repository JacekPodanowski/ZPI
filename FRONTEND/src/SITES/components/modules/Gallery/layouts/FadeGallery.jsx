import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMedia } from '../helpers';

const FadeGallery = ({ content, style }) => {
  const { images = [] } = content;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentItem = images[currentIndex];
  const imgUrlRaw = typeof currentItem === 'string' ? currentItem : currentItem?.url;
  const caption = typeof currentItem === 'object' ? currentItem?.caption : '';
  const isMockUrl = imgUrlRaw && imgUrlRaw.includes('picsum.photos/seed/');
  const shouldShowCaption = isMockUrl || (caption && caption.trim());

  return (
  <div className={`${style.spacing} px-4`} style={{ backgroundColor: style.background }}>
      <div className="max-w-4xl mx-auto relative">
  <div className={`relative h-96 ${style.rounded} overflow-hidden ${style.shadows}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {renderMedia(imgUrlRaw, caption || '', 'w-full h-full object-cover')}
              {shouldShowCaption && caption && caption.trim() && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                  <p className="text-center">{caption}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full ${style.animations}`}
              style={{
                backgroundColor: idx === currentIndex ? style.primary : style.grey
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FadeGallery;
