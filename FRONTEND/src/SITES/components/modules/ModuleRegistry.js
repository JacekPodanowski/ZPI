// ModuleRegistry.js - Central registration of all modules
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import CalendarSection from './CalendarSection';
import ContactSection from './ContactSection';
import Navigation from './Navigation';

// New modular imports
import TextModule from './TextModule';
import ButtonModule from './ButtonModule';
import SpacerModule from './SpacerModule';
import GalleryModule from './GalleryModule';
import VideoModule from './VideoModule';
import FAQModule from './FAQModule';
import BlogModule from './BlogModule';
import EventsModule from './EventsModule';
import ServicesAndPricingModule from './ServicesAndPricingModule';
import TeamModule from './TeamModule';
import ContainerModule from './ContainerModule';
import ReactComponentModule from './ReactComponentModule';

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
  },
  // Newly migrated modules
  text: {
    component: TextModule,
    descriptor: TextModule.descriptor,
    layouts: ['block', 'inline', 'centered'],
    defaultLayout: 'block',
    category: 'content'
  },
  button: {
    component: ButtonModule,
    descriptor: ButtonModule.descriptor,
    layouts: ['block', 'inline', 'fullWidth'],
    defaultLayout: 'block',
    category: 'content'
  },
  spacer: {
    component: SpacerModule,
    descriptor: SpacerModule.descriptor,
    layouts: ['small', 'medium', 'large'],
    defaultLayout: 'medium',
    category: 'layout'
  },
  gallery: {
    component: GalleryModule,
    descriptor: GalleryModule.descriptor,
    layouts: ['grid', 'masonry', 'slideshow', 'carousel', 'fade'],
    defaultLayout: 'grid',
    category: 'media'
  },
  video: {
    component: VideoModule,
    descriptor: VideoModule.descriptor,
    layouts: ['standard', 'fullWidth', 'compact'],
    defaultLayout: 'standard',
    category: 'media'
  },
  faq: {
    component: FAQModule,
    descriptor: FAQModule.descriptor,
    layouts: ['accordion', 'list', 'cards'],
    defaultLayout: 'accordion',
    category: 'content'
  },
  blog: {
    component: BlogModule,
    descriptor: BlogModule.descriptor,
    layouts: ['grid', 'list', 'masonry'],
    defaultLayout: 'grid',
    category: 'content'
  },
  events: {
    component: EventsModule,
    descriptor: EventsModule.descriptor,
    layouts: ['list', 'grid', 'timeline'],
    defaultLayout: 'list',
    category: 'content'
  },
  servicesAndPricing: {
    component: ServicesAndPricingModule,
    descriptor: ServicesAndPricingModule.descriptor,
    layouts: ['cards', 'list', 'table'],
    defaultLayout: 'cards',
    category: 'content'
  },
  // Alias for backward compatibility
  pricing: {
    component: ServicesAndPricingModule,
    descriptor: ServicesAndPricingModule.descriptor,
    layouts: ['cards', 'list', 'table'],
    defaultLayout: 'cards',
    category: 'content'
  },
  team: {
    component: TeamModule,
    descriptor: TeamModule.descriptor,
    layouts: ['grid', 'carousel', 'list'],
    defaultLayout: 'grid',
    category: 'content'
  },
  // Alias for backward compatibility
  testimonials: {
    component: TeamModule,
    descriptor: TeamModule.descriptor,
    layouts: ['grid', 'carousel', 'list'],
    defaultLayout: 'grid',
    category: 'content'
  },
  container: {
    component: ContainerModule,
    descriptor: ContainerModule.descriptor,
    layouts: ['flex', 'grid'],
    defaultLayout: 'flex',
    category: 'layout'
  },
  reactComponent: {
    component: ReactComponentModule,
    descriptor: ReactComponentModule.descriptor,
    layouts: ['default'],
    defaultLayout: 'default',
    category: 'advanced'
  }
};

export default MODULE_REGISTRY;
