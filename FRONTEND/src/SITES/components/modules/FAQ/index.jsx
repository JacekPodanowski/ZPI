import React, { memo } from 'react';
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

const FAQSection = memo(({ layout = 'accordion', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = FAQ_DEFAULTS[layout] || FAQ_DEFAULTS.accordion;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.accordion;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
});

FAQSection.displayName = 'FAQSection';
FAQSection.descriptor = FAQ_DESCRIPTOR;
export default FAQSection;
