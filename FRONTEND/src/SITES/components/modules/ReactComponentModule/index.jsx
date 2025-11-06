import { REACT_COMPONENT_DEFAULTS, REACT_COMPONENT_DESCRIPTOR } from '../_descriptors';
import DefaultReactComponent from './layouts/DefaultReactComponent';

const LAYOUTS = {
  default: DefaultReactComponent
};

const ReactComponentModule = ({ layout = 'default', content = {}, vibe, theme }) => {
  const defaults = REACT_COMPONENT_DEFAULTS[layout] || REACT_COMPONENT_DEFAULTS.default;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.default;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ReactComponentModule.descriptor = REACT_COMPONENT_DESCRIPTOR;
export default ReactComponentModule;
