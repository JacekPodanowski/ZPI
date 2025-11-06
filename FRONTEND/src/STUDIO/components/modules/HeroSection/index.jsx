// index.jsx - Main HeroSection component with layout switching
import { HERO_DEFAULTS } from './defaults';
import { HERO_DESCRIPTOR } from './descriptor';
import CenteredHero from './layouts/CenteredHero';
import SplitHero from './layouts/SplitHero';
import FullscreenHero from './layouts/FullscreenHero';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  centered: CenteredHero,
  split: SplitHero,
  fullscreen: FullscreenHero
};

const HeroSection = ({ layout = 'centered', content = {}, vibe, theme }) => {
  const defaults = HERO_DEFAULTS[layout] || HERO_DEFAULTS.centered;
  
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.centered;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

HeroSection.descriptor = HERO_DESCRIPTOR;
export default HeroSection;
