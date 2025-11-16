import { BLOG_DEFAULTS } from './defaults';
import { BLOG_DESCRIPTOR } from './descriptor';
import GridBlog from './layouts/GridBlog';

const LAYOUTS = {
  grid: GridBlog,
  list: GridBlog, // Use same for now
  masonry: GridBlog  // Use same for now
};

const BlogSection = ({ layout = 'grid', content = {}, style }) => {
  const defaultOptions = BLOG_DEFAULTS[layout] || BLOG_DEFAULTS.grid;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} style={style} />;
};

BlogSection.descriptor = BLOG_DESCRIPTOR;
export default BlogSection;
