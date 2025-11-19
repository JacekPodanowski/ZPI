// layouts/NarrativeAbout.jsx - Narrative layout with side image
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const NarrativeAbout = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-4xl';
  const textClass = style?.textSize || 'text-base';
  const backgroundColor = content.bgColor || style?.background || '#f0f0ed';
  const primaryColor = content.primaryColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';
  
  // Support both old (milestones/highlights) and new (timeline/keyHighlights) field names
  const timelineData = content.timeline || content.milestones || [];
  const highlightsData = content.keyHighlights || content.highlights || [];

  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden`}
      style={{ backgroundColor }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-6xl mx-auto relative z-10">
        <h2 
          className={`${headingClass} text-center mb-4`}
          style={{ color: primaryColor }}
        >
          {content.title}
        </h2>
        
        {content.subtitle && (
          <p 
            className={`${textClass} text-center italic mb-8 max-w-3xl mx-auto`}
            style={{ color: textColor, opacity: 0.9 }}
          >
            {content.subtitle}
          </p>
        )}
        
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
            {/* Description */}
            <div 
              className={`${textClass} leading-relaxed prose prose-lg max-w-none`}
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: content.description }}
            />
            
            {/* Key Highlights */}
            {highlightsData.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h3 
                  className="text-2xl font-semibold mb-6"
                  style={{ color: primaryColor }}
                >
                  Kluczowe Osiągnięcia
                </h3>
                <div className="grid gap-4">
                  {highlightsData.map((highlight, index) => (
                    <div 
                      key={index}
                      className={`flex gap-4 items-start ${animationClass}`}
                    >
                      <div 
                        className={`${roundedClass} p-3 flex-shrink-0`}
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <span className="text-2xl">
                          {highlight.icon === 'award' ? '🏆' : 
                           highlight.icon === 'star' ? '⭐' : 
                           highlight.icon === 'heart' ? '❤️' : '✨'}
                        </span>
                      </div>
                      <div>
                        <h4 
                          className="font-semibold text-lg mb-1"
                          style={{ color: primaryColor }}
                        >
                          {highlight.title}
                        </h4>
                        <p 
                          className={`${textClass}`}
                          style={{ color: textColor }}
                        >
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timeline */}
            {timelineData.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h3 
                  className="text-2xl font-semibold mb-6"
                  style={{ color: primaryColor }}
                >
                  Moja Droga
                </h3>
                <div className="space-y-6">
                  {timelineData.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`flex gap-4 ${animationClass}`}
                    >
                      <div 
                        className={`${roundedClass} px-4 py-2 h-fit ${shadowClass}`}
                        style={{ 
                          backgroundColor: primaryColor, 
                          color: style?.background || '#ffffff' 
                        }}
                      >
                        <span className="font-bold">{milestone.year}</span>
                      </div>
                      <div className="flex-1">
                        <h4 
                          className="font-semibold text-lg mb-1"
                          style={{ color: primaryColor }}
                        >
                          {milestone.title}
                        </h4>
                        <p 
                          className={textClass}
                          style={{ color: textColor }}
                        >
                          {milestone.description || milestone.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeAbout;
