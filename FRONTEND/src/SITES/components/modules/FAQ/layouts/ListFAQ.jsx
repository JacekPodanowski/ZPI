import React from 'react';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const ListFAQ = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleIntroSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { intro: newValue });
  };

  const handleQuestionSave = (index, newValue) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], question: newValue };
    updateModuleContent(pageId, moduleId, { items: newItems });
  };

  const handleAnswerSave = (index, newValue) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], answer: newValue };
    updateModuleContent(pageId, moduleId, { items: newItems });
  };

  const { title = 'FAQ', intro = '', items = [], bgColor, textColor } = content;

  return (
  <section className={`${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor || style.background }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {(isEditing || title) && (
              isEditing ? (
                <EditableText
                  value={title || ''}
                  onSave={handleTitleSave}
                  as="h2"
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold"
                  style={{ color: textColor || style.text }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold`} style={{ color: textColor || style.text }}>
                  {title}
                </h2>
              )
            )}
            {(isEditing || intro) && (
              isEditing ? (
                <EditableText
                  value={intro || ''}
                  onSave={handleIntroSave}
                  as="p"
                  className={style.textSize}
                  style={{ color: textColor || style.text }}
                  placeholder="Click to edit intro..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p className={style.textSize} style={{ color: textColor || style.text }}>
                  {intro}
                </p>
              )
            )}
          </div>
        )}

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-2">
              {isEditing ? (
                <EditableText
                  value={item.question || ''}
                  onSave={(newValue) => handleQuestionSave(index, newValue)}
                  as="h3"
                  className="text-lg font-semibold"
                  style={{ color: textColor || style.primary }}
                  placeholder="Click to edit question..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h3 className="text-lg font-semibold" style={{ color: textColor || style.primary }}>
                  {item.question}
                </h3>
              )}
              {isEditing ? (
                <EditableText
                  value={item.answer || ''}
                  onSave={(newValue) => handleAnswerSave(index, newValue)}
                  as="div"
                  className="prose prose-sm max-w-none opacity-80"
                  style={{ color: textColor || style.text }}
                  placeholder="Click to edit answer..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none opacity-80"
                  style={{ color: textColor || style.text }}
                  dangerouslySetInnerHTML={{ __html: item.answer || '' }}
                />
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-sm opacity-40">
              Dodaj pytania w konfiguratorze.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ListFAQ;
