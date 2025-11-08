// layouts/CenteredHero.jsx - Centered layout with mobile responsiveness
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const CenteredHero = ({ content, vibe, theme }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.35)' : undefined);

  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} text-center relative overflow-hidden py-16 px-4 md:py-24 md:px-6 lg:py-32`}
      style={{ 
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 
          className={vibe.headingSize}
          style={{ color: content.textColor || theme.primary }}
        >
          {content.heading || content.title}
        </h1>
        
        {(content.subheading || content.subtitle) && (
          <p 
            className={`${vibe.textSize} mt-4 md:mt-6`} 
            style={{ color: content.textColor || theme.text }}
          >
            {content.subheading || content.subtitle}
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

export default CenteredHero;
