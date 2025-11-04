// layouts/CompactCalendar.jsx - Minimal calendar with CTA
const CompactCalendar = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 
          className={vibe.headingSize}
          style={{ color: theme.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${vibe.textSize} mt-4 md:mt-6`}
            style={{ color: theme.text }}
          >
            {content.description}
          </p>
        )}
        
        {/* Simple Calendar Visualization */}
        <div 
          className={`${vibe.cardStyle} ${vibe.animations} mt-8 md:mt-10 p-6 md:p-8`}
          style={{ borderColor: theme.secondary }}
        >
          <div className="text-4xl md:text-5xl mb-4">📅</div>
          
          {content.showAvailability && (
            <p 
              className={`${vibe.textSize} mb-6`}
              style={{ color: theme.text }}
            >
              Next available: <strong style={{ color: theme.primary }}>Tomorrow at 2:00 PM</strong>
            </p>
          )}
          
          <a href={content.bookingUrl}>
            <button 
              className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations}`}
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              View Available Times
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CompactCalendar;
