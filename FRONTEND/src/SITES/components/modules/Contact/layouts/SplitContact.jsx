// layouts/SplitContact.jsx - Split layout with info and form
const SplitContact = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} py-12 px-4 md:py-20 md:px-6`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${vibe.textSize} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
            style={{ color: theme.text }}
          >
            {content.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 md:mt-12">
          {/* Contact Info Side */}
          <div className="space-y-6 md:space-y-8">
            <h3 
              className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6"
              style={{ color: theme.primary }}
            >
              Contact Information
            </h3>
            
            {content.email && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: theme.primary }}>
                  ✉️
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.primary }}>
                    Email
                  </h4>
                  <a 
                    href={`mailto:${content.email}`}
                    className={`${vibe.textSize} underline ${vibe.animations}`}
                    style={{ color: theme.text }}
                  >
                    {content.email}
                  </a>
                </div>
              </div>
            )}
            
            {content.phone && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: theme.primary }}>
                  📞
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.primary }}>
                    Phone
                  </h4>
                  <a 
                    href={`tel:${content.phone.replace(/\s/g, '')}`}
                    className={`${vibe.textSize} underline ${vibe.animations}`}
                    style={{ color: theme.text }}
                  >
                    {content.phone}
                  </a>
                </div>
              </div>
            )}
            
            {content.address && (
              <div className="flex items-start gap-4">
                <div className="text-2xl md:text-3xl" style={{ color: theme.primary }}>
                  📍
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.primary }}>
                    Address
                  </h4>
                  <p className={vibe.textSize} style={{ color: theme.text }}>
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
                style={{ color: theme.primary }}
              >
                Send a Message
              </h3>
              
              <form className="space-y-4 md:space-y-5">
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
                      rows="4"
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SplitContact;
