import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { renderMedia } from '../helpers';

const CarouselGallery = ({ content, style }) => {
  const { images = [] } = content;
  const scrollContainerRef = useRef(null);

  if (!images || images.length === 0) {
    return null;
  }

  const scrollToImage = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 336;
    
    if (direction === 'next') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
  <div className={`${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: style.background }}>
      <div className="max-w-6xl mx-auto relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((item, idx) => {
            const imgUrlRaw = typeof item === 'string' ? item : item.url;
            const caption = typeof item === 'object' ? item.caption : '';
            const isMockUrl = imgUrlRaw && imgUrlRaw.includes('picsum.photos/seed/');
            const shouldShowCaption = isMockUrl || (caption && caption.trim());
            
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className={`flex-shrink-0 w-72 sm:w-80 ${style.rounded} overflow-hidden ${style.shadows} cursor-pointer snap-center bg-white`}
              >
                {renderMedia(imgUrlRaw, caption || '', 'w-full h-64 object-cover')}
                {shouldShowCaption && caption && caption.trim() && (
                  <div className="p-3">
                    <p className="text-sm text-center" style={{ color: style.text }}>
                      {caption}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => scrollToImage('prev')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 ${style.rounded} bg-white ${style.shadows} flex items-center justify-center hover:bg-gray-100 ${style.animations} z-10`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollToImage('next')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 ${style.rounded} bg-white ${style.shadows} flex items-center justify-center hover:bg-gray-100 ${style.animations} z-10`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

  <div className="text-center mt-4 text-sm opacity-60" style={{ color: style.text }}>
          ← Przewiń, aby zobaczyć więcej →
        </div>
      </div>
    </div>
  );
};

export default CarouselGallery;
