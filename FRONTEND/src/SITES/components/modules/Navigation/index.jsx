// index.jsx - Main Navigation component
import { NAVIGATION_DEFAULTS } from './defaults';
import { NAVIGATION_DESCRIPTOR } from './descriptor';
import HorizontalNav from './layouts/HorizontalNav';
import CenteredNav from './layouts/CenteredNav';
import MinimalNav from './layouts/MinimalNav';

const LAYOUTS = {
  horizontal: HorizontalNav,
  centered: CenteredNav,
  minimal: MinimalNav
};

const Navigation = ({ layout = 'horizontal', content = {}, vibe, theme }) => {
  const defaults = NAVIGATION_DEFAULTS[layout] || NAVIGATION_DEFAULTS.horizontal;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.horizontal;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

Navigation.descriptor = NAVIGATION_DESCRIPTOR;
export default Navigation;
