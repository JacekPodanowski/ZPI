import { VIDEO_DEFAULTS } from './defaults';
import { VIDEO_DESCRIPTOR } from './descriptor';
import StandardVideo from './layouts/StandardVideo';
import FullWidthVideo from './layouts/FullWidthVideo';
import CompactVideo from './layouts/CompactVideo';

const LAYOUTS = {
  standard: StandardVideo,
  fullWidth: FullWidthVideo,
  compact: CompactVideo
};

const VideoModule = ({ layout = 'standard', content = {}, vibe, theme }) => {
  const defaults = VIDEO_DEFAULTS[layout] || VIDEO_DEFAULTS.standard;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.standard;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

VideoModule.descriptor = VIDEO_DESCRIPTOR;
export default VideoModule;
