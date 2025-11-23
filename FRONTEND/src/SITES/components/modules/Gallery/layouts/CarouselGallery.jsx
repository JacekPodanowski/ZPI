import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { renderMedia } from '../helpers';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const CarouselGallery = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleCaptionSave = (index, newValue) => {
    const newImages = [...images];
    if (typeof newImages[index] === 'string') {
      newImages[index] = { url: newImages[index], caption: newValue };
    } else {
      newImages[index] = { ...newImages[index], caption: newValue };
    }
    updateModuleContent(pageId, moduleId, { images: newImages });
  };

  const handleImageSave = (index, newUrl) => {
    const newImages = [...images];
    if (typeof newImages[index] === 'string') {
      newImages[index] = newUrl;
    } else {
      newImages[index] = { ...newImages[index], url: newUrl };
    }
    updateModuleContent(pageId, moduleId, { images: newImages });
  };

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
                className={`flex-shrink-0 w-72 sm:w-80 ${style.rounded} overflow-hidden ${style.shadows} ${isEditing ? '' : 'cursor-pointer'} snap-center bg-white`}
              >
                {isEditing ? (
                  <EditableImage
                    value={imgUrlRaw}
                    onSave={(newUrl) => handleImageSave(idx, newUrl)}
                    alt={caption || `Image ${idx + 1}`}
                    className="w-full h-64 object-cover"
                    isModuleSelected={true}
                  />
                ) : (
                  renderMedia(imgUrlRaw, caption || '', 'w-full h-64 object-cover')
                )}
                {(isEditing || (shouldShowCaption && caption && caption.trim())) && (
                  <div className="p-3">
                    {isEditing ? (
                      <EditableText
                        value={caption || ''}
                        onSave={(newValue) => handleCaptionSave(idx, newValue)}
                        as="p"
                        className="text-sm text-center"
                        style={{ color: style.text }}
                        placeholder="Click to edit caption..."
                        multiline
                        isModuleSelected={true}
                      />
                    ) : (
                      <p className="text-sm text-center" style={{ color: style.text }}>
                        {caption}
                      </p>
                    )}
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
