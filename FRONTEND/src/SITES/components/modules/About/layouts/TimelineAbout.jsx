// layouts/TimelineAbout.jsx - Timeline layout
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const TimelineAbout = ({ content, style, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleDescriptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { description: newValue });
  };

  const handleMilestoneFieldSave = (index, field, newValue) => {
    const updatedTimeline = [...(content.timeline || content.milestones || [])];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { timeline: updatedTimeline });
  };

  const handleAddMilestone = () => {
    const timelineData = content.timeline || content.milestones || [];
    const newMilestone = {
      year: new Date().getFullYear().toString(),
      title: 'Nowy etap',
      description: 'Kliknij aby edytować opis'
    };
    updateModuleContent(pageId, moduleId, { timeline: [...timelineData, newMilestone] });
  };

  const handleDeleteMilestone = (index) => {
    const timelineData = content.timeline || content.milestones || [];
    const updatedTimeline = [...timelineData];
    updatedTimeline.splice(index, 1);
    updateModuleContent(pageId, moduleId, { timeline: updatedTimeline });
  };

  const overlayColor = content.backgroundOverlayColor ?? (content.backgroundImage ? 'rgba(0, 0, 0, 0.3)' : undefined);
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-4xl';
  const textClass = style?.textSize || 'text-base';
  const backgroundColor = content.bgColor || style?.background || '#f0f0ed';
  const primaryColor = content.primaryColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';
  
  // Support both old (milestones) and new (timeline) field names
  const timelineData = content.timeline || content.milestones || [];

  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden`}
      style={{ backgroundColor }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-5xl mx-auto relative z-10">
        {isEditing ? (
          <EditableText
            value={content.title || ''}
            onSave={handleTitleSave}
            as="h2"
            className={`${headingClass} text-center`}
            style={{ color: primaryColor }}
            placeholder="Click to edit title..."
            multiline
            isModuleSelected={true}
          />
        ) : (
          <h2 
            className={`${headingClass} text-center`}
            style={{ color: primaryColor }}
          >
            {content.title}
          </h2>
        )}
        
        {(isEditing || content.description) && (
          isEditing ? (
            <EditableText
              value={content.description || ''}
              onSave={handleDescriptionSave}
              as="p"
              className={`${textClass} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
              style={{ color: textColor }}
              placeholder="Click to edit description..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${textClass} text-center mt-4 md:mt-6 max-w-3xl mx-auto`}
              style={{ color: textColor }}
            >
              {content.description}
            </p>
          )
        )}
        
        {/* Timeline */}
        <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
          {timelineData.map((milestone, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-4 md:gap-8 items-start ${animationClass} relative`}
            >
              {isEditing && (
                <button
                  onClick={() => handleDeleteMilestone(index)}
                  className="absolute top-0 right-0 z-10 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                  style={{ fontSize: '18px' }}
                >
                  ×
                </button>
              )}
              <div 
                className={`${roundedClass} px-4 py-2 ${shadowClass} flex-shrink-0`}
                style={{ 
                  backgroundColor: primaryColor, 
                  color: style?.background || '#ffffff' 
                }}
              >
                {isEditing ? (
                  <EditableText
                    value={milestone.year || ''}
                    onSave={(newValue) => handleMilestoneFieldSave(index, 'year', newValue)}
                    as="span"
                    className="font-bold text-lg md:text-xl"
                    style={{ color: style?.background || '#ffffff' }}
                    placeholder="Year..."
                    isModuleSelected={true}
                  />
                ) : (
                  <span className="font-bold text-lg md:text-xl">{milestone.year}</span>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <EditableText
                    value={milestone.title || ''}
                    onSave={(newValue) => handleMilestoneFieldSave(index, 'title', newValue)}
                    as="h3"
                    className="text-xl md:text-2xl font-semibold mb-2"
                    style={{ color: primaryColor }}
                    placeholder="Click to edit milestone title..."
                    multiline
                    isModuleSelected={true}
                  />
                ) : (
                  <h3 
                    className="text-xl md:text-2xl font-semibold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {milestone.title}
                  </h3>
                )}
                {isEditing ? (
                  <EditableText
                    value={milestone.description || milestone.desc || ''}
                    onSave={(newValue) => handleMilestoneFieldSave(index, 'description', newValue)}
                    as="p"
                    className={textClass}
                    style={{ color: textColor }}
                    placeholder="Click to edit description..."
                    multiline
                    isModuleSelected={true}
                  />
                ) : (
                  <p 
                    className={textClass}
                    style={{ color: textColor }}
                  >
                    {milestone.description || milestone.desc}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddMilestone}
              className="bg-[rgb(146,0,32)] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[rgb(114,0,21)] transition-colors shadow-lg"
              style={{ fontSize: '24px' }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TimelineAbout;
