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

const HeroSection = ({ layout = 'centered', content = {}, style }) => {
  // Use the first variant from defaults as fallback, but content from props should already be set
  const defaultOptions = HERO_DEFAULTS[layout] || HERO_DEFAULTS.centered;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.centered;
  return <LayoutComponent content={mergedContent} style={style} />;
};

HeroSection.descriptor = HERO_DESCRIPTOR;
export default HeroSection;
