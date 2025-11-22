// layouts/FullscreenHero.jsx - Fullscreen layout with background image
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const FullscreenHero = ({ content, style }) => {
  const heroMedia = content.image || content.backgroundImage;
  const overlayColor = content.overlay
    ? content.backgroundOverlayColor || 'rgba(0, 0, 0, 0.5)'
    : undefined;
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-5xl md:text-7xl';
  const textClass = style?.textSize || 'text-lg';
  const buttonClass = style?.buttonStyle || 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold';
  const backgroundColor = content.bgColor || style?.surface || style?.background || '#0c0c0c';
  const fallbackLight = content.overlay ? '#ffffff' : undefined;
  const primaryColor = content.textColor || style?.primary || fallbackLight || '#f5f5f5';
  const textColor = content.textColor || style?.text || fallbackLight || '#e0e0e0';
  const ctaBackground = content.ctaBgColor || style?.accent || style?.primary || primaryColor;
  const ctaTextColor = content.ctaTextColor || style?.background || '#ffffff';

  return (
    <section 
      className={`relative min-h-[70vh] md:min-h-[80vh] lg:min-h-[100vh] flex items-center justify-center ${roundedClass} py-16 px-4 md:py-24 md:px-6 lg:py-32`}
      style={{
        backgroundColor
      }}
    >
      <BackgroundMedia media={heroMedia} overlayColor={overlayColor} />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <h1 
          className={headingClass}
          style={{ color: primaryColor }}
        >
          {content.title || content.heading}
        </h1>
        
        {(content.subtitle || content.subheading) && (
          <p 
            className={`${textClass} mt-4 md:mt-6`} 
            style={{ color: textColor }}
          >
            {content.subtitle || content.subheading}
          </p>
        )}
        
        {content.showButton !== false && content.ctaText && (
          <a href={content.ctaLink}>
            <button 
              className={`${buttonClass} ${shadowClass} ${animationClass} mt-8 md:mt-10`}
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
    </section>
  );
};

export default FullscreenHero;
