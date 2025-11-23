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

const HeroSection = ({ layout = 'centered', content = {}, style, isEditing, moduleId, pageId, typography }) => {
  console.log('[HeroSection] Rendering with layout:', layout);
  console.log('[HeroSection] content:', content);
  console.log('[HeroSection] content keys:', Object.keys(content || {}));
  console.log('[HeroSection] isEditing:', isEditing, 'moduleId:', moduleId, 'pageId:', pageId);
  
  // Don't merge with defaults - use only actual content from JSON
  // This ensures AI-generated changes are displayed immediately
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.centered;
  return (
    <LayoutComponent
      content={content}
      style={style}
      isEditing={isEditing}
      moduleId={moduleId}
      pageId={pageId}
      typography={typography}
    />
  );
};

HeroSection.descriptor = HERO_DESCRIPTOR;
export default HeroSection;
