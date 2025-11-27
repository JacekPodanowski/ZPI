import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const InlineText = ({ content, style, isEditing, moduleId, pageId, typography }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleContentSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { content: newValue });
  };

  const bodyFont = typography?.textFont;

  return (
    <div 
      className="inline-block px-4"
      style={{ 
        textAlign: content.align || 'left',
        color: content.textColor || style.text,
        fontSize: content.fontSize || '14px',
        fontFamily: bodyFont
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
            fontSize: content.fontSize || '14px',
            fontFamily: bodyFont
          }}
          placeholder="Click to edit text..."
          multiline
          isModuleSelected={true}
        />
      ) : (
        <div
          className="inline-block"
          style={{ fontFamily: bodyFont, color: content.textColor || style.text }}
          dangerouslySetInnerHTML={{ __html: content.content || '' }}
        />
      )}
    </div>
  );
};

export default InlineText;
