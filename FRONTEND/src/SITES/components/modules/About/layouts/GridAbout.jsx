// layouts/GridAbout.jsx - Grid layout with image and highlights
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const GridAbout = ({ content, style }) => {
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
        <h2 
          className={`${headingClass} text-center`}
          style={{ color: primaryColor }}
        >
          {content.title}
        </h2>
        
        {/* Image and Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mt-8 md:mt-12">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={content.title}
              className={`w-full h-auto ${roundedClass} ${shadowClass}`}
            />
          )}
          
          <div>
            <p 
              className={textClass}
              style={{ color: textColor }}
            >
              {content.description}
            </p>
          </div>
        </div>
        
        {/* Highlights Grid */}
        {highlightsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
            {highlightsData.map((highlight, index) => (
              <div 
                key={index}
                className={`${cardClass} ${animationClass} text-center`}
                style={{ borderColor }}
              >
                <h3 
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: primaryColor }}
                >
                  {highlight.title}
                </h3>
                <p 
                  className={`${textClass} text-sm`}
                  style={{ color: textColor }}
                >
                  {highlight.description || highlight.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GridAbout;
