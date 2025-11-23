// layouts/ListCalendar.jsx - List view of upcoming sessions
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const ListCalendar = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleDescriptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { description: newValue });
  };

  // Mock upcoming sessions data
  const mockSessions = [
    { day: "Monday", date: "Nov 11", time: "2:00 PM", type: "Individual", available: true },
    { day: "Tuesday", date: "Nov 12", time: "10:00 AM", type: "Individual", available: true },
    { day: "Wednesday", date: "Nov 13", time: "4:00 PM", type: "Group", available: true, spots: 5 },
    { day: "Thursday", date: "Nov 14", time: "3:00 PM", type: "Individual", available: false },
    { day: "Friday", date: "Nov 15", time: "6:00 PM", type: "Group", available: true, spots: 3 }
  ];
  
  return (
    <section 
  className={`${style.spacing} ${style.rounded}`}
  style={{ backgroundColor: style.background }}
    >
      <div className="max-w-4xl mx-auto">
        {(isEditing || content.title) && (
          isEditing ? (
            <EditableText
              value={content.title || ''}
              onSave={handleTitleSave}
              as="h2"
              className={`${style.headingSize} text-center`}
              style={{ color: style.primary }}
              placeholder="Click to edit title..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <h2 
              className={`${style.headingSize} text-center`}
              style={{ color: style.primary }}
            >
              {content.title}
            </h2>
          )
        )}
        
        {(isEditing || content.description) && (
          isEditing ? (
            <EditableText
              value={content.description || ''}
              onSave={handleDescriptionSave}
              as="p"
              className={`${style.textSize} text-center mt-4 md:mt-6`}
              style={{ color: style.text }}
              placeholder="Click to edit description..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${style.textSize} text-center mt-4 md:mt-6`}
              style={{ color: style.text }}
            >
              {content.description}
            </p>
          )
        )}
        
        {/* Sessions List */}
        <div className="mt-10 md:mt-12 space-y-3 md:space-y-4">
          {mockSessions
            .filter(session => content.allowGroupBookings || session.type === 'Individual')
            .map((session, index) => (
              <div 
                key={index}
                className={`${style.cardStyle} ${style.animations} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                style={{ 
                  borderColor: style.secondary,
                  opacity: session.available ? 1 : 0.5 
                }}
              >
                {/* Session Info */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 
                      className="text-lg md:text-xl font-semibold"
                      style={{ color: style.primary }}
                    >
                      {session.day}, {session.date}
                    </h3>
                    <span 
                      className="text-base md:text-lg"
                      style={{ color: style.text }}
                    >
                      {session.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: style.text }}>
                      {session.type === 'Group' ? '👥' : '👤'} {session.type}
                    </span>
                    {session.type === 'Group' && session.spots && (
                      <span style={{ color: style.text }}>
                        • {session.spots} spots left
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <a href={content.bookingUrl}>
                  <button 
                    className={`${style.buttonStyle} ${style.shadows} ${style.animations}`}
                    style={{ 
                      backgroundColor: session.available ? style.primary : style.secondary, 
                      color: style.background 
                    }}
                    disabled={!session.available}
                  >
                    {session.available ? 'Book Now' : 'Full'}
                  </button>
                </a>
              </div>
            ))}
        </div>
        
        {/* View All Link */}
        <div className="text-center mt-8 md:mt-10">
          <a 
            href={content.bookingUrl}
            className={`${style.textSize} underline ${style.animations}`}
            style={{ color: style.primary }}
          >
            View Full Calendar →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ListCalendar;
