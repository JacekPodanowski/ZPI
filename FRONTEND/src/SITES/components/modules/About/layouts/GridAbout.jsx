// layouts/GridAbout.jsx - Grid layout with image and highlights
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const GridAbout = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleDescriptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { description: newValue });
  };

  const handleImageSave = (newUrl) => {
    updateModuleContent(pageId, moduleId, { image: newUrl });
  };

  const handleHighlightFieldSave = (index, field, newValue) => {
    const updatedHighlights = [...(content.keyHighlights || content.highlights || [])];
    updatedHighlights[index] = { ...updatedHighlights[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { keyHighlights: updatedHighlights });
  };

  const handleAddHighlight = () => {
    const highlightsData = content.keyHighlights || content.highlights || [];
    const newHighlight = {
      title: 'Nowy punkt',
      description: 'Kliknij aby edytować opis'
    };
    updateModuleContent(pageId, moduleId, { keyHighlights: [...highlightsData, newHighlight] });
  };

  const handleDeleteHighlight = (index) => {
    const highlightsData = content.keyHighlights || content.highlights || [];
    const updatedHighlights = [...highlightsData];
    updatedHighlights.splice(index, 1);
    updateModuleContent(pageId, moduleId, { keyHighlights: updatedHighlights });
  };

  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-4xl';
  const textClass = style?.textSize || 'text-base';
  const cardClass = style?.cardStyle || 'bg-white/80 backdrop-blur border border-black/5 rounded-xl p-6';
  const backgroundColor = content.bgColor || style?.background || '#f0f0ed';
  const primaryColor = content.primaryColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';
  const borderColor = content.borderColor || style?.colors?.border || style?.borderColor || `${primaryColor}26`;
  
  // Support both old (highlights) and new (keyHighlights) field names
  const highlightsData = content.keyHighlights || content.highlights || [];

  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-7xl mx-auto relative z-10">
        {isEditing ? (
          <EditableText
            value={content.title || ''}
            onSave={handleTitleSave}
            as="h2"
            className={`${headingClass} text-center`}
            style={{ color: primaryColor }}
            placeholder="Click to edit title..."
            multiline
            isModuleSelected={true}
          />
        ) : (
          <h2 
            className={`${headingClass} text-center`}
            style={{ color: primaryColor }}
          >
            {content.title}
          </h2>
        )}
        
        {/* Image and Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mt-8 md:mt-12">
          {isEditing ? (
            <EditableImage
              value={content.image}
              onSave={handleImageSave}
              alt={content.title}
              className={`w-full h-auto ${roundedClass} ${shadowClass}`}
              isModuleSelected={true}
            />
          ) : (
            <img 
              src={imageUrl || 'https://picsum.photos/seed/about-placeholder/800/600'} 
              alt={content.title}
              className={`w-full h-auto ${roundedClass} ${shadowClass}`}
            />
          )}
          
          <div>
            {isEditing ? (
              <EditableText
                value={content.description || ''}
                onSave={handleDescriptionSave}
                as="p"
                className={`${textClass} text-left`}
                style={{ color: textColor, textAlign: 'left' }}
                placeholder="Click to edit description..."
                multiline
                isModuleSelected={true}
              />
            ) : (
              <p 
                className={`${textClass} text-left`}
                style={{ color: textColor }}
              >
                {content.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Highlights Grid */}
        {highlightsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
            {highlightsData.map((highlight, index) => (
              <div 
                key={index}
                className={`${cardClass} ${animationClass} text-center relative`}
                style={{ borderColor }}
              >
                {isEditing && (
                  <button
                    onClick={() => handleDeleteHighlight(index)}
                    className="absolute top-2 right-2 z-10 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                    style={{ fontSize: '18px' }}
                  >
                    ×
                  </button>
                )}
                {isEditing ? (
                  <EditableText
                    value={highlight.title || ''}
                    onSave={(newValue) => handleHighlightFieldSave(index, 'title', newValue)}
                    as="h3"
                    className="text-lg md:text-xl font-semibold mb-2"
                    style={{ color: primaryColor }}
                    placeholder="Click to edit highlight title..."
                    multiline
                    isModuleSelected={true}
                  />
                ) : (
                  <h3 
                    className="text-lg md:text-xl font-semibold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {highlight.title}
                  </h3>
                )}
                {isEditing ? (
                  <EditableText
                    value={highlight.description || highlight.desc || ''}
                    onSave={(newValue) => handleHighlightFieldSave(index, 'description', newValue)}
                    as="p"
                    className={`${textClass} text-sm`}
                    style={{ color: textColor }}
                    placeholder="Click to edit description..."
                    multiline
                    isModuleSelected={true}
                  />
                ) : (
                  <p 
                    className={`${textClass} text-sm`}
                    style={{ color: textColor }}
                  >
                    {highlight.description || highlight.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddHighlight}
              className="bg-[rgb(146,0,32)] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[rgb(114,0,21)] transition-colors shadow-lg"
              style={{ fontSize: '24px' }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GridAbout;
