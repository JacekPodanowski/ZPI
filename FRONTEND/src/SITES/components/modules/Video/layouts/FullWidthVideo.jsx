import React from 'react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const FullWidthVideo = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleCaptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { caption: newValue });
  };

  const { videoUrl, caption, captionColor, muted } = content;
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted });
  const isSelfHosted = Boolean(embedUrl && embedUrl.startsWith('/media/'));
  const fullSelfHostedUrl = isSelfHosted ? resolveMediaUrl(embedUrl) : '';
  const hasValidVideo = fullSelfHostedUrl ? fullSelfHostedUrl.trim() !== '' : Boolean(embedUrl);

  return (
    <section className="w-full" style={{ backgroundColor: style.background }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full aspect-video bg-black"
      >
        {hasValidVideo && (
          isSelfHosted ? (
            <video
              src={fullSelfHostedUrl}
              controls
              muted={muted}
              autoPlay={muted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={caption || 'Embedded Video'}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-gray-500">
              Ustaw adres URL wideo
            </div>
          )
        )}
      </motion.div>
      {(isEditing || caption) && (
        <div className={`${style.spacing} px-6 text-center`}>
          {isEditing ? (
            <EditableText
              value={caption || ''}
              onSave={handleCaptionSave}
              as="p"
              className="max-w-3xl mx-auto text-sm"
              style={{ color: captionColor || style.text }}
              placeholder="Click to edit caption..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p className="max-w-3xl mx-auto text-sm" style={{ color: captionColor || style.text }}>
              {caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default FullWidthVideo;
