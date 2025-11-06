// layouts/FormContact.jsx - Form-focused layout with background media
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const FormContact = ({ content, vibe, theme }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.25)' : undefined);

  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden`}
      style={{
        backgroundColor: content.bgColor || theme.background
      }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-2xl mx-auto relative z-10">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${vibe.textSize} text-center mt-4 md:mt-6`}
            style={{ color: theme.text }}
          >
            {content.description}
          </p>
        )}
        
        {/* Contact Form */}
        {content.showForm && (
          <form 
            className={`${vibe.cardStyle} ${vibe.animations} mt-8 md:mt-10 space-y-4 md:space-y-6`}
            style={{ borderColor: theme.secondary }}
          >
            {content.formFields?.includes('name') && (
              <div>
                <label 
                  className={`block ${vibe.textSize} mb-2 font-medium`}
                  style={{ color: theme.text }}
                >
                  Name
                </label>
                <input 
                  type="text"
                  placeholder="Your name"
                  className={`w-full px-4 py-2 md:py-3 ${vibe.rounded} border ${vibe.animations}`}
                  style={{ 
                    borderColor: theme.secondary,
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('email') && (
              <div>
                <label 
                  className={`block ${vibe.textSize} mb-2 font-medium`}
                  style={{ color: theme.text }}
                >
                  Email
                </label>
                <input 
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2 md:py-3 ${vibe.rounded} border ${vibe.animations}`}
                  style={{ 
                    borderColor: theme.secondary,
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('phone') && (
              <div>
                <label 
                  className={`block ${vibe.textSize} mb-2 font-medium`}
                  style={{ color: theme.text }}
                >
                  Phone
                </label>
                <input 
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-2 md:py-3 ${vibe.rounded} border ${vibe.animations}`}
                  style={{ 
                    borderColor: theme.secondary,
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                />
              </div>
            )}
            
            {content.formFields?.includes('message') && (
              <div>
                <label 
                  className={`block ${vibe.textSize} mb-2 font-medium`}
                  style={{ color: theme.text }}
                >
                  Message
                </label>
                <textarea 
                  rows="5"
                  placeholder="Tell us how we can help..."
                  className={`w-full px-4 py-2 md:py-3 ${vibe.rounded} border ${vibe.animations}`}
                  style={{ 
                    borderColor: theme.secondary,
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                />
              </div>
            )}
            
            <button 
              type="submit"
              className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} w-full`}
              style={{ backgroundColor: theme.primary, color: theme.background }}
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
