// layouts/CenteredHero.jsx - Centered layout with mobile responsiveness
const CenteredHero = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} text-center`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 
          className={vibe.headingSize}
          style={{ color: theme.primary }}
        >
          {content.heading}
        </h1>
        
        {content.subheading && (
          <p 
            className={`${vibe.textSize} mt-4 md:mt-6`} 
            style={{ color: theme.text }}
          >
            {content.subheading}
          </p>
        )}
        
        {content.ctaText && (
          <a href={content.ctaLink}>
            <button 
              className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} mt-8 md:mt-10`}
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              {content.ctaText}
            </button>
          </a>
        )}
      </div>
    </section>
  );
};

export default CenteredHero;
