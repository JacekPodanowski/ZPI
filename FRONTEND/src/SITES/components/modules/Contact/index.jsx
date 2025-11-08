// index.jsx - Main ContactSection component
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

const ContactSection = ({ layout = 'form', content = {}, vibe, theme }) => {
  const defaults = CONTACT_DEFAULTS[layout] || CONTACT_DEFAULTS.form;

  const mergedContent = mergeWithDefaults(defaults, content);
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.form;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ContactSection.descriptor = CONTACT_DESCRIPTOR;
export default ContactSection;
