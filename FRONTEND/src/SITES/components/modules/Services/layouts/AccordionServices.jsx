// layouts/AccordionServices.jsx - Accordion/expandable layout with background media support
import { useState } from 'react';
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const AccordionServices = ({ content, vibe, theme }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
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
        
        {/* Accordion Items */}
        <div className="mt-10 md:mt-12 space-y-4 md:space-y-6">
          {content.items?.map((item, index) => (
            <div 
              key={index}
              className={`${vibe.cardStyle} ${vibe.animations} overflow-hidden cursor-pointer`}
              style={{ borderColor: theme.secondary }}
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl md:text-2xl font-semibold mb-2"
                    style={{ color: theme.primary }}
                  >
                    {item.name}
                  </h3>
                  
                  <p 
                    className={`${vibe.textSize} text-sm md:text-base`}
                    style={{ color: theme.text }}
                  >
                    {item.description}
                  </p>
                </div>
                
                {/* Expand Icon */}
                <div 
                  className={`text-2xl transition-transform duration-300 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: theme.primary }}
                >
                  ▼
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedIndex === index && item.details && (
                <div 
                  className={`mt-4 pt-4 border-t ${vibe.animations}`}
                  style={{ borderColor: theme.secondary }}
                >
                  <p 
                    className={vibe.textSize}
                    style={{ color: theme.text }}
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
