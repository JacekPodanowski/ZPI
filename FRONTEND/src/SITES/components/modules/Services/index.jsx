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

const ServicesSection = ({ layout = 'cards', content = {}, vibe, theme }) => {
  const defaults = SERVICES_DEFAULTS[layout] || SERVICES_DEFAULTS.cards;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.cards;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ServicesSection.descriptor = SERVICES_DESCRIPTOR;
export default ServicesSection;
