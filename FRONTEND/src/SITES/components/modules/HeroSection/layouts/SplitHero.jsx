// layouts/SplitHero.jsx - Split layout with mobile/desktop responsiveness
const SplitHero = ({ content, vibe, theme }) => {
  const imageOnLeft = content.imagePosition === 'left';
  
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className={`
        max-w-7xl mx-auto 
        grid md:grid-cols-2 gap-6 md:gap-8 
        items-center
        ${imageOnLeft ? 'md:grid-flow-dense' : ''}
      `}>
        {/* Text Content */}
        <div className={imageOnLeft ? 'md:col-start-2' : ''}>
          <h1 
            className={vibe.headingSize}
            style={{ color: theme.primary }}
          >
            {content.heading}
          </h1>
          
          {content.subheading && (
            <p className={`${vibe.textSize} mt-4 md:mt-6`} style={{ color: theme.text }}>
              {content.subheading}
            </p>
          )}
          
          {content.ctaText && (
            <a href={content.ctaLink}>
              <button 
                className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} mt-6 md:mt-8`}
                style={{ backgroundColor: theme.primary, color: theme.background }}
              >
                {content.ctaText}
              </button>
            </a>
          )}
        </div>
        
        {/* Image */}
        <div className={imageOnLeft ? 'md:col-start-1 md:row-start-1' : ''}>
          <img 
            src={content.image} 
            alt={content.heading}
            className={`w-full h-auto ${vibe.rounded} ${vibe.shadows}`}
          />
        </div>
      </div>
    </section>
  );
};

export default SplitHero;
