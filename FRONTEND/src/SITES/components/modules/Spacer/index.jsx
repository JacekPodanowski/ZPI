import { SPACER_DEFAULTS } from './defaults';
import { SPACER_DESCRIPTOR } from './descriptor';
import SmallSpacer from './layouts/SmallSpacer';
import MediumSpacer from './layouts/MediumSpacer';
import LargeSpacer from './layouts/LargeSpacer';

const LAYOUTS = {
  small: SmallSpacer,
  medium: MediumSpacer,
  large: LargeSpacer
};

const SpacerModule = ({ layout = 'medium', content = {}, style }) => {
  const defaults = SPACER_DEFAULTS[layout] || SPACER_DEFAULTS.medium;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.medium;
  return <LayoutComponent content={mergedContent} style={style} />;
};

SpacerModule.descriptor = SPACER_DESCRIPTOR;
export default SpacerModule;
