// index.jsx - Main ContactSection component
import React, { memo } from 'react';
import { CONTACT_DEFAULTS } from './defaults';
import { CONTACT_DESCRIPTOR } from './descriptor';
import FormContact from './layouts/FormContact';
import InfoContact from './layouts/InfoContact';
import SplitContact from './layouts/SplitContact';
import { mergeWithDefaults } from '../../../../utils/contentMerge';

const LAYOUTS = {
  form: FormContact,
  info: InfoContact,
  split: SplitContact
};

const ContactSection = memo(({ layout = 'form', content = {}, style, isEditing, moduleId, pageId }) => {
  const defaultOptions = CONTACT_DEFAULTS[layout] || CONTACT_DEFAULTS.form;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.form;
  return <LayoutComponent content={mergedContent} style={style} isEditing={isEditing} moduleId={moduleId} pageId={pageId} />;
});

ContactSection.displayName = 'ContactSection';
ContactSection.descriptor = CONTACT_DESCRIPTOR;
export default ContactSection;
