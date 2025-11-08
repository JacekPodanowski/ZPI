import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMedia } from '../helpers';

const SlideshowGallery = ({ content, vibe, theme }) => {
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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

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
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.5 }}
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

          <button
            onClick={handlePrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 ${vibe.rounded} bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center ${vibe.shadows} ${vibe.animations} z-10`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 ${vibe.rounded} bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center ${vibe.shadows} ${vibe.animations} z-10`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
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

export default SlideshowGallery;
