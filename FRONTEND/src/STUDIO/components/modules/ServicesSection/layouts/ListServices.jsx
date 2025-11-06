// layouts/ListServices.jsx - Vertical list layout with background media support
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const ListServices = ({ content, vibe, theme }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);

  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden`}
      style={{ backgroundColor: content.bgColor || theme.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-4xl mx-auto">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {content.subtitle && (
          <p 
            className={`${vibe.textSize} text-center mt-4 md:mt-6`}
            style={{ color: theme.text }}
          >
            {content.subtitle}
          </p>
        )}
        
        {/* Service List */}
        <div className="mt-10 md:mt-12 space-y-6 md:space-y-8">
          {content.items?.map((item, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-4 md:gap-6 items-start ${vibe.cardStyle} ${vibe.animations}`}
              style={{ borderColor: theme.secondary }}
            >
              {item.icon && (
                <div 
                  className="text-3xl md:text-4xl flex-shrink-0"
                  style={{ color: theme.primary }}
                >
                  {item.icon}
                </div>
              )}
              
              <div className="flex-1">
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-2"
                  style={{ color: theme.primary }}
                >
                  {item.name}
                </h3>
                
                <p 
                  className={vibe.textSize}
                  style={{ color: theme.text }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListServices;
