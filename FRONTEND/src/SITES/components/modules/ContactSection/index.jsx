// index.jsx - Main ContactSection component
import { CONTACT_DEFAULTS } from './defaults';
import { CONTACT_DESCRIPTOR } from './descriptor';
import FormContact from './layouts/FormContact';
import InfoContact from './layouts/InfoContact';
import SplitContact from './layouts/SplitContact';

const LAYOUTS = {
  form: FormContact,
  info: InfoContact,
  split: SplitContact
};

const ContactSection = ({ layout = 'form', content = {}, vibe, theme }) => {
  const defaults = CONTACT_DEFAULTS[layout] || CONTACT_DEFAULTS.form;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.form;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

ContactSection.descriptor = CONTACT_DESCRIPTOR;
export default ContactSection;
