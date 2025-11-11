// layouts/CardServices.jsx - Card grid layout with background media support
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';

const CardServices = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);

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
        
        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12">
          {content.items?.map((item, index) => {
            const itemImageUrl = item.image ? resolveMediaUrl(item.image) : '';
            return (
              <div 
                key={index}
                className={`${style.cardStyle} ${style.animations}`}
                style={{ borderColor: style.secondary }}
              >
                {itemImageUrl && (
                  <img 
                    src={itemImageUrl} 
                    alt={item.name}
                    className={`w-full h-48 object-cover ${style.rounded} mb-4`}
                  />
                )}
              
              {item.icon && (
                <div className="text-3xl md:text-4xl mb-3">
                  {item.icon}
                </div>
              )}
              
              <h3 
                className="text-xl md:text-2xl font-semibold mb-3"
                style={{ color: style.primary }}
              >
                {item.name}
              </h3>
              
              <p 
                className={style.textSize}
                style={{ color: style.text }}
              >
                {item.description}
              </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CardServices;
