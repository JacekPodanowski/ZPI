// layouts/AccordionServices.jsx - Accordion layout with elegant styling
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';

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
            {serviceList.map((service, index) => (
              <div 
                key={service.id || index}
                className={`${style.cardStyle} ${itemClass} overflow-hidden cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {service.category && (
                      <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                        {service.category}
                      </span>
                    )}
                    <h3 
                      className="text-xl md:text-2xl font-semibold mb-2"
                      style={{ color: textColor }}
                    >
                      {service.name || 'Nowa usługa'}
                    </h3>
                    
                    {service.description && (
                      <p 
                        className="text-sm opacity-75"
                        style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: service.description }}
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {service.price && service.price.trim() !== '' && (
                      <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                        {service.price} {currency}
                      </span>
                    )}
                    {/* Expand Icon */}
                    <div 
                      className={`text-xl transition-transform duration-300 ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                      style={{ color: accentColor }}
                    >
                      ▼
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedIndex === index && service.details && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div 
                        className={`mt-4 pt-4 ${dividerClass}`}
                      >
                        <p 
                          className="text-sm opacity-75 whitespace-pre-line"
                          style={{ color: textColor }}
                        >
                          {service.details}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

export default AccordionServices;
