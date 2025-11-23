import { GALLERY_DEFAULTS } from './defaults';
import { GALLERY_DESCRIPTOR } from './descriptor';
import GridGallery from './layouts/GridGallery';
import MasonryGallery from './layouts/MasonryGallery';
import SlideshowGallery from './layouts/SlideshowGallery';
import CarouselGallery from './layouts/CarouselGallery';
import FadeGallery from './layouts/FadeGallery';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  grid: GridGallery,
  masonry: MasonryGallery,
  slideshow: SlideshowGallery,
  carousel: CarouselGallery,
  fade: FadeGallery
};

const GallerySection = ({ layout = 'grid', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = GALLERY_DEFAULTS[layout] || GALLERY_DEFAULTS.grid;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
};

GallerySection.descriptor = GALLERY_DESCRIPTOR;
export default GallerySection;
