// layouts/ListServices.jsx - Vertical list layout with background media support
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const ListServices = ({ content, style }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);

  return (
    <section 
      className={`${style.spacing} ${style.rounded} relative overflow-hidden py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor: content.bgColor || style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-4xl mx-auto">
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
        <div className="mt-10 md:mt-12 space-y-6 md:space-y-8">
          {content.items?.map((item, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-4 md:gap-6 items-start ${style.cardStyle} ${style.animations}`}
              style={{ borderColor: style.secondary }}
            >
              {item.icon && (
                <div 
                  className="text-3xl md:text-4xl flex-shrink-0"
                  style={{ color: style.primary }}
                >
                  {item.icon}
                </div>
              )}
              
              <div className="flex-1">
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-2"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListServices;
