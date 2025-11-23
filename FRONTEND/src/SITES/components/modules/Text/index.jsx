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

const TextModule = ({ layout = 'basic', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = TEXT_DEFAULTS[layout] || TEXT_DEFAULTS.basic;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.block;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
};

TextModule.descriptor = TEXT_DESCRIPTOR;
export default TextModule;
