// layouts/CompactCalendar.jsx - Minimal calendar with CTA
const CompactCalendar = ({ content, style }) => {
  return (
    <section 
      className={`${style.spacing} ${style.rounded}`}
      style={{ backgroundColor: style.background }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 
          className={style.headingSize}
          style={{ color: style.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${style.textSize} mt-4 md:mt-6`}
            style={{ color: style.text }}
          >
            {content.description}
          </p>
        )}
        
        {/* Simple Calendar Visualization */}
        <div 
          className={`${style.cardStyle} ${style.animations} mt-8 md:mt-10 p-6 md:p-8`}
          style={{ borderColor: style.secondary }}
        >
          <div className="text-4xl md:text-5xl mb-4">📅</div>
          
          {content.showAvailability && (
            <p 
              className={`${style.textSize} mb-6`}
              style={{ color: style.text }}
            >
              Next available: <strong style={{ color: style.primary }}>Tomorrow at 2:00 PM</strong>
            </p>
          )}
          
          <a href={content.bookingUrl}>
            <button 
              className={`${style.buttonStyle} ${style.shadows} ${style.animations}`}
              style={{ backgroundColor: style.primary, color: style.background }}
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
