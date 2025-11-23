import React from 'react';
import { resolveMediaUrl } from '../../../../../config/api';
import { normaliseVideoUrl, applyPlaybackPreferences } from '../helpers';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const CompactVideo = ({ content, style, isEditing, moduleId, pageId }) => {
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
    <section className="py-6 px-4" style={{ backgroundColor: style.background }}>
      <div className="max-w-3xl mx-auto">
  <div className={`aspect-video ${style.rounded} overflow-hidden ${style.shadows} bg-black/10`}>
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
                title={caption || 'Video'}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm" style={{ color: style.grey }}>
                Dodaj wideo
              </div>
            )
          )}
        </div>
        {(isEditing || caption) && (
          isEditing ? (
            <EditableText
              value={caption || ''}
              onSave={handleCaptionSave}
              as="p"
              className="text-sm text-center mt-3"
              style={{ color: captionColor || style.grey }}
              placeholder="Click to edit caption..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p className="text-sm text-center mt-3" style={{ color: captionColor || style.grey }}>
              {caption}
            </p>
          )
        )}
      </div>
    </section>
  );
};

export default CompactVideo;
