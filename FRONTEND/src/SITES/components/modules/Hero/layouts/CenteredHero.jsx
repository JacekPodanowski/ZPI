// layouts/CenteredHero.jsx - Centered layout with mobile responsiveness
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const CenteredHero = ({ content, style, isEditing, moduleId, pageId, typography }) => {
  console.log('[CenteredHero] content:', JSON.stringify(content, null, 2));
  console.log('[CenteredHero] isEditing:', isEditing, 'moduleId:', moduleId, 'pageId:', pageId);

  // Only use editor store when in editing mode
  const selectedModuleId = isEditing ? useNewEditorStore(state => state.selectedModuleId) : null;
  const updateModuleContent = isEditing ? useNewEditorStore(state => state.updateModuleContent) : null;
  
  const isModuleSelected = selectedModuleId === moduleId;

  const heroMedia = content.image || content.backgroundImage;
  const overlayColor = content.backgroundOverlayColor ?? (heroMedia ? 'rgba(0, 0, 0, 0.35)' : undefined);
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-5xl md:text-6xl';
  const textClass = style?.textSize || 'text-lg';
  const buttonClass = style?.buttonStyle || 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold';
  const backgroundColor = content.bgColor || style?.surface || style?.background || '#f0f0ed';
  const primaryColor = content.textColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';
  const ctaBackground = content.ctaBgColor || style?.accent || style?.primary || primaryColor;
  const ctaTextColor = content.ctaTextColor || style?.background || '#ffffff';

  const handleTitleSave = (newTitle) => {
    if (updateModuleContent && pageId && moduleId) {
      updateModuleContent(pageId, moduleId, { title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle) => {
    if (updateModuleContent && pageId && moduleId) {
      updateModuleContent(pageId, moduleId, { subtitle: newSubtitle });
    }
  };

  const titleFont = typography?.titleFont;
  const bodyFont = typography?.textFont;

  return (
    <section 
      className={`${spacingClass} ${roundedClass} text-center relative overflow-hidden py-16 px-4 md:py-24 md:px-6 lg:py-32`}
      style={{ 
        backgroundColor,
        fontFamily: bodyFont
      }}
    >
      <BackgroundMedia media={heroMedia} overlayColor={overlayColor} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {isEditing ? (
          <EditableText
            value={content.title || content.heading}
            onSave={handleTitleSave}
            as="h1"
            className={headingClass}
            style={{ color: primaryColor, fontFamily: titleFont }}
            placeholder="Click to edit title..."
            multiline
            isModuleSelected={isModuleSelected}
          />
        ) : (
          <h1 
            className={headingClass}
            style={{ color: primaryColor, fontFamily: titleFont }}
          >
            {content.title || content.heading}
          </h1>
        )}
        
        {(isEditing || content.subtitle || content.subheading) && (
          isEditing ? (
            <EditableText
              value={content.subtitle || content.subheading}
              onSave={handleSubtitleSave}
              as="p"
              className={`${textClass} mt-4 md:mt-6`}
              style={{ color: textColor, fontFamily: bodyFont }}
              placeholder="Click to edit subtitle..."
              multiline
              isModuleSelected={isModuleSelected}
            />
          ) : (content.subtitle || content.subheading) ? (
            <p 
              className={`${textClass} mt-4 md:mt-6`} 
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {content.subtitle || content.subheading}
            </p>
          ) : null
        )}
        
        {content.showButton !== false && content.ctaText && (
          <a href={content.ctaLink}>
            <button 
              className={`${buttonClass} ${shadowClass} ${animationClass} mt-8 md:mt-10`}
              style={{ 
                backgroundColor: ctaBackground, 
                color: ctaTextColor,
                fontFamily: bodyFont 
              }}
            >
              {content.ctaText}
            </button>
          </a>
        )}
      </div>
    </section>
  );
};

export default CenteredHero;
