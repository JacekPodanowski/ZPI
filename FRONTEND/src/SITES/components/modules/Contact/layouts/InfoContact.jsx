// layouts/InfoContact.jsx - Information-focused layout
const InfoContact = ({ content, style }) => {
  return (
    <section 
  className={`${style.spacing} ${style.rounded}`}
  style={{ backgroundColor: style.background }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 
          className={`${style.headingSize} text-center`}
          style={{ color: style.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${style.textSize} text-center mt-4 md:mt-6 max-w-2xl mx-auto`}
            style={{ color: style.text }}
          >
            {content.description}
          </p>
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
