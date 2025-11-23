// layouts/SplitContact.jsx - Split layout with info and form
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const SplitContact = ({ content, style, isEditing, moduleId, pageId }) => {
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
  className={`${style.spacing} ${style.rounded} py-12 px-4 md:py-20 md:px-6 relative overflow-hidden`}
  style={{ backgroundColor: style.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-6xl mx-auto relative z-10">
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
              className={`${style.textSize} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
              style={{ color: style.text }}
              placeholder="Click to edit description..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${style.textSize} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
              style={{ color: style.text }}
            >
              {content.description}
            </p>
          )
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 md:mt-12">
          {/* Contact Info Side */}
          <div className="space-y-6 md:space-y-8">
            <h3 
              className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6"
              style={{ color: style.primary }}
            >
              Contact Information
            </h3>
            
            {content.email && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: style.primary }}>
                  ✉️
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: style.primary }}>
                    Email
                  </h4>
                  <a 
                    href={`mailto:${content.email}`}
                    className={`${style.textSize} underline ${style.animations}`}
                    style={{ color: style.text }}
                  >
                    {content.email}
                  </a>
                </div>
              </div>
            )}
            
            {content.phone && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: style.primary }}>
                  📞
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: style.primary }}>
                    Phone
                  </h4>
                  <a 
                    href={`tel:${content.phone.replace(/\s/g, '')}`}
                    className={`${style.textSize} underline ${style.animations}`}
                    style={{ color: style.text }}
                  >
                    {content.phone}
                  </a>
                </div>
              </div>
            )}
            
            {content.address && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: style.primary }}>
                  📍
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: style.primary }}>
                    Address
                  </h4>
                  <p className={style.textSize} style={{ color: style.text }}>
                    {content.address}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Form Side */}
          {content.showForm && (
            <div>
              <h3 
                className="text-2xl md:text-3xl font-semibold mb-6"
                style={{ color: style.primary }}
              >
                Send a Message
              </h3>
              
              <form className="space-y-4 md:space-y-5">
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
                      rows="4"
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SplitContact;
