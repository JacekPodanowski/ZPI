// layouts/CardServices.jsx - Card grid layout with elegant styling and flip option
import React from 'react';
import { motion } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import FlipCard from '../../../../../components/FlipCard';
import { resolveMediaUrl } from '../../../../../config/api';
import { isVideoUrl } from '../../../../../utils/mediaUtils';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const getTrimmedText = (value) => (typeof value === 'string' ? value.trim() : '');
const hasRichText = (value) => typeof value === 'string' && value.trim() !== '';

const CardServices = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const handleServiceFieldSave = (index, field, newValue) => {
    const updatedServices = [...(content.services || content.items || [])];
    updatedServices[index] = { ...updatedServices[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { services: updatedServices });
  };

  const handleAddService = () => {
    const newService = {
      id: Date.now(),
      name: 'Nowa usługa',
      description: 'Kliknij aby edytować opis',
      category: '',
      price: '',
      image: null
    };
    const updatedServices = [...(content.services || content.items || []), newService];
    updateModuleContent(pageId, moduleId, { services: updatedServices });
  };

  const handleDeleteService = (index) => {
    const updatedServices = [...(content.services || content.items || [])];
    updatedServices.splice(index, 1);
    updateModuleContent(pageId, moduleId, { services: updatedServices });
  };

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

  // Unified layout - all services in one container
  // Unified visual style handled by List layout only

  return (
    <section className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor }}>
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {(isEditing || title) && (
              isEditing ? (
                <EditableText
                  value={title || 'Oferta'}
                  onSave={handleTitleSave}
                  as="h2"
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold"
                  style={{ color: textColor }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold" style={{ color: textColor }}>
                  {title}
                </h2>
              )
            )}
            {(isEditing || subtitle) && (
              isEditing ? (
                <EditableText
                  value={subtitle || 'Sprawdź naszą ofertę i przejrzyste ceny'}
                  onSave={handleSubtitleSave}
                  as="p"
                  className="text-base opacity-70"
                  style={{ color: textColor }}
                  placeholder="Click to edit subtitle..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p className="text-base opacity-70" style={{ color: textColor }}>
                  {subtitle}
                </p>
              )
            )}
          </div>
        )}

        {/* Services Grid */}
        {hasServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {serviceList.map((service, index) => {
              const resolvedImage = resolveMediaUrl(service.image);
              const hasValidImage = resolvedImage && resolvedImage.trim() !== '';
              const serviceName = getTrimmedText(service.name);
              const categoryLabel = getTrimmedText(service.category);
              const descriptionHtml = hasRichText(service.description) ? service.description : '';
              const detailedDescription = getTrimmedText(service.detailedDescription);
              const detailsText = getTrimmedText(service.details);
              
              // Only show flip card if user explicitly filled backContent or backTitle
              const backContentText = getTrimmedText(service.backContent);
              const backTitleText = getTrimmedText(service.backTitle);
              const hasBackContent = !!(backContentText || backTitleText);
              
              // If service has explicit back content, show as FlipCard, otherwise simple card
              if (hasBackContent) {
                // Use backContent or fall back to detailedDescription/details only if backContent exists
                const backSideContent = backContentText || detailedDescription || detailsText;
                // Front content
                const frontContent = (
                  <div 
                    className={`${style.cardStyle} h-full flex flex-col ${cardClasses}`}
                  >
                    {(isEditing || hasValidImage) && (
                      <div className="aspect-video overflow-hidden bg-black flex-shrink-0">
                        {isEditing ? (
                          <EditableImage
                            value={service.image}
                            onSave={(newUrl) => handleServiceFieldSave(index, 'image', newUrl)}
                            alt={serviceName || 'Usługa'}
                            className="w-full h-full object-cover"
                            isModuleSelected={true}
                          />
                        ) : (
                          isVideoUrl(service.image) ? (
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
                            <img src={resolvedImage} alt={serviceName || 'Usługa'} className="w-full h-full object-cover" />
                          )
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
                        {categoryLabel && (
                          <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                            {categoryLabel}
                          </span>
                        )}
                        {(isEditing || serviceName) && (
                          isEditing ? (
                            <EditableText
                              value={serviceName || ''}
                              onSave={(newValue) => handleServiceFieldSave(index, 'name', newValue)}
                              as="h3"
                              className="text-xl font-semibold mb-2"
                              style={{ color: textColor }}
                              placeholder="Click to edit service name..."
                              multiline
                              isModuleSelected={true}
                            />
                          ) : (
                            <h3 className="text-xl font-semibold mb-2">{serviceName}</h3>
                          )
                        )}
                      {(isEditing || descriptionHtml) && (
                        isEditing ? (
                          <EditableText
                            value={service.description || ''}
                            onSave={(newValue) => handleServiceFieldSave(index, 'description', newValue)}
                            as="p"
                            className="text-sm opacity-75 leading-relaxed"
                            style={{ color: textColor }}
                            placeholder="Click to edit description..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <p className="text-sm opacity-75 leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                        )
                      )}
                      </div>
                      {(isEditing || (service.price && service.price.trim() !== '')) && (
                        <div className="flex items-baseline justify-between pt-2 border-t border-black/10">
                          <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                          {isEditing ? (
                            <EditableText
                              value={service.price || ''}
                              onSave={(newValue) => handleServiceFieldSave(index, 'price', newValue)}
                              as="span"
                              className="text-2xl font-semibold"
                              style={{ color: accentColor }}
                              placeholder="Click to edit price..."
                              isModuleSelected={true}
                            />
                          ) : (
                            <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                              {service.price} {currency}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );

                // Back content - shows backContent (or details as fallback)
                const backTitle = backTitleText || serviceName;
                const backContent = (
                  <div 
                    className={`${style.cardStyle} h-full flex flex-col ${cardClasses}`}
                  >
                    {backTitle && (
                      <h3 
                        className="text-xl md:text-2xl font-semibold mb-4 text-center break-words px-6 pt-6 flex-shrink-0"
                        style={{ color: accentColor }}
                      >
                        {backTitle}
                      </h3>
                    )}
                    <div 
                      className="px-6 text-sm overflow-y-auto flex-grow"
                      style={{ color: textColor }}
                    >
                      <p className="whitespace-pre-line break-words">{backSideContent}</p>
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
                  <div key={service.id || index} style={{ display: 'flex', flexDirection: 'column', minHeight: '400px', position: 'relative' }}>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteService(index)}
                        className="absolute top-2 right-2 z-20 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                        style={{ fontSize: '18px' }}
                      >
                        ×
                      </button>
                    )}
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
                  <div key={service.id || index} style={{ position: 'relative' }}>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteService(index)}
                        className="absolute top-2 right-2 z-20 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                        style={{ fontSize: '18px' }}
                      >
                        ×
                      </button>
                    )}
                    <motion.article
                    key={service.id || index}
                    whileHover={{ y: -6 }}
                    className={`${style.cardStyle} ${cardClasses}`}
                  >
                    {(isEditing || hasValidImage) && (
                      <div className="aspect-video overflow-hidden bg-black">
                        {isEditing ? (
                          <EditableImage
                            value={service.image}
                            onSave={(newUrl) => handleServiceFieldSave(index, 'image', newUrl)}
                            alt={serviceName || 'Usługa'}
                            className="w-full h-full object-cover"
                            isModuleSelected={true}
                          />
                        ) : (
                          isVideoUrl(service.image) ? (
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
                            <img src={resolvedImage} alt={serviceName || 'Usługa'} className="w-full h-full object-cover" />
                          )
                        )}
                      </div>
                    )}
                    <div className="p-6 space-y-4" style={{ color: textColor }}>
                      <div>
                        {categoryLabel && (
                          <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                            {categoryLabel}
                          </span>
                        )}
                        {(isEditing || serviceName) && (
                          isEditing ? (
                            <EditableText
                              value={serviceName || ''}
                              onSave={(newValue) => handleServiceFieldSave(index, 'name', newValue)}
                              as="h3"
                              className="text-xl font-semibold"
                              style={{ color: textColor }}
                              placeholder="Click to edit service name..."
                              multiline
                              isModuleSelected={true}
                            />
                          ) : (
                            <h3 className="text-xl font-semibold">{serviceName}</h3>
                          )
                        )}
                        {(isEditing || descriptionHtml) && (
                          isEditing ? (
                            <EditableText
                              value={service.description || ''}
                              onSave={(newValue) => handleServiceFieldSave(index, 'description', newValue)}
                              as="p"
                              className="text-sm opacity-75 mt-2 leading-relaxed"
                              style={{ color: textColor }}
                              placeholder="Click to edit description..."
                              multiline
                              isModuleSelected={true}
                            />
                          ) : (
                            <p className="text-sm opacity-75 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                          )
                        )}
                      </div>
                      {(isEditing || (service.price && service.price.trim() !== '')) && (
                        <div className="flex items-baseline justify-between pt-2 border-t border-black/10">
                          <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                          {isEditing ? (
                            <EditableText
                              value={service.price || ''}
                              onSave={(newValue) => handleServiceFieldSave(index, 'price', newValue)}
                              as="span"
                              className="text-2xl font-semibold"
                              style={{ color: accentColor }}
                              placeholder="Click to edit price..."
                              isModuleSelected={true}
                            />
                          ) : (
                            <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                              {service.price} {currency}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.article>
                </div>
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj usługi w konfiguratorze, aby wypełnić sekcję.
          </div>
        )}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddService}
              className="bg-[rgb(146,0,32)] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[rgb(114,0,21)] transition-colors shadow-lg"
              style={{ fontSize: '24px' }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CardServices;
