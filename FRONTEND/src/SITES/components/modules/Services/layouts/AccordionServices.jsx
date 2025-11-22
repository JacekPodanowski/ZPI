// layouts/AccordionServices.jsx - Accordion layout with elegant styling
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const AccordionServices = ({ content, style }) => {
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

  // Get accordion visual style variations
  const getAccordionStyles = () => {
    switch (substyle) {
      case 'minimal':
        return {
          itemClass: 'bg-white shadow-sm border border-black/5 rounded-none',
          dividerClass: 'border-t border-black/5',
          spacing: 'space-y-3'
        };
      case 'elegant':
        return {
          itemClass: 'bg-white shadow-xl border border-black/10 rounded-2xl',
          dividerClass: 'border-t-2 border-black/10',
          spacing: 'space-y-6'
        };
      case 'bold':
        return {
          itemClass: 'bg-white shadow-2xl border-2 border-black/20 rounded-lg',
          dividerClass: 'border-t-4 border-black/30',
          spacing: 'space-y-5'
        };
      default: // 'default'
        return {
          itemClass: 'bg-white shadow-md border border-black/5 rounded-lg',
          dividerClass: 'border-t border-black/10',
          spacing: 'space-y-4'
        };
    }
  };

  const { itemClass, dividerClass, spacing } = getAccordionStyles();

  const serviceList = services || items || [];
  const hasServices = serviceList && serviceList.length > 0;
  const [expandedIndex, setExpandedIndex] = useState(0);
  
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
        
        {/* Accordion Items */}
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
              const hasExpandedContent = !!(backContentText || backTitleText || detailedDescription);
              const isExpanded = expandedIndex === index && !!hasExpandedContent;

              return (
                <div 
                  key={service.id || index}
                  className={`${style.cardStyle} ${itemClass} overflow-hidden ${hasExpandedContent ? 'cursor-pointer' : ''} hover:shadow-lg transition-all`}
                  onClick={() => {
                    if (!hasExpandedContent) return;
                    setExpandedIndex(expandedIndex === index ? -1 : index);
                  }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      {categoryLabel && (
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                          {categoryLabel}
                        </span>
                      )}
                      {serviceName && (
                        <h3 
                          className="text-xl md:text-2xl font-semibold mb-2"
                          style={{ color: textColor }}
                        >
                          {serviceName}
                        </h3>
                      )}
                      
                      {descriptionHtml && (
                        <p 
                          className="text-sm opacity-75"
                          style={{ color: textColor }}
                          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {priceValue && (
                        <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                          {priceValue}
                        </span>
                      )}
                      {/* Expand Icon */}
                      {hasExpandedContent && (
                        <div 
                          className={`text-xl transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          style={{ color: accentColor }}
                        >
                          ▼
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`mt-4 pt-4 ${dividerClass} space-y-3`}>
                          {backTitleText && (
                            <h4 
                              className="text-lg font-semibold"
                              style={{ color: accentColor }}
                            >
                              {backTitleText}
                            </h4>
                          )}
                          {(backContentText || detailedDescription) && (
                            <p 
                              className="text-sm opacity-80 whitespace-pre-line leading-relaxed"
                              style={{ color: textColor }}
                            >
                              {backContentText || detailedDescription}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

export default AccordionServices;
