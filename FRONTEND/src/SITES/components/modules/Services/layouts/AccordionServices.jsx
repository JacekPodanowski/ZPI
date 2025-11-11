// layouts/AccordionServices.jsx - Accordion/expandable layout with background media support
import { useState } from 'react';
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const AccordionServices = ({ content, style }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);
  
  return (
    <section 
      className={`${style.spacing} ${style.rounded} relative overflow-hidden`}
      style={{ backgroundColor: content.bgColor || style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-4xl mx-auto">
        <h2 
          className={`${style.headingSize} text-center`}
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
        
        {/* Accordion Items */}
        <div className="mt-10 md:mt-12 space-y-4 md:space-y-6">
          {content.items?.map((item, index) => (
            <div 
              key={index}
              className={`${style.cardStyle} ${style.animations} overflow-hidden cursor-pointer`}
              style={{ borderColor: style.secondary }}
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl md:text-2xl font-semibold mb-2"
                    style={{ color: style.primary }}
                  >
                    {item.name}
                  </h3>
                  
                  <p 
                    className={`${style.textSize} text-sm md:text-base`}
                    style={{ color: style.text }}
                  >
                    {item.description}
                  </p>
                </div>
                
                {/* Expand Icon */}
                <div 
                  className={`text-2xl transition-transform duration-300 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: style.primary }}
                >
                  ▼
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedIndex === index && item.details && (
                <div 
                  className={`mt-4 pt-4 border-t ${style.animations}`}
                  style={{ borderColor: style.secondary }}
                >
                  <p 
                    className={style.textSize}
                    style={{ color: style.text }}
                  >
                    {item.details}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccordionServices;
