// layouts/ListServices.jsx - Vertical list layout with elegant styling
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const ListServices = ({ content, style }) => {
  const {
    title = 'Oferta',
    subtitle,
    services,  // Primary field
    items,     // Fallback for old data
    currency = 'PLN',
    bgColor = style?.background || '#FFFFFF',
    textColor = style?.text || 'rgb(30, 30, 30)',
    accentColor = style?.primary || 'rgb(146, 0, 32)',
    backgroundImage,
    backgroundOverlayColor,
    substyle = 'default'
  } = content || {};

  // Get decorative line/divider styles based on substyle
  const getDividerStyles = () => {
    switch (substyle) {
      case 'minimal':
        return {
          cardClass: 'bg-white shadow-sm border border-black/5 rounded-none',
          dividerClass: 'border-t border-black/5',
          spacing: 'space-y-4'
        };
      case 'elegant':
        return {
          cardClass: 'bg-white shadow-xl border border-black/10 rounded-2xl',
          dividerClass: 'border-t-2 border-gradient-to-r from-transparent via-black/20 to-transparent',
          spacing: 'space-y-8'
        };
      case 'bold':
        return {
          cardClass: 'bg-white shadow-2xl border-2 border-black/20 rounded-lg',
          dividerClass: 'border-t-4 border-black/30',
          spacing: 'space-y-6'
        };
      default: // 'default'
        return {
          cardClass: 'bg-white shadow-md border border-black/5 rounded-lg',
          dividerClass: 'border-t border-black/10',
          spacing: 'space-y-6'
        };
    }
  };

  const { cardClass, dividerClass, spacing } = getDividerStyles();

  const serviceList = services || items || [];
  const hasServices = serviceList && serviceList.length > 0;

  return (
    <section 
      className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor: bgColor }}
    >
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base opacity-70" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Services List */}
        {hasServices ? (
          <div className={spacing}>
            {serviceList.map((service, index) => (
              <div 
                key={service.id || index}
                className={`flex flex-col md:flex-row gap-4 md:gap-6 items-start ${style.cardStyle} ${cardClass} hover:shadow-lg transition-shadow`}
              >
                {service.icon && (
                  <div 
                    className="text-3xl md:text-4xl flex-shrink-0"
                    style={{ color: accentColor }}
                  >
                    {service.icon}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      {service.category && (
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-1" style={{ color: accentColor }}>
                          {service.category}
                        </span>
                      )}
                      <h3 
                        className="text-xl md:text-2xl font-semibold"
                        style={{ color: textColor }}
                      >
                        {service.name || 'Nowa usługa'}
                      </h3>
                    </div>
                    {service.price && service.price.trim() !== '' && (
                      <span className="text-2xl font-semibold whitespace-nowrap" style={{ color: accentColor }}>
                        {service.price} {currency}
                      </span>
                    )}
                  </div>
                  
                  {service.description && (
                    <p 
                      className="text-sm opacity-75 leading-relaxed"
                      style={{ color: textColor }}
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  )}

                  {service.details && (
                    <p 
                      className={`text-sm mt-3 pt-3 ${dividerClass} opacity-60`}
                      style={{ color: textColor }}
                    >
                      {service.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj usługi w konfiguratorze, aby wypełnić sekcję.
          </div>
        )}
      </div>
    </section>
  );
};

export default ListServices;
