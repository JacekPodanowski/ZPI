// layouts/TimelineAbout.jsx - Timeline layout
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const TimelineAbout = ({ content, vibe, theme }) => {
  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);

  return (
    <section 
      className={`${vibe.spacing} ${vibe.rounded} relative overflow-hidden`}
      style={{ backgroundColor: content.bgColor || theme.background }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-5xl mx-auto relative z-10">
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
        
        {/* Timeline */}
        <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
          {content.milestones?.map((milestone, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-4 md:gap-8 items-start ${vibe.animations}`}
            >
              <div 
                className={`${vibe.rounded} px-4 py-2 ${vibe.shadows} flex-shrink-0`}
                style={{ 
                  backgroundColor: theme.primary, 
                  color: theme.background 
                }}
              >
                <span className="font-bold text-lg md:text-xl">{milestone.year}</span>
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-2"
                  style={{ color: theme.primary }}
                >
                  {milestone.title}
                </h3>
                <p 
                  className={vibe.textSize}
                  style={{ color: theme.text }}
                >
                  {milestone.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineAbout;
