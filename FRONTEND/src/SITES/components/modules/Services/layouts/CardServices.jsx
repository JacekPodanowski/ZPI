// layouts/CardServices.jsx - Card grid layout with background media support and flip cards
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import FlipCard from '../../../../../components/FlipCard';
import { resolveMediaUrl } from '../../../../../config/api';

const CardServices = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);
  const flipStyle = content.flipStyle || 'flip';

  return (
    <section 
      className={`${style.spacing} ${style.rounded} relative overflow-hidden py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor: content.bgColor || style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-7xl mx-auto">
        <h2 
          className={`text-3xl md:text-4xl lg:text-5xl text-center`}
          style={{ color: style.primary }}
        >
          {content.title}
        </h2>
        
        {content.subtitle && (
          <p 
            className={`${style.textSize} text-center mt-4 md:mt-6`}
            style={{ color: style.text }}
          >
            {content.subtitle}
          </p>
        )}
        
        {/* Service Cards Grid - Equal height rows */}
        <div 
          className="mt-10 md:mt-12"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            gridAutoRows: 'minmax(400px, auto)'
          }}
        >
          {content.items?.map((item, index) => {
            const itemImageUrl = item.image ? resolveMediaUrl(item.image) : '';
            
            // Front content
            const frontContent = (
              <div 
                className={`${style.cardStyle} ${style.animations} h-full flex flex-col overflow-hidden`}
                style={{ borderColor: style.secondary }}
              >
                {itemImageUrl && (
                  <img 
                    src={itemImageUrl} 
                    alt={item.name}
                    className={`w-full h-48 object-cover ${style.rounded} mb-4 flex-shrink-0`}
                  />
                )}
              
                {item.icon && (
                  <div className="text-3xl md:text-4xl mb-3 flex-shrink-0">
                    {item.icon}
                  </div>
                )}
              
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-3 break-words px-1 flex-shrink-0"
                  style={{ color: style.primary }}
                >
                  {item.name}
                </h3>
              
                <p 
                  className={`${style.textSize} break-words px-1 pb-2 flex-grow`}
                  style={{ color: style.text }}
                >
                  {item.description}
                </p>
              </div>
            );

            // Back content - shows details and service name
            const backContent = (
              <div 
                className={`${style.cardStyle} ${style.animations} h-full flex flex-col overflow-hidden`}
                style={{ 
                  borderColor: style.secondary,
                  backgroundColor: style.surface || '#ffffff'
                }}
              >
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-4 text-center break-words px-2 flex-shrink-0"
                  style={{ color: style.primary }}
                >
                  {item.name}
                </h3>
                
                <div 
                  className={`${style.textSize} px-4 overflow-y-auto flex-grow`}
                  style={{ color: style.text }}
                >
                  {item.details ? (
                    <p className="whitespace-pre-line break-words">{item.details}</p>
                  ) : (
                    <p className="text-center opacity-60">No additional details available</p>
                  )}
                </div>
                
                <p 
                  className="text-xs text-center mt-4 opacity-50 flex-shrink-0 pb-2"
                  style={{ color: style.text }}
                >
                  Click to flip back
                </p>
              </div>
            );

            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                <FlipCard
                  frontContent={frontContent}
                  backContent={backContent}
                  flipStyle={flipStyle}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CardServices;
