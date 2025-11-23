import { VIDEO_DEFAULTS } from './defaults';
import { VIDEO_DESCRIPTOR } from './descriptor';
import StandardVideo from './layouts/StandardVideo';
import FullWidthVideo from './layouts/FullWidthVideo';
import CompactVideo from './layouts/CompactVideo';
import SplitVideo from './layouts/SplitVideo';

const LAYOUTS = {
  standard: StandardVideo,
  fullWidth: FullWidthVideo,
  compact: CompactVideo,
  split: SplitVideo
};

const VideoModule = ({ layout = 'embedded', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = VIDEO_DEFAULTS[layout] || VIDEO_DEFAULTS.embedded;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.standard;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
};

VideoModule.descriptor = VIDEO_DESCRIPTOR;
export default VideoModule;
