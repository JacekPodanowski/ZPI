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

const GalleryModule = ({ layout = 'grid', content = {}, style }) => {
  const defaults = GALLERY_DEFAULTS[layout] || GALLERY_DEFAULTS.grid;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.grid;
  return <LayoutComponent content={mergedContent} style={style} />;
};

GalleryModule.descriptor = GALLERY_DESCRIPTOR;
export default GalleryModule;
