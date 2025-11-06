import { BUTTON_DEFAULTS } from './defaults';
import { BUTTON_DESCRIPTOR } from './descriptor';
import BlockButton from './layouts/BlockButton';
import InlineButton from './layouts/InlineButton';
import FullWidthButton from './layouts/FullWidthButton';

const LAYOUTS = {
  block: BlockButton,
  inline: InlineButton,
  fullWidth: FullWidthButton
};

const ButtonModule = ({ layout = 'block', content = {}, vibe, theme }) => {
  const defaults = BUTTON_DEFAULTS[layout] || BUTTON_DEFAULTS.block;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.block;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ButtonModule.descriptor = BUTTON_DESCRIPTOR;
export default ButtonModule;
