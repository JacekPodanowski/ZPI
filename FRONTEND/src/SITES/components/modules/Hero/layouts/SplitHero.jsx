// layouts/SplitHero.jsx - Split layout with mobile/desktop responsiveness
import { resolveMediaUrl } from '../../../../../config/api';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const SplitHero = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const handleImageSave = (newUrl) => {
    updateModuleContent(pageId, moduleId, { image: newUrl });
  };

  const imageOnLeft = content.imagePosition === 'left';
  const heroMedia = content.image || content.backgroundImage;
  const imageUrl = heroMedia ? resolveMediaUrl(heroMedia) : '';
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
  
  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden py-16 px-4 md:py-24 md:px-6 lg:py-32`}
      style={{
        backgroundColor
      }}
    >
      <div className={`
        max-w-7xl mx-auto 
        grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 
        items-center
        relative z-10
        ${imageOnLeft ? 'md:grid-flow-dense' : ''}
      `}>
        {/* Text Content */}
        <div className={imageOnLeft ? 'md:col-start-2' : ''}>
          {isEditing ? (
            <EditableText
              value={content.title || content.heading || ''}
              onSave={handleTitleSave}
              as="h1"
              className={headingClass}
              style={{ color: primaryColor }}
              placeholder="Click to edit title..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <h1 
              className={headingClass}
              style={{ color: primaryColor }}
            >
              {content.title || content.heading}
            </h1>
          )}
          
          {(isEditing || content.subtitle || content.subheading) && (
            isEditing ? (
              <EditableText
                value={content.subtitle || content.subheading || ''}
                onSave={handleSubtitleSave}
                as="p"
                className={`${textClass} mt-4 md:mt-6`}
                style={{ color: textColor }}
                placeholder="Click to edit subtitle..."
                multiline
                isModuleSelected={true}
              />
            ) : (
              <p className={`${textClass} mt-4 md:mt-6`} style={{ color: textColor }}>
                {content.subtitle || content.subheading}
              </p>
            )
          )}
          
          {content.showButton !== false && content.ctaText && (
            <a href={content.ctaLink}>
              <button 
                className={`${buttonClass} ${shadowClass} ${animationClass} mt-6 md:mt-8`}
                style={{ 
                  backgroundColor: ctaBackground, 
                  color: ctaTextColor 
                }}
              >
                {content.ctaText}
              </button>
            </a>
          )}
        </div>
        
        {/* Image */}
        <div className={`relative w-full h-full ${imageOnLeft ? 'md:col-start-1 md:row-start-1' : ''}`}>
          {isEditing ? (
            <EditableImage
              value={heroMedia}
              onSave={handleImageSave}
              alt={content.title || content.heading || 'Hero image'}
              className={`w-full h-full object-cover ${roundedClass} ${shadowClass}`}
              isModuleSelected={true}
            />
          ) : (
            <img 
              src={imageUrl || 'https://picsum.photos/seed/hero-placeholder/800/600'} 
              alt={content.title || content.heading || 'Hero image'}
              className={`w-full h-full object-cover ${roundedClass} ${shadowClass}`}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default SplitHero;
