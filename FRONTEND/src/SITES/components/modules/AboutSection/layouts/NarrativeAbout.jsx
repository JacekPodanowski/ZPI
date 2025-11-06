// layouts/NarrativeAbout.jsx - Narrative layout with side image
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const NarrativeAbout = ({ content, vibe, theme }) => {
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden`}
      style={{ 
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
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
                className={`w-full h-auto ${vibe.rounded} ${vibe.shadows} sticky top-8`}
              />
            </div>
          )}
          
          {/* Narrative Text */}
          <div className={imageUrl ? 'md:col-span-2' : 'md:col-span-3'}>
            <p 
              className={`${vibe.textSize} leading-relaxed whitespace-pre-line`}
              style={{ color: theme.text }}
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
