import { BLOG_DEFAULTS } from './defaults';
import { BLOG_DESCRIPTOR } from './descriptor';
import GridBlog from './layouts/GridBlog';

const LAYOUTS = {
  grid: GridBlog,
  list: GridBlog, // Use same for now
  masonry: GridBlog  // Use same for now
};

const BlogModule = ({ layout = 'grid', content = {}, vibe, theme }) => {
  const defaults = BLOG_DEFAULTS[layout] || BLOG_DEFAULTS.grid;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

BlogModule.descriptor = BLOG_DESCRIPTOR;
export default BlogModule;
