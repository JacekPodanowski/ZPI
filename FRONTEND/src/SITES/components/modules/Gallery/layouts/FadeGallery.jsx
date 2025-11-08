import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMedia } from '../helpers';

const FadeGallery = ({ content, vibe, theme }) => {
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

  return (
    <div className={`${vibe.spacing} px-4`} style={{ backgroundColor: theme.background }}>
      <div className="max-w-4xl mx-auto relative">
        <div className={`relative h-96 ${vibe.rounded} overflow-hidden ${vibe.shadows}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {renderMedia(imgUrlRaw, caption || `Slide ${currentIndex + 1}`, 'w-full h-full object-cover')}
              {caption && (
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
              className={`w-3 h-3 rounded-full ${vibe.animations}`}
              style={{
                backgroundColor: idx === currentIndex ? theme.primary : theme.grey
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FadeGallery;
