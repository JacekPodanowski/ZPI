import React from 'react';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const BlockText = ({ content, style, isEditing, moduleId, pageId, typography }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleContentSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { content: newValue });
  };

  const bodyFont = typography?.textFont;

  return (
    <div 
      className={`${style.spacing} ${style.rounded}`}
      style={{ backgroundColor: style.background, fontFamily: bodyFont }}
    >
      {isEditing ? (
        <EditableText
          value={content.content || ''}
          onSave={handleContentSave}
          as="div"
          className={`max-w-4xl mx-auto ${style.textSize}`}
          style={{ 
            textAlign: content.align || 'left',
            color: content.textColor || style.text,
            fontSize: content.fontSize || '16px',
            fontFamily: bodyFont
          }}
          placeholder="Click to edit text..."
          multiline
          isModuleSelected={true}
        />
      ) : (
        <div
          className={`max-w-4xl mx-auto ${style.textSize}`}
          style={{ 
            textAlign: content.align || 'left',
            color: content.textColor || style.text,
            fontSize: content.fontSize || '16px',
            fontFamily: bodyFont
          }}
          dangerouslySetInnerHTML={{ __html: content.content || '' }}
        />
      )}
    </div>
  );
};

export default BlockText;
