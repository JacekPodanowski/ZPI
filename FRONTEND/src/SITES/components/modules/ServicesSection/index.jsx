// index.jsx - Main ServicesSection component
import { SERVICES_DEFAULTS } from './defaults';
import { SERVICES_DESCRIPTOR } from './descriptor';
import CardServices from './layouts/CardServices';
import ListServices from './layouts/ListServices';
import AccordionServices from './layouts/AccordionServices';

const LAYOUTS = {
  cards: CardServices,
  list: ListServices,
  accordion: AccordionServices
};

const ServicesSection = ({ layout = 'cards', content = {}, vibe, theme }) => {
  const defaults = SERVICES_DEFAULTS[layout] || SERVICES_DEFAULTS.cards;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.cards;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ServicesSection.descriptor = SERVICES_DESCRIPTOR;
export default ServicesSection;
