import React from 'react';
import { motion } from 'framer-motion';
import { renderMedia } from '../helpers';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const MasonryGallery = ({ content, style, isEditing, moduleId, pageId }) => {
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
          const isMockUrl = imgUrlRaw && imgUrlRaw.includes('picsum.photos/seed/');
          const shouldShowCaption = isMockUrl || (caption && caption.trim());
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`mb-4 ${style.rounded} overflow-hidden ${style.shadows} ${isEditing ? '' : 'cursor-pointer'} break-inside-avoid`}
            >
              {isEditing ? (
                <EditableImage
                  value={imgUrlRaw}
                  onSave={(newUrl) => handleImageSave(idx, newUrl)}
                  alt={caption || `Image ${idx + 1}`}
                  className="w-full object-cover"
                  isModuleSelected={true}
                />
              ) : (
                renderMedia(imgUrlRaw, caption || '', 'w-full object-cover')
              )}
              {(isEditing || (shouldShowCaption && caption && caption.trim())) && (
                <div className="p-3 bg-white">
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
    </div>
  );
};

export default MasonryGallery;
