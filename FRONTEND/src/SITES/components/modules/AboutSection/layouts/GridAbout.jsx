// layouts/GridAbout.jsx - Grid layout with image and highlights
const GridAbout = ({ content, vibe, theme }) => {
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
        
        {/* Image and Description Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mt-8 md:mt-12">
          {content.image && (
            <img 
              src={content.image} 
              alt={content.title}
              className={`w-full h-auto ${vibe.rounded} ${vibe.shadows}`}
            />
          )}
          
          <div>
            <p 
              className={vibe.textSize}
              style={{ color: theme.text }}
            >
              {content.description}
            </p>
          </div>
        </div>
        
        {/* Highlights Grid */}
        {content.highlights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
            {content.highlights.map((highlight, index) => (
              <div 
                key={index}
                className={`${vibe.cardStyle} ${vibe.animations} text-center`}
                style={{ borderColor: theme.secondary }}
              >
                <h3 
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: theme.primary }}
                >
                  {highlight.title}
                </h3>
                <p 
                  className={`${vibe.textSize} text-sm`}
                  style={{ color: theme.text }}
                >
                  {highlight.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GridAbout;
