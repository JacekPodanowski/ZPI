import { SERVICES_AND_PRICING_DEFAULTS, SERVICES_DESCRIPTOR } from '../_descriptors';
import CardsServices from './layouts/CardsServices';

const LAYOUTS = {
  cards: CardsServices,
  list: CardsServices,
  table: CardsServices
};

const ServicesAndPricingModule = ({ layout = 'cards', content = {}, style }) => {
  const defaultOptions = SERVICES_AND_PRICING_DEFAULTS[layout] || SERVICES_AND_PRICING_DEFAULTS.cards;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.cards;
  return <LayoutComponent content={mergedContent} style={style} />;
};

ServicesAndPricingModule.descriptor = SERVICES_DESCRIPTOR;
export default ServicesAndPricingModule;
