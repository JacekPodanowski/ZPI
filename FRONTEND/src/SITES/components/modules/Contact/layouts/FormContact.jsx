// layouts/FormContact.jsx - Form-focused layout
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const FormContact = ({ content, style, isEditing, moduleId, pageId }) => {
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
  style={{ backgroundColor: content.bgColor || style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-2xl mx-auto relative z-10">
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
              className={`${style.textSize} text-center mt-4 md:mt-6`}
              style={{ color: style.text }}
              placeholder="Click to edit description..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${style.textSize} text-center mt-4 md:mt-6`}
              style={{ color: style.text }}
            >
              {content.description}
            </p>
          )
        )}
        
        {/* Contact Form */}
        {content.showForm && (
          <form 
            className={`${style.cardStyle} ${style.animations} mt-8 md:mt-10 space-y-4 md:space-y-6`}
            style={{ borderColor: style.secondary }}
          >
            {content.formFields?.includes('name') && (
              <div>
                <label 
                  className={`block ${style.textSize} mb-2 font-medium`}
                  style={{ color: style.text }}
                >
                  Name
                </label>
                <input 
                  type="text"
                  placeholder="Your name"
                  className={`w-full px-4 py-2 md:py-3 ${style.rounded} border ${style.animations}`}
                  style={{ 
                    borderColor: style.secondary,
                    backgroundColor: style.background,
                    color: style.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('email') && (
              <div>
                <label 
                  className={`block ${style.textSize} mb-2 font-medium`}
                  style={{ color: style.text }}
                >
                  Email
                </label>
                <input 
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2 md:py-3 ${style.rounded} border ${style.animations}`}
                  style={{ 
                    borderColor: style.secondary,
                    backgroundColor: style.background,
                    color: style.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('phone') && (
              <div>
                <label 
                  className={`block ${style.textSize} mb-2 font-medium`}
                  style={{ color: style.text }}
                >
                  Phone
                </label>
                <input 
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-2 md:py-3 ${style.rounded} border ${style.animations}`}
                  style={{ 
                    borderColor: style.secondary,
                    backgroundColor: style.background,
                    color: style.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('message') && (
              <div>
                <label 
                  className={`block ${style.textSize} mb-2 font-medium`}
                  style={{ color: style.text }}
                >
                  Message
                </label>
                <textarea 
                  rows="5"
                  placeholder="Tell us how we can help..."
                  className={`w-full px-4 py-2 md:py-3 ${style.rounded} border ${style.animations}`}
                  style={{ 
                    borderColor: style.secondary,
                    backgroundColor: style.background,
                    color: style.text
                  }}
                />
              </div>
            )}
            
            <button 
              type="submit"
              className={`${style.buttonStyle} ${style.shadows} ${style.animations} w-full`}
              style={{ backgroundColor: style.primary, color: style.background }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default FormContact;
