// layouts/NarrativeAbout.jsx - Narrative layout with side image
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const NarrativeAbout = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const headingClass = style?.headingSize || 'text-4xl';
  const textClass = style?.textSize || 'text-base';
  const backgroundColor = content.bgColor || style?.background || '#f0f0ed';
  const primaryColor = content.primaryColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';

  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden`}
      style={{ backgroundColor }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-6xl mx-auto relative z-10">
        <h2 
          className={`${headingClass} text-center`}
          style={{ color: primaryColor }}
        >
          {content.title}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start mt-8 md:mt-12">
          {/* Image */}
          {imageUrl && (
            <div className="md:col-span-1">
              <img 
                src={imageUrl} 
                alt={content.title}
                className={`w-full h-auto ${roundedClass} ${shadowClass} sticky top-8`}
              />
            </div>
          )}
          
          {/* Narrative Text */}
          <div className={imageUrl ? 'md:col-span-2' : 'md:col-span-3'}>
            <p 
              className={`${textClass} leading-relaxed whitespace-pre-line`}
              style={{ color: textColor }}
            >
              {content.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeAbout;
