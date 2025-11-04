// index.jsx - Main HeroSection component with layout switching
import { HERO_DEFAULTS } from './defaults';
import { HERO_DESCRIPTOR } from './descriptor';
import CenteredHero from './layouts/CenteredHero';
import SplitHero from './layouts/SplitHero';
import FullscreenHero from './layouts/FullscreenHero';

const LAYOUTS = {
  centered: CenteredHero,
  split: SplitHero,
  fullscreen: FullscreenHero
};

const HeroSection = ({ layout = 'centered', content = {}, vibe, theme }) => {
  const defaults = HERO_DEFAULTS[layout] || HERO_DEFAULTS.centered;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.centered;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

HeroSection.descriptor = HERO_DESCRIPTOR;
export default HeroSection;
