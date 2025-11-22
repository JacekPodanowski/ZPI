// index.jsx - Main ServicesSection component
import { SERVICES_DEFAULTS } from './defaults';
import { SERVICES_DESCRIPTOR } from './descriptor';
import CardServices from './layouts/CardServices';
import ListServices from './layouts/ListServices';
import AccordionServices from './layouts/AccordionServices';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  cards: CardServices,
  list: ListServices,
  accordion: AccordionServices
};

const ServicesSection = ({ layout = 'cards', content = {}, style }) => {
  const defaultOptions = SERVICES_DEFAULTS[layout] || SERVICES_DEFAULTS.cards;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  // Preserve explicitly set values from content (don't let defaults override them)
  if (content.substyle !== undefined) {
    mergedContent.substyle = content.substyle;
  }
  if (content.flipStyle !== undefined) {
    mergedContent.flipStyle = content.flipStyle;
  }
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.cards;
  return <LayoutComponent content={mergedContent} style={style} />;
};

ServicesSection.descriptor = SERVICES_DESCRIPTOR;
export default ServicesSection;
