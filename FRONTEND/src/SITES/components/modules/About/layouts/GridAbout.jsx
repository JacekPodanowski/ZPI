// layouts/GridAbout.jsx - Grid layout with image and highlights
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const GridAbout = ({ content, vibe, theme }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';

  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden`}
      style={{ backgroundColor: content.bgColor || theme.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {/* Image and Description Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mt-8 md:mt-12">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={content.title}
              className={`w-full h-auto ${vibe.rounded} ${vibe.shadows}`}
            />
          )}
          
          <div>
            <p 
              className={vibe.textSize}
              style={{ color: theme.text }}
            >
              {content.description}
            </p>
          </div>
        </div>
        
        {/* Highlights Grid */}
        {content.highlights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
            {content.highlights.map((highlight, index) => (
              <div 
                key={index}
                className={`${vibe.cardStyle} ${vibe.animations} text-center`}
                style={{ borderColor: theme.secondary }}
              >
                <h3 
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: theme.primary }}
                >
                  {highlight.title}
                </h3>
                <p 
                  className={`${vibe.textSize} text-sm`}
                  style={{ color: theme.text }}
                >
                  {highlight.desc}
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
