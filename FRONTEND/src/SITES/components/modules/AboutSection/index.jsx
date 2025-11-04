// index.jsx - Main AboutSection component
import { ABOUT_DEFAULTS } from './defaults';
import { ABOUT_DESCRIPTOR } from './descriptor';
import TimelineAbout from './layouts/TimelineAbout';
import GridAbout from './layouts/GridAbout';
import NarrativeAbout from './layouts/NarrativeAbout';

const LAYOUTS = {
  timeline: TimelineAbout,
  grid: GridAbout,
  narrative: NarrativeAbout
};

const AboutSection = ({ layout = 'grid', content = {}, vibe, theme }) => {
  const defaults = ABOUT_DEFAULTS[layout] || ABOUT_DEFAULTS.grid;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

AboutSection.descriptor = ABOUT_DESCRIPTOR;
export default AboutSection;
