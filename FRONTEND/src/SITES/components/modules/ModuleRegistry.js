// ModuleRegistry.js - Central registration of all modules
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import CalendarSection from './CalendarSection';
import ContactSection from './ContactSection';
import Navigation from './Navigation';

export const MODULE_REGISTRY = {
  hero: {
    component: HeroSection,
    descriptor: HeroSection.descriptor,
    layouts: ['centered', 'split', 'fullscreen'],
    defaultLayout: 'centered',
    category: 'content'
  },
  about: {
    component: AboutSection,
    descriptor: AboutSection.descriptor,
    layouts: ['timeline', 'grid', 'narrative'],
    defaultLayout: 'grid',
    category: 'content'
  },
  services: {
    component: ServicesSection,
    descriptor: ServicesSection.descriptor,
    layouts: ['cards', 'list', 'accordion'],
    defaultLayout: 'cards',
    category: 'content'
  },
  calendar: {
    component: CalendarSection,
    descriptor: CalendarSection.descriptor,
    layouts: ['compact', 'detailed', 'list'],
    defaultLayout: 'compact',
    category: 'interactive'
  },
  contact: {
    component: ContactSection,
    descriptor: ContactSection.descriptor,
    layouts: ['form', 'info', 'split'],
    defaultLayout: 'form',
    category: 'content'
  },
  navigation: {
    component: Navigation,
    descriptor: Navigation.descriptor,
    layouts: ['horizontal', 'centered', 'minimal'],
    defaultLayout: 'horizontal',
    category: 'structure',
    siteLevel: true
  }
};

export default MODULE_REGISTRY;
