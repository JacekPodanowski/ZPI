// index.jsx - Main Navigation component
import { NAVIGATION_DEFAULTS } from './defaults';
import { NAVIGATION_DESCRIPTOR } from './descriptor';
import HorizontalNav from './layouts/HorizontalNav';
import CenteredNav from './layouts/CenteredNav';
import MinimalNav from './layouts/MinimalNav';
import MobileNav from './layouts/MobileNav';

const LAYOUTS = {
  horizontal: HorizontalNav,
  centered: CenteredNav,
  minimal: MinimalNav,
  mobile: MobileNav
};

const Navigation = ({ layout = 'horizontal', content = {}, style, onNavigate, typography }) => {
  const defaults = NAVIGATION_DEFAULTS[layout] || NAVIGATION_DEFAULTS.horizontal;

  const mergedContent = {
    ...defaults,
    ...content
  };

  if (!Array.isArray(mergedContent.links) || mergedContent.links.length === 0) {
    mergedContent.links = defaults.links || [];
  }

  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.horizontal;
  return (
    <LayoutComponent
      content={mergedContent}
      style={style}
      onNavigate={onNavigate}
      typography={typography}
    />
  );
};

Navigation.descriptor = NAVIGATION_DESCRIPTOR;
export default Navigation;
