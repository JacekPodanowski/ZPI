// index.jsx - Main AboutSection component
import { ABOUT_DEFAULTS } from './defaults';
import { ABOUT_DESCRIPTOR } from './descriptor';
import TimelineAbout from './layouts/TimelineAbout';
import GridAbout from './layouts/GridAbout';
import NarrativeAbout from './layouts/NarrativeAbout';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  timeline: TimelineAbout,
  grid: GridAbout,
  narrative: NarrativeAbout
};

const AboutSection = ({ layout = 'grid', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = ABOUT_DEFAULTS[layout] || ABOUT_DEFAULTS.grid;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
};

AboutSection.descriptor = ABOUT_DESCRIPTOR;
export default AboutSection;
