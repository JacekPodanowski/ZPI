import { FAQ_DEFAULTS } from './defaults';
import { FAQ_DESCRIPTOR } from './descriptor';
import AccordionFAQ from './layouts/AccordionFAQ';
import ListFAQ from './layouts/ListFAQ';
import CardsFAQ from './layouts/CardsFAQ';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  accordion: AccordionFAQ,
  list: ListFAQ,
  cards: CardsFAQ
};

const FAQModule = ({ layout = 'accordion', content = {}, vibe, theme }) => {
  const defaults = FAQ_DEFAULTS[layout] || FAQ_DEFAULTS.accordion;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.accordion;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

FAQModule.descriptor = FAQ_DESCRIPTOR;
export default FAQModule;
