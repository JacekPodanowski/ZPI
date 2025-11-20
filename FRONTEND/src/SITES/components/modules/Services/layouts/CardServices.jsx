// layouts/CardServices.jsx - Card grid layout with elegant styling and flip option
import React from 'react';
import { motion } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import FlipCard from '../../../../../components/FlipCard';
import { resolveMediaUrl } from '../../../../../config/api';
import { isVideoUrl } from '../../../../../utils/mediaUtils';

const CardServices = ({ content, style }) => {
  const {
    title = 'Oferta',
    subtitle = 'Sprawdź naszą ofertę i przejrzyste ceny',
    services,  // Primary field
    items,     // Fallback for old data
    currency = 'PLN',
    bgColor = style?.background || '#FFFFFF',
    textColor = style?.text || 'rgb(30, 30, 30)',
    accentColor = style?.primary || 'rgb(146, 0, 32)',
    backgroundImage,
    backgroundOverlayColor,
    flipStyle = 'flip',
    substyle = 'default'
  } = content || {};

  // Get substyle classes based on selected variant
  const getSubstyleClasses = () => {
    const baseClasses = 'overflow-hidden bg-white shadow-lg border';
    
    switch (substyle) {
      case 'minimal':
        return `${baseClasses} border-black/5 rounded-none shadow-sm`;
      case 'elegant':
        return `${baseClasses} border-black/10 rounded-2xl shadow-xl`;
      case 'bold':
        return `${baseClasses} border-2 rounded-lg shadow-2xl`;
      default: // 'default'
        return `${baseClasses} border-black/5 rounded-lg`;
    }
  };

  const cardClasses = getSubstyleClasses();

  // Use services if available, otherwise fall back to items for backward compatibility
  const serviceList = services || items || [];
  const hasServices = serviceList && serviceList.length > 0;

  return (
    <section className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor }}>
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
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

        {/* Services Grid */}
        {hasServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {serviceList.map((service, index) => {
              const resolvedImage = resolveMediaUrl(service.image);
              const hasValidImage = resolvedImage && resolvedImage.trim() !== '';
              
              // If service has details field, show as FlipCard, otherwise simple card
              if (service.details) {
                // Front content
                const frontContent = (
                  <div 
                    className={`${style.cardStyle} h-full flex flex-col ${cardClasses}`}
                  >
                    {hasValidImage && (
                      <div className="aspect-video overflow-hidden bg-black flex-shrink-0">
                        {isVideoUrl(service.image) ? (
                          <video
                            src={resolvedImage}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          >
                            Twoja przeglądarka nie obsługuje odtwarzania wideo.
                          </video>
                        ) : (
                          <img src={resolvedImage} alt={service.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  
                    {service.icon && (
                      <div className="text-3xl md:text-4xl mb-3 px-6 pt-4 flex-shrink-0">
                        {service.icon}
                      </div>
                    )}
                  
                    <div className="p-6 space-y-3 flex-grow flex flex-col" style={{ color: textColor }}>
                      <div className="flex-grow">
                        {service.category && (
                          <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                            {service.category}
                          </span>
                        )}
                        <h3 className="text-xl font-semibold mb-2">{service.name || 'Nowa usługa'}</h3>
                        {service.description && (
                          <p className="text-sm opacity-75 leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description }} />
                        )}
                      </div>
                      {service.price && service.price.trim() !== '' && (
                        <div className="flex items-baseline justify-between pt-2 border-t border-black/10">
                          <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                          <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                            {service.price} {currency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );

                // Back content - shows details
                const backContent = (
                  <div 
                    className={`${style.cardStyle} h-full flex flex-col ${cardClasses}`}
                  >
                    <h3 
                      className="text-xl md:text-2xl font-semibold mb-4 text-center break-words px-6 pt-6 flex-shrink-0"
                      style={{ color: accentColor }}
                    >
                      {service.name}
                    </h3>
                    
                    <div 
                      className="px-6 text-sm overflow-y-auto flex-grow"
                      style={{ color: textColor }}
                    >
                      <p className="whitespace-pre-line break-words">{service.details}</p>
                    </div>
                    
                    <p 
                      className="text-xs text-center mt-4 opacity-50 flex-shrink-0 pb-4"
                      style={{ color: textColor }}
                    >
                      Kliknij aby wrócić
                    </p>
                  </div>
                );

                return (
                  <div key={service.id || index} style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                    <FlipCard
                      frontContent={frontContent}
                      backContent={backContent}
                      flipStyle={flipStyle}
                    />
                  </div>
                );
              } else {
                // Simple non-flipping card
                return (
                  <motion.article
                    key={service.id || index}
                    whileHover={{ y: -6 }}
                    className={`${style.cardStyle} ${cardClasses}`}
                  >
                    {hasValidImage && (
                      <div className="aspect-video overflow-hidden bg-black">
                        {isVideoUrl(service.image) ? (
                          <video
                            src={resolvedImage}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          >
                            Twoja przeglądarka nie obsługuje odtwarzania wideo.
                          </video>
                        ) : (
                          <img src={resolvedImage} alt={service.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                    <div className="p-6 space-y-4" style={{ color: textColor }}>
                      <div>
                        {service.category && (
                          <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                            {service.category}
                          </span>
                        )}
                        <h3 className="text-xl font-semibold">{service.name || 'Nowa usługa'}</h3>
                        {service.description && (
                          <p className="text-sm opacity-75 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description }} />
                        )}
                      </div>
                      {service.price && service.price.trim() !== '' && (
                        <div className="flex items-baseline justify-between pt-2 border-t border-black/10">
                          <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                          <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                            {service.price} {currency}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              }
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

export default CardServices;
