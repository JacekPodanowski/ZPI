// layouts/SplitHero.jsx - Split layout with mobile/desktop responsiveness
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const SplitHero = ({ content, vibe, theme }) => {
  const imageOnLeft = content.imagePosition === 'left';
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.35)' : undefined);
  
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden py-24 md:py-32`}
      style={{
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className={`
        max-w-7xl mx-auto 
        grid md:grid-cols-2 gap-6 md:gap-8 
        items-center
        relative z-10
        ${imageOnLeft ? 'md:grid-flow-dense' : ''}
      `}>
        {/* Text Content */}
        <div className={imageOnLeft ? 'md:col-start-2' : ''}>
          <h1 
            className={vibe.headingSize}
            style={{ color: content.textColor || theme.primary }}
          >
            {content.heading}
          </h1>
          
          {content.subheading && (
            <p className={`${vibe.textSize} mt-4 md:mt-6`} style={{ color: content.textColor || theme.text }}>
              {content.subheading}
            </p>
          )}
          
          {content.showButton !== false && content.ctaText && (
            <a href={content.ctaLink}>
              <button 
                className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} mt-6 md:mt-8`}
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
        
        {/* Image */}
        <div className={`relative w-full h-full ${imageOnLeft ? 'md:col-start-1 md:row-start-1' : ''}`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={content.heading}
              className={`w-full h-full object-cover ${vibe.rounded} ${vibe.shadows}`}
            />
          ) : (
            <div 
              className={`w-full h-full min-h-[260px] ${vibe.rounded} ${vibe.shadows} bg-neutral-200`}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default SplitHero;
