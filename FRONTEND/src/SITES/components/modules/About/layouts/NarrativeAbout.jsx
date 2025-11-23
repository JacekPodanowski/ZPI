// layouts/NarrativeAbout.jsx - Narrative layout with side image
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import { resolveMediaUrl } from '../../../../../config/api';
import EditableText from '../../../../../STUDIO/components/EditableText';
import EditableImage from '../../../../../STUDIO/components/EditableImage';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const NarrativeAbout = ({ content, style, isEditing, moduleId, pageId, typography }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const handleDescriptionSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { description: newValue });
  };

  const handleImageSave = (newUrl) => {
    updateModuleContent(pageId, moduleId, { image: newUrl });
  };

  const handleHighlightFieldSave = (index, field, newValue) => {
    const updatedHighlights = [...(content.keyHighlights || content.highlights || [])];
    updatedHighlights[index] = { ...updatedHighlights[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { keyHighlights: updatedHighlights });
  };

  const handleTimelineFieldSave = (index, field, newValue) => {
    const updatedTimeline = [...(content.timeline || content.milestones || [])];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: newValue };
    updateModuleContent(pageId, moduleId, { timeline: updatedTimeline });
  };

  const handleAddHighlight = () => {
    const highlightsData = content.keyHighlights || content.highlights || [];
    const newHighlight = {
      title: 'Nowy punkt',
      description: 'Kliknij aby edytować opis'
    };
    updateModuleContent(pageId, moduleId, { keyHighlights: [...highlightsData, newHighlight] });
  };

  const handleDeleteHighlight = (index) => {
    const highlightsData = content.keyHighlights || content.highlights || [];
    const updatedHighlights = [...highlightsData];
    updatedHighlights.splice(index, 1);
    updateModuleContent(pageId, moduleId, { keyHighlights: updatedHighlights });
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
  const imageUrl = content.image ? resolveMediaUrl(content.image) : '';
  const spacingClass = style?.spacing || '';
  const roundedClass = style?.rounded || '';
  const shadowClass = style?.shadows || '';
  const animationClass = style?.animations || '';
  const headingClass = style?.headingSize || 'text-4xl';
  const textClass = style?.textSize || 'text-base';
  const backgroundColor = content.bgColor || style?.background || '#f0f0ed';
  const primaryColor = content.primaryColor || style?.primary || '#1e1e1e';
  const textColor = content.textColor || style?.text || '#333333';
  
  // Support both old (milestones/highlights) and new (timeline/keyHighlights) field names
  const timelineData = content.timeline || content.milestones || [];
  const highlightsData = content.keyHighlights || content.highlights || [];

  const titleFont = typography?.titleFont;
  const bodyFont = typography?.textFont;

  return (
    <section 
      className={`${spacingClass} ${roundedClass} relative overflow-hidden`}
      style={{ backgroundColor, fontFamily: bodyFont }}
    >
      <BackgroundMedia media={content.backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-6xl mx-auto relative z-10">
        {isEditing ? (
          <EditableText
            value={content.title || ''}
            onSave={handleTitleSave}
            as="h2"
            className={`${headingClass} text-center mb-4`}
            style={{ color: primaryColor, fontFamily: titleFont }}
            placeholder="Click to edit title..."
            multiline
            isModuleSelected={true}
          />
        ) : (
          <h2 
            className={`${headingClass} text-center mb-4`}
            style={{ color: primaryColor, fontFamily: titleFont }}
          >
            {content.title}
          </h2>
        )}
        
        {(isEditing || content.subtitle) && (
          isEditing ? (
            <EditableText
              value={content.subtitle || ''}
              onSave={handleSubtitleSave}
              as="p"
              className={`${textClass} text-center italic mb-8 max-w-3xl mx-auto`}
              style={{ color: textColor, opacity: 0.9, fontFamily: bodyFont }}
              placeholder="Click to edit subtitle..."
              multiline
              isModuleSelected={true}
            />
          ) : (
            <p 
              className={`${textClass} text-center italic mb-8 max-w-3xl mx-auto`}
              style={{ color: textColor, opacity: 0.9, fontFamily: bodyFont }}
            >
              {content.subtitle}
            </p>
          )
        )}
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start mt-8 md:mt-12">
          {/* Image */}
          <div className="md:col-span-1">
            {isEditing ? (
              <EditableImage
                value={content.image}
                onSave={handleImageSave}
                alt={content.title}
                className={`w-full h-auto ${roundedClass} ${shadowClass} sticky top-8`}
                isModuleSelected={true}
              />
            ) : (
              <img 
                src={imageUrl || 'https://picsum.photos/seed/about-narrative-placeholder/600/800'} 
                alt={content.title}
                className={`w-full h-auto ${roundedClass} ${shadowClass} sticky top-8`}
              />
            )}
          </div>
          
          {/* Narrative Text */}
          <div className="md:col-span-2">
            {/* Description */}
            <div 
              className={`${textClass} leading-relaxed prose prose-lg max-w-none`}
              style={{ color: textColor, fontFamily: bodyFont }}
              dangerouslySetInnerHTML={{ __html: content.description }}
            />
            
            {/* Key Highlights */}
            {highlightsData.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h3 
                  className="text-2xl font-semibold mb-6"
                  style={{ color: primaryColor, fontFamily: titleFont }}
                >
                  Kluczowe Osiągnięcia
                </h3>
                <div className="grid gap-4">
                  {highlightsData.map((highlight, index) => (
                    <div 
                      key={index}
                      className={`flex gap-4 items-start ${animationClass} relative`}
                    >
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteHighlight(index)}
                          className="absolute top-0 right-0 z-10 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                          style={{ fontSize: '18px' }}
                        >
                          ×
                        </button>
                      )}
                      <div 
                        className={`${roundedClass} p-3 flex-shrink-0`}
                        style={{ backgroundColor: `${primaryColor}15`, fontFamily: titleFont }}
                      >
                        <span className="text-2xl">
                          {highlight.icon === 'award' ? '🏆' : 
                           highlight.icon === 'star' ? '⭐' : 
                           highlight.icon === 'heart' ? '❤️' : '✨'}
                        </span>
                      </div>
                      <div>
                        {isEditing ? (
                          <EditableText
                            value={highlight.title || ''}
                            onSave={(newValue) => handleHighlightFieldSave(index, 'title', newValue)}
                            as="h4"
                            className="font-semibold text-lg mb-1"
                            style={{ color: primaryColor, fontFamily: titleFont }}
                            placeholder="Click to edit title..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <h4 
                            className="font-semibold text-lg mb-1"
                            style={{ color: primaryColor, fontFamily: titleFont }}
                          >
                            {highlight.title}
                          </h4>
                        )}
                        {isEditing ? (
                          <EditableText
                            value={highlight.description || ''}
                            onSave={(newValue) => handleHighlightFieldSave(index, 'description', newValue)}
                            as="p"
                            className={`${textClass}`}
                            style={{ color: textColor, fontFamily: bodyFont }}
                            placeholder="Click to edit description..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <p 
                            className={`${textClass}`}
                            style={{ color: textColor, fontFamily: bodyFont }}
                          >
                            {highlight.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleAddHighlight}
                      className="bg-[rgb(146,0,32)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgb(114,0,21)] transition-colors shadow-lg"
                      style={{ fontSize: '20px' }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Timeline */}
            {timelineData.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h3 
                  className="text-2xl font-semibold mb-6"
                  style={{ color: primaryColor, fontFamily: titleFont }}
                >
                  Moja Droga
                </h3>
                <div className="space-y-6">
                  {timelineData.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`flex gap-4 ${animationClass} relative`}
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
                        className={`${roundedClass} px-4 py-2 h-fit ${shadowClass}`}
                        style={{ 
                          backgroundColor: primaryColor, 
                          color: style?.background || '#ffffff',
                          fontFamily: titleFont 
                        }}
                      >
                        {isEditing ? (
                          <EditableText
                            value={milestone.year || ''}
                            onSave={(newValue) => handleTimelineFieldSave(index, 'year', newValue)}
                            as="span"
                            className="font-bold"
                            style={{ color: style?.background || '#ffffff', fontFamily: titleFont }}
                            placeholder="Year..."
                            isModuleSelected={true}
                          />
                        ) : (
                          <span className="font-bold" style={{ fontFamily: titleFont }}>{milestone.year}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <EditableText
                            value={milestone.title || ''}
                            onSave={(newValue) => handleTimelineFieldSave(index, 'title', newValue)}
                            as="h4"
                            className="font-semibold text-lg mb-1"
                            style={{ color: primaryColor, fontFamily: titleFont }}
                            placeholder="Click to edit title..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <h4 
                            className="font-semibold text-lg mb-1"
                            style={{ color: primaryColor, fontFamily: titleFont }}
                          >
                            {milestone.title}
                          </h4>
                        )}
                        {isEditing ? (
                          <EditableText
                            value={milestone.description || milestone.desc || ''}
                            onSave={(newValue) => handleTimelineFieldSave(index, 'description', newValue)}
                            as="p"
                            className={textClass}
                            style={{ color: textColor, fontFamily: bodyFont }}
                            placeholder="Click to edit description..."
                            multiline
                            isModuleSelected={true}
                          />
                        ) : (
                          <p 
                            className={textClass}
                            style={{ color: textColor, fontFamily: bodyFont }}
                          >
                            {milestone.description || milestone.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleAddMilestone}
                      className="bg-[rgb(146,0,32)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgb(114,0,21)] transition-colors shadow-lg"
                      style={{ fontSize: '20px' }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeAbout;
