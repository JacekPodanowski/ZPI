// layouts/FullscreenHero.jsx - Fullscreen layout with background image
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const FullscreenHero = ({ content, vibe, theme }) => {
  const overlayColor = content.overlay
    ? content.backgroundOverlayColor || 'rgba(0, 0, 0, 0.5)'
    : undefined;

  return (
    <section 
      className={`relative min-h-[80vh] md:min-h-[100vh] flex items-center justify-center ${vibe.rounded} py-24 md:py-32`}
      style={{
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <h1 
          className={vibe.headingSize}
          style={{ color: content.textColor || (content.overlay ? '#ffffff' : theme.primary) }}
        >
          {content.heading}
        </h1>
        
        {content.subheading && (
          <p 
            className={`${vibe.textSize} mt-4 md:mt-6`} 
            style={{ color: content.textColor || (content.overlay ? '#ffffff' : theme.text) }}
          >
            {content.subheading}
          </p>
        )}
        
        {content.showButton !== false && content.ctaText && (
          <a href={content.ctaLink}>
            <button 
              className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} mt-8 md:mt-10`}
              style={{ 
                backgroundColor: content.ctaBgColor || theme.primary, 
                color: content.ctaTextColor || theme.background 
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
