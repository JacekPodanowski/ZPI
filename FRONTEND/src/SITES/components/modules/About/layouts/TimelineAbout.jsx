// layouts/TimelineAbout.jsx - Timeline layout
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const TimelineAbout = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
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
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 
          className={`${headingClass} text-center`}
          style={{ color: primaryColor }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${textClass} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
            style={{ color: textColor }}
          >
            {content.description}
          </p>
        )}
        
        {/* Timeline */}
        <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
          {content.milestones?.map((milestone, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-4 md:gap-8 items-start ${animationClass}`}
            >
              <div 
                className={`${roundedClass} px-4 py-2 ${shadowClass} flex-shrink-0`}
                style={{ 
                  backgroundColor: primaryColor, 
                  color: style?.background || '#ffffff' 
                }}
              >
                <span className="font-bold text-lg md:text-xl">{milestone.year}</span>
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-2"
                  style={{ color: primaryColor }}
                >
                  {milestone.title}
                </h3>
                <p 
                  className={textClass}
                  style={{ color: textColor }}
                >
                  {milestone.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineAbout;
