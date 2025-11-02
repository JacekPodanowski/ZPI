// Module type definitions with icons and colors
import { 
  ViewColumn, 
  Article, 
  Image, 
  CalendarMonth,
  ContactMail,
  Info,
  VideoLibrary,
  GridView,
  RateReview,
  AttachMoney,
  Help,
  Group
} from '@mui/icons-material';

export const MODULE_DEFINITIONS = {
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: ViewColumn,
    color: '#FF6B6B',
    description: 'Primary introduction section'
  },
  about: {
    type: 'about',
    label: 'About',
    icon: Info,
    color: '#4ECDC4',
    description: 'Story and credibility section'
  },
  services: {
    type: 'services',
    label: 'Services',
    icon: GridView,
    color: '#45B7D1',
    description: 'Display your offerings'
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    icon: Image,
    color: '#FFA07A',
    description: 'Visual showcase'
  },
  calendar: {
    type: 'calendar',
    label: 'Calendar',
    icon: CalendarMonth,
    color: '#98D8C8',
    description: 'Booking and availability'
  },
  contact: {
    type: 'contact',
    label: 'Contact',
    icon: ContactMail,
    color: '#FFD93D',
    description: 'Get in touch form'
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: Article,
    color: '#A8E6CF',
    description: 'Rich text content'
  },
  video: {
    type: 'video',
    label: 'Video',
    icon: VideoLibrary,
    color: '#C7CEEA',
    description: 'Embedded video player'
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    icon: RateReview,
    color: '#F8B195',
    description: 'Client reviews'
  },
  pricing: {
    type: 'pricing',
    label: 'Pricing',
    icon: AttachMoney,
    color: '#88D8B0',
    description: 'Pricing tables'
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    icon: Help,
    color: '#FFEAA7',
    description: 'Frequently asked questions'
  },
  team: {
    type: 'team',
    label: 'Team',
    icon: Group,
    color: '#DFE6E9',
    description: 'Team member profiles'
  }
};

// Get module definition by type
export const getModuleDefinition = (type) => {
  return MODULE_DEFINITIONS[type] || {
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: Article,
    color: '#B0B0B0',
    description: 'Custom module'
  };
};

// Get all available module types for toolbar
export const getAvailableModules = () => {
  return Object.values(MODULE_DEFINITIONS);
};

// Color mapping for backward compatibility
export const MODULE_COLORS = Object.keys(MODULE_DEFINITIONS).reduce((acc, key) => {
  acc[key] = MODULE_DEFINITIONS[key].color;
  return acc;
}, { default: '#B0B0B0' });

// Default content factory for each module type
export const getDefaultModuleContent = (moduleType) => {
  const defaults = {
    hero: {
      heading: 'Welcome to My Site',
      subheading: 'Your journey begins here',
      bgColor: 'rgb(228, 229, 218)',
      textColor: 'rgb(30, 30, 30)',
      cta: { text: 'Get Started', link: '#' }
    },
    about: {
      title: 'About Me',
      description: 'Tell your story here...',
      bgColor: 'white'
    },
    services: {
      title: 'Our Services',
      subtitle: 'What we offer',
      services: [
        { name: 'Service 1', description: 'Description here', price: '100' },
        { name: 'Service 2', description: 'Description here', price: '150' },
        { name: 'Service 3', description: 'Description here', price: '200' }
      ],
      currency: 'PLN',
      bgColor: 'white'
    },
    gallery: {
      title: 'Gallery',
      images: [],
      columns: 3,
      gap: 16,
      style: 'grid',
      bgColor: 'rgb(228, 229, 218)'
    },
    calendar: {
      title: 'Book an Appointment',
      color: 'rgb(146, 0, 32)',
      allowIndividual: true,
      allowGroup: true,
      bgColor: 'white',
      events: []
    },
    contact: {
      title: 'Get in Touch',
      email: 'contact@example.com',
      phone: '',
      bgColor: 'rgb(228, 229, 218)'
    },
    text: {
      heading: '',
      text: 'Add your text content here...',
      bgColor: 'white'
    },
    video: {
      title: '',
      videoUrl: '',
      bgColor: 'rgb(12, 12, 12)'
    },
    testimonials: {
      title: 'What People Say',
      testimonials: [],
      bgColor: 'white'
    },
    pricing: {
      title: 'Pricing Plans',
      plans: [],
      currency: 'PLN',
      bgColor: 'white'
    },
    faq: {
      title: 'Frequently Asked Questions',
      questions: [],
      bgColor: 'white'
    },
    team: {
      title: 'Our Team',
      members: [],
      bgColor: 'white'
    }
  };

  return defaults[moduleType] || {};
};
