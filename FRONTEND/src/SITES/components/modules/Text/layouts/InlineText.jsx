import React from 'react';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const InlineText = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleContentSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { content: newValue });
  };

  return (
    <div 
      className="inline-block px-4"
      style={{ 
        textAlign: content.align || 'left',
        color: content.textColor || style.text,
        fontSize: content.fontSize || '14px'
      }}
    >
      {isEditing ? (
        <EditableText
          value={content.content || ''}
          onSave={handleContentSave}
          as="span"
          className="inline-block"
          style={{ 
            color: content.textColor || style.text,
            fontSize: content.fontSize || '14px'
          }}
          placeholder="Click to edit text..."
          multiline
          isModuleSelected={true}
        />
      ) : (
        <div
          className="inline-block"
          dangerouslySetInnerHTML={{ __html: content.content || '' }}
        />
      )}
    </div>
  );
};

export default InlineText;
