// layouts/NarrativeAbout.jsx - Narrative layout with side image
const NarrativeAbout = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          className={`${vibe.headingSize} text-center`}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start mt-8 md:mt-12">
          {/* Image */}
          {content.image && (
            <div className="md:col-span-1">
              <img 
                src={content.image} 
                alt={content.title}
                className={`w-full h-auto ${vibe.rounded} ${vibe.shadows} sticky top-8`}
              />
            </div>
          )}
          
          {/* Narrative Text */}
          <div className={content.image ? 'md:col-span-2' : 'md:col-span-3'}>
            <p 
              className={`${vibe.textSize} leading-relaxed whitespace-pre-line`}
              style={{ color: theme.text }}
            >
              {content.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeAbout;
