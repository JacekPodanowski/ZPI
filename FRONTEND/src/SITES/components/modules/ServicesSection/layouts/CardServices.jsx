// layouts/CardServices.jsx - Card grid layout
const CardServices = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-7xl mx-auto">
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
        
        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12">
          {content.items?.map((item, index) => (
            <div 
              key={index}
              className={`${vibe.cardStyle} ${vibe.animations}`}
              style={{ borderColor: theme.secondary }}
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className={`w-full h-48 object-cover ${vibe.rounded} mb-4`}
                />
              )}
              
              {item.icon && (
                <div className="text-3xl md:text-4xl mb-3">
                  {item.icon}
                </div>
              )}
              
              <h3 
                className="text-xl md:text-2xl font-semibold mb-3"
                style={{ color: theme.primary }}
              >
                {item.name}
              </h3>
              
              <p 
                className={vibe.textSize}
                style={{ color: theme.text }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardServices;
