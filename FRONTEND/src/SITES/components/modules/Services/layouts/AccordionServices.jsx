// layouts/AccordionServices.jsx - Accordion layout with elegant styling
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

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

const AccordionServices = ({ content, style, isEditing, moduleId, pageId, typography }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const handleServiceFieldSave = (index, field, newValue) => {
    const serviceList = content.services || content.items || [];
    const updatedServices = [...serviceList];
    updatedServices[index] = { ...updatedServices[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { services: updatedServices });
  };

  const handleAddService = () => {
    const serviceList = content.services || content.items || [];
    const newService = {
      id: Date.now(),
      name: 'Nowa usługa',
      description: 'Kliknij aby edytować opis',
      category: '',
      price: '',
      image: null
    };
    updateModuleContent(pageId, moduleId, { services: [...serviceList, newService] });
  };

  const handleDeleteService = (index) => {
    const serviceList = content.services || content.items || [];
    const updatedServices = [...serviceList];
    updatedServices.splice(index, 1);
    updateModuleContent(pageId, moduleId, { services: updatedServices });
  };

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

  const titleFont = typography?.titleFont;
  const bodyFont = typography?.textFont;

  const serviceList = services || items || [];
  const hasServices = serviceList && serviceList.length > 0;
  const [expandedIndex, setExpandedIndex] = useState(0);
  
  return (
    <section 
      className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor: bgColor, fontFamily: bodyFont }}
    >
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
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
                  style={{ color: textColor, fontFamily: titleFont }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold" style={{ color: textColor, fontFamily: titleFont }}>
                  {title}
                </h2>
              )
            )}
            {(isEditing || subtitle) && (
              isEditing ? (
                <EditableText
                  value={subtitle || ''}
                  onSave={handleSubtitleSave}
                  as="p"
                  className="text-base opacity-70"
                  style={{ color: textColor, fontFamily: bodyFont }}
                  placeholder="Click to edit subtitle..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p className="text-base opacity-70" style={{ color: textColor, fontFamily: bodyFont }}>
                  {subtitle}
                </p>
              )
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
                  className={`${style.cardStyle} ${itemClass} overflow-hidden ${hasExpandedContent ? 'cursor-pointer' : ''} hover:shadow-lg transition-all relative`}
                  onClick={() => {
                    if (!hasExpandedContent) return;
                    setExpandedIndex(expandedIndex === index ? -1 : index);
                  }}
                >
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(index);
                      }}
                      className="absolute top-2 right-2 z-10 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                      style={{ fontSize: '18px' }}
                    >
                      ×
                    </button>
                  )}
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4" style={{ fontFamily: bodyFont }}>
                    <div className="flex-1">
                      {categoryLabel && (
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                          {categoryLabel}
                        </span>
                      )}
                      {(isEditing || serviceName) && (
                        isEditing ? (
                          <EditableText
                            value={service.name || ''}
                            onSave={(newValue) => handleServiceFieldSave(index, 'name', newValue)}
                            as="h3"
                            className="text-xl md:text-2xl font-semibold mb-2"
                            style={{ color: textColor, fontFamily: titleFont }}
                            placeholder="Click to edit service name..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <h3 
                            className="text-xl md:text-2xl font-semibold mb-2"
                            style={{ color: textColor, fontFamily: titleFont }}
                          >
                            {serviceName}
                          </h3>
                        )
                      )}
                      
                      {(isEditing || descriptionHtml) && (
                        isEditing ? (
                          <EditableText
                            value={service.description || ''}
                            onSave={(newValue) => handleServiceFieldSave(index, 'description', newValue)}
                            as="p"
                            className="text-sm opacity-75"
                            style={{ color: textColor, fontFamily: bodyFont }}
                            placeholder="Click to edit description..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <p 
                            className="text-sm opacity-75"
                            style={{ color: textColor, fontFamily: bodyFont }}
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                          />
                        )
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {(isEditing || priceValue) && (
                        isEditing ? (
                          <EditableText
                            value={service.price || ''}
                            onSave={(newValue) => handleServiceFieldSave(index, 'price', newValue)}
                            as="span"
                            className="text-2xl font-semibold"
                            style={{ color: accentColor, fontFamily: titleFont }}
                            placeholder="Click to edit price..."
                            isModuleSelected={true}
                          />
                        ) : (
                          <span className="text-2xl font-semibold" style={{ color: accentColor, fontFamily: titleFont }}>
                            {priceValue}
                          </span>
                        )
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
                        <div className={`mt-4 pt-4 ${dividerClass} space-y-3`} style={{ fontFamily: bodyFont }}>
                          {backTitleText && (
                            <h4 
                              className="text-lg font-semibold"
                              style={{ color: accentColor, fontFamily: titleFont }}
                            >
                              {backTitleText}
                            </h4>
                          )}
                          {(backContentText || detailedDescription) && (
                            <p 
                              className="text-sm opacity-80 whitespace-pre-line leading-relaxed"
                              style={{ color: textColor, fontFamily: bodyFont }}
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

export default AccordionServices;
