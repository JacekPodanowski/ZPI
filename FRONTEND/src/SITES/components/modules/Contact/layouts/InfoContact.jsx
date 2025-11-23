// layouts/InfoContact.jsx - Information-focused layout
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const InfoContact = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleDescriptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { description: newValue });
  };

  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);

  return (
    <section 
  className={`${style.spacing} ${style.rounded} relative overflow-hidden`}
  style={{ backgroundColor: style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-4xl mx-auto relative z-10">
        {isEditing ? (
          <EditableText
            value={content.title || ''}
            onSave={handleTitleSave}
            as="h2"
            className={`${style.headingSize} text-center`}
            style={{ color: style.primary }}
            placeholder="Click to edit title..."
            multiline
            isModuleSelected={true}
          />
        ) : (
          <h2 
            className={`${style.headingSize} text-center`}
            style={{ color: style.primary }}
          >
            {content.title}
          </h2>
        )}
        
        {(isEditing || content.description) && (
          isEditing ? (
            <EditableText
              value={content.description || ''}
              onSave={handleDescriptionSave}
              as="p"
              className={`${style.textSize} text-center mt-4 md:mt-6 max-w-2xl mx-auto`}
              style={{ color: style.text }}
              placeholder="Click to edit description..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${style.textSize} text-center mt-4 md:mt-6 max-w-2xl mx-auto`}
              style={{ color: style.text }}
            >
              {content.description}
            </p>
          )
        )}
        
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12">
          {/* Email Card */}
          {content.email && (
            <div 
              className={`${style.cardStyle} ${style.animations} text-center`}
              style={{ borderColor: style.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">✉️</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: style.primary }}
              >
                Email
              </h3>
              <a 
                href={`mailto:${content.email}`}
                className={`${style.textSize} underline ${style.animations}`}
                style={{ color: style.text }}
              >
                {content.email}
              </a>
            </div>
          )}
          
          {/* Phone Card */}
          {content.phone && (
            <div 
              className={`${style.cardStyle} ${style.animations} text-center`}
              style={{ borderColor: style.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">📞</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: style.primary }}
              >
                Phone
              </h3>
              <a 
                href={`tel:${content.phone.replace(/\s/g, '')}`}
                className={`${style.textSize} underline ${style.animations}`}
                style={{ color: style.text }}
              >
                {content.phone}
              </a>
            </div>
          )}
          
          {/* Address Card */}
          {content.address && (
            <div 
              className={`${style.cardStyle} ${style.animations} text-center`}
              style={{ borderColor: style.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">📍</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: style.primary }}
              >
                Address
              </h3>
              <p 
                className={`${style.textSize}`}
                style={{ color: style.text }}
              >
                {content.address}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InfoContact;
