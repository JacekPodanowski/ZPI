// layouts/DetailedCalendar.jsx - Detailed with options display
const DetailedCalendar = ({ content, vibe, theme }) => {
  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded}`}
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-5xl mx-auto">
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
        
        {/* Booking Options */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-10 md:mt-12">
          {/* Individual Sessions */}
          <div 
            className={`${vibe.cardStyle} ${vibe.animations}`}
            style={{ borderColor: theme.secondary }}
          >
            <div className="text-3xl md:text-4xl mb-4">👤</div>
            <h3 
              className="text-xl md:text-2xl font-semibold mb-3"
              style={{ color: theme.primary }}
            >
              Individual Sessions
            </h3>
            <p 
              className={`${vibe.textSize} mb-6`}
              style={{ color: theme.text }}
            >
              One-on-one personalized sessions tailored to your needs
            </p>
            
            {content.showAvailability && (
              <div 
                className="mb-6 p-3 md:p-4 rounded"
                style={{ backgroundColor: theme.secondary + '40' }}
              >
                <p className="text-sm" style={{ color: theme.text }}>
                  <strong>Next Available:</strong> Tomorrow at 2:00 PM
                </p>
              </div>
            )}
            
            <a href={content.bookingUrl}>
              <button 
                className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} w-full`}
                style={{ backgroundColor: theme.primary, color: theme.background }}
              >
                Book Individual
              </button>
            </a>
          </div>
          
          {/* Group Sessions */}
          {content.allowGroupBookings && (
            <div 
              className={`${vibe.cardStyle} ${vibe.animations}`}
              style={{ borderColor: theme.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-4">👥</div>
              <h3 
                className="text-xl md:text-2xl font-semibold mb-3"
                style={{ color: theme.primary }}
              >
                Group Sessions
              </h3>
              <p 
                className={`${vibe.textSize} mb-6`}
                style={{ color: theme.text }}
              >
                Join others in a collaborative learning environment
              </p>
              
              {content.showAvailability && (
                <div 
                  className="mb-6 p-3 md:p-4 rounded"
                  style={{ backgroundColor: theme.secondary + '40' }}
                >
                  <p className="text-sm" style={{ color: theme.text }}>
                    <strong>Next Session:</strong> Friday at 6:00 PM (4 spots left)
                  </p>
                </div>
              )}
              
              <a href={content.bookingUrl}>
                <button 
                  className={`${vibe.buttonStyle} ${vibe.shadows} ${vibe.animations} w-full`}
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                >
                  View Group Sessions
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DetailedCalendar;
