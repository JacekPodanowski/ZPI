// layouts/DetailedCalendar.jsx - Detailed with options display
const DetailedCalendar = ({ content, style }) => {
  return (
    <section 
  className={`${style.spacing} ${style.rounded}`}
  style={{ backgroundColor: style.background }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 
          className={`${style.headingSize} text-center`}
          style={{ color: style.primary }}
        >
          {content.title}
        </h2>
        
        {content.description && (
          <p 
            className={`${style.textSize} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
            style={{ color: style.text }}
          >
            {content.description}
          </p>
        )}
        
        {/* Booking Options */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-10 md:mt-12">
          {/* Individual Sessions */}
          <div 
            className={`${style.cardStyle} ${style.animations}`}
            style={{ borderColor: style.secondary }}
          >
            <div className="text-3xl md:text-4xl mb-4">👤</div>
            <h3 
              className="text-xl md:text-2xl font-semibold mb-3"
              style={{ color: style.primary }}
            >
              Individual Sessions
            </h3>
            <p 
              className={`${style.textSize} mb-6`}
              style={{ color: style.text }}
            >
              One-on-one personalized sessions tailored to your needs
            </p>
            
            {content.showAvailability && (
              <div 
                className="mb-6 p-3 md:p-4 rounded"
                style={{ backgroundColor: style.secondary + '40' }}
              >
                <p className="text-sm" style={{ color: style.text }}>
                  <strong>Next Available:</strong> Tomorrow at 2:00 PM
                </p>
              </div>
            )}
            
            <a href={content.bookingUrl}>
              <button 
                className={`${style.buttonStyle} ${style.shadows} ${style.animations} w-full`}
                style={{ backgroundColor: style.primary, color: style.background }}
              >
                Book Individual
              </button>
            </a>
          </div>
          
          {/* Group Sessions */}
          {content.allowGroupBookings && (
            <div 
              className={`${style.cardStyle} ${style.animations}`}
              style={{ borderColor: style.secondary }}
            >
              <div className="text-3xl md:text-4xl mb-4">👥</div>
              <h3 
                className="text-xl md:text-2xl font-semibold mb-3"
                style={{ color: style.primary }}
              >
                Group Sessions
              </h3>
              <p 
                className={`${style.textSize} mb-6`}
                style={{ color: style.text }}
              >
                Join others in a collaborative learning environment
              </p>
              
              {content.showAvailability && (
                <div 
                  className="mb-6 p-3 md:p-4 rounded"
                  style={{ backgroundColor: style.secondary + '40' }}
                >
                  <p className="text-sm" style={{ color: style.text }}>
                    <strong>Next Session:</strong> Friday at 6:00 PM (4 spots left)
                  </p>
                </div>
              )}
              
              <a href={content.bookingUrl}>
                <button 
                  className={`${style.buttonStyle} ${style.shadows} ${style.animations} w-full`}
                  style={{ backgroundColor: style.primary, color: style.background }}
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
