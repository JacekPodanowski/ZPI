import { TEXT_DEFAULTS } from './defaults';
import { TEXT_DESCRIPTOR } from './descriptor';
import BlockText from './layouts/BlockText';
import InlineText from './layouts/InlineText';
import CenteredText from './layouts/CenteredText';

const LAYOUTS = {
  block: BlockText,
  inline: InlineText,
  centered: CenteredText
};

const TextModule = ({ layout = 'block', content = {}, vibe, theme }) => {
  const defaults = TEXT_DEFAULTS[layout] || TEXT_DEFAULTS.block;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.block;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

TextModule.descriptor = TEXT_DESCRIPTOR;
export default TextModule;
