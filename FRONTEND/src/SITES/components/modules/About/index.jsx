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

const AboutSection = ({ layout = 'grid', content = {}, vibe, theme }) => {
  const defaults = ABOUT_DEFAULTS[layout] || ABOUT_DEFAULTS.grid;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

AboutSection.descriptor = ABOUT_DESCRIPTOR;
export default AboutSection;
