// layouts/ListServices.jsx - Vertical list layout with elegant styling
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const getTrimmedText = (value) => (typeof value === 'string' ? value.trim() : '');
const hasRichText = (value) => typeof value === 'string' && value.trim() !== '';
const formatPriceValue = (price, currency) => {
  if (!price) return '';
  const trimmed = price.trim();
  if (!trimmed) return '';
  if (!currency) return trimmed;
  const containsCurrency = trimmed.toUpperCase().includes(currency.toUpperCase());
  return containsCurrency ? trimmed : `${trimmed}${currency}`;
};

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

  if (substyle === 'unified') {
    const mutedTextColor = style?.mutedText || 'rgba(30,30,30,0.7)';
    const lineColor = style?.lineColor || 'rgba(30,30,30,0.25)';

    return (
      <section 
        className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`}
        style={{ backgroundColor: bgColor }}
      >
        <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          {(title || subtitle) && (
            <div className="text-center space-y-3">
              {title && (
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: textColor }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-base opacity-80" style={{ color: mutedTextColor }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {hasServices ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-[32px] shadow-xl border border-black/5 p-6 md:p-10">
              <div className="divide-y divide-black/10">
                {serviceList.map((service, index) => {
                  const serviceName = getTrimmedText(service.name);
                  const categoryLabel = getTrimmedText(service.category);
                  const descriptionHtml = hasRichText(service.description) ? service.description : '';
                  const detailedDescription = getTrimmedText(service.detailedDescription);
                  const backContentText = getTrimmedText(service.backContent);
                  const backTitleText = getTrimmedText(service.backTitle);
                  const displayPrice = formatPriceValue(service.price, currency);
                  return (
                    <div key={service.id || index} className="py-6 first:pt-0 last:pb-0">
                      <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                          {categoryLabel && (
                            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                              {categoryLabel}
                            </p>
                          )}
                          {serviceName && (
                            <h3 className="text-2xl font-semibold" style={{ color: textColor }}>
                              {serviceName}
                            </h3>
                          )}
                        </div>

                        {displayPrice && (
                          <div className="flex items-center gap-4 md:min-w-[180px]">
                            <span
                              aria-hidden="true"
                              className="hidden md:block flex-1 border-t border-dashed"
                              style={{ borderColor: lineColor }}
                            />
                            <span className="text-2xl font-semibold tracking-tight whitespace-nowrap" style={{ color: accentColor }}>
                              {displayPrice}
                            </span>
                          </div>
                        )}
                      </div>

                      {descriptionHtml && (
                        <div className="mt-3 space-y-2 text-sm md:text-base leading-relaxed" style={{ color: mutedTextColor }}>
                          <p dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                        </div>
                      )}
                      {(backTitleText || backContentText || detailedDescription) && (
                        <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
                          {backTitleText && (
                            <h4 className="text-base font-semibold" style={{ color: accentColor }}>
                              {backTitleText}
                            </h4>
                          )}
                          {(backContentText || detailedDescription) && (
                            <p className="text-sm opacity-90 whitespace-pre-line" style={{ color: mutedTextColor }}>
                              {backContentText || detailedDescription}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-black/40">
              Dodaj usługi w konfiguratorze, aby wypełnić sekcję.
            </div>
          )}
        </div>
      </section>
    );
  }

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
            {serviceList.map((service, index) => {
              const serviceName = getTrimmedText(service.name);
              const categoryLabel = getTrimmedText(service.category);
              const descriptionHtml = hasRichText(service.description) ? service.description : '';
              const detailedDescription = getTrimmedText(service.detailedDescription);
              const backContentText = getTrimmedText(service.backContent);
              const backTitleText = getTrimmedText(service.backTitle);
              const priceValue = formatPriceValue(service.price, currency);

              return (
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
                        {categoryLabel && (
                          <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-1" style={{ color: accentColor }}>
                            {categoryLabel}
                          </span>
                        )}
                        {serviceName && (
                          <h3 
                            className="text-xl md:text-2xl font-semibold"
                            style={{ color: textColor }}
                          >
                            {serviceName}
                          </h3>
                        )}
                      </div>
                      {priceValue && (
                        <span className="text-2xl font-semibold whitespace-nowrap" style={{ color: accentColor }}>
                          {priceValue}
                        </span>
                      )}
                    </div>
                    
                    {descriptionHtml && (
                      <p 
                        className="text-sm opacity-75 leading-relaxed"
                        style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      />
                    )}

                    {(backTitleText || backContentText || detailedDescription) && (
                      <div className={`mt-4 pt-4 ${dividerClass} space-y-2`}>
                        {backTitleText && (
                          <h4 className="text-base font-semibold" style={{ color: accentColor }}>
                            {backTitleText}
                          </h4>
                        )}
                        {(backContentText || detailedDescription) && (
                          <p 
                            className="text-sm opacity-75 whitespace-pre-line"
                            style={{ color: textColor }}
                          >
                            {backContentText || detailedDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
