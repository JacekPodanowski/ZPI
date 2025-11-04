// layouts/InfoContact.jsx - Information-focused layout
const InfoContact = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${vibe.textSize} text-center mt-4 md:mt-6 max-w-2xl mx-auto`}
            style={{ color: theme.text }}
          >
            {content.description}
          </p>
        )}
        
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12">
          {/* Email Card */}
          {content.email && (
            <div 
              className={`${vibe.cardStyle} ${vibe.animations} text-center`}
              style={{ borderColor: theme.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">✉️</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: theme.primary }}
              >
                Email
              </h3>
              <a 
                href={`mailto:${content.email}`}
                className={`${vibe.textSize} underline ${vibe.animations}`}
                style={{ color: theme.text }}
              >
                {content.email}
              </a>
            </div>
          )}
          
          {/* Phone Card */}
          {content.phone && (
            <div 
              className={`${vibe.cardStyle} ${vibe.animations} text-center`}
              style={{ borderColor: theme.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">📞</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: theme.primary }}
              >
                Phone
              </h3>
              <a 
                href={`tel:${content.phone.replace(/\s/g, '')}`}
                className={`${vibe.textSize} underline ${vibe.animations}`}
                style={{ color: theme.text }}
              >
                {content.phone}
              </a>
            </div>
          )}
          
          {/* Address Card */}
          {content.address && (
            <div 
              className={`${vibe.cardStyle} ${vibe.animations} text-center`}
              style={{ borderColor: theme.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-3">📍</div>
              <h3 
                className="text-lg md:text-xl font-semibold mb-2"
                style={{ color: theme.primary }}
              >
                Address
              </h3>
              <p 
                className={`${vibe.textSize}`}
                style={{ color: theme.text }}
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
