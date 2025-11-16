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
  Group,
  Menu,
  RequestQuote
} from '@mui/icons-material';
import { PUBLIC_CALENDAR_BIG_DEFAULTS } from '../../../SITES/components/modules/Caldenar_Full/defaults';
import { HERO_DEFAULTS } from '../../../SITES/components/modules/Hero/defaults';
import { ABOUT_DEFAULTS } from '../../../SITES/components/modules/About/defaults';
import { BLOG_DEFAULTS } from '../../../SITES/components/modules/Blog/defaults';
import { BUTTON_DEFAULTS } from '../../../SITES/components/modules/Button/defaults';
import { CONTACT_DEFAULTS } from '../../../SITES/components/modules/Contact/defaults';
import { EVENTS_DEFAULTS } from '../../../SITES/components/modules/Events/defaults';
import { FAQ_DEFAULTS } from '../../../SITES/components/modules/FAQ/defaults';
import { GALLERY_DEFAULTS } from '../../../SITES/components/modules/Gallery/defaults';
import { SERVICES_AND_PRICING_DEFAULTS, SERVICES_DEFAULTS, TEAM_DEFAULTS } from '../../../SITES/components/modules/_descriptors';
import { SPACER_DEFAULTS } from '../../../SITES/components/modules/Spacer/defaults';
import { TEXT_DEFAULTS } from '../../../SITES/components/modules/Text/defaults';
import { VIDEO_DEFAULTS } from '../../../SITES/components/modules/Video/defaults';

const slugify = (value = '') => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'page';
};

const MODULE_TYPE_ALIASES = {
  servicesandpricing: 'servicesAndPricing'
};

const normalizeModuleType = (type = '') => {
  const raw = (type || '').toString();
  if (!raw) {
    return '';
  }
  const alias = MODULE_TYPE_ALIASES[raw.toLowerCase()];
  return alias || raw;
};

export const MODULE_DEFINITIONS = {
  navigation: {
    type: 'navigation',
    label: 'Navigation',
    icon: Menu,
    color: '#333333',
    description: 'Add a navigation bar with logo and menu links. Essential for site structure and user navigation between pages.',
    category: 'structure',
    special: true, // Special module - not draggable, always at top
    defaultHeight: 60, // px - matches real Navigation component NAV_HEIGHT
    quickAddOrder: 0
  },
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: ViewColumn,
    color: '#FF6B6B',
    description: 'Create a powerful first impression with a hero section featuring headline, description, image, and call-to-action buttons.',
    category: 'content',
    defaultHeight: 700, // px - large hero section
    quickAddOrder: 1
  },
  about: {
    type: 'about',
    label: 'About',
    icon: Info,
    color: '#4ECDC4',
    description: 'Share your story and build credibility with an about section featuring your background, mission, and values.',
    category: 'content',
    defaultHeight: 600, // px - medium content section
    quickAddOrder: 2
  },
  services: {
    type: 'services',
    label: 'Services',
    icon: GridView,
    color: '#45B7D1',
    description: 'Showcase your services or offerings in a clean grid or list layout with descriptions and pricing.',
    category: 'content',
    defaultHeight: 800, // px - large section with cards
    quickAddOrder: 3
  },
  servicesAndPricing: {
    type: 'servicesAndPricing',
    label: 'Services + Pricing',
    icon: RequestQuote,
    color: '#A66DD4',
    description: 'Blend detailed service cards with transparent pricing tables and upsell callouts.',
    category: 'content',
    defaultHeight: 820,
    quickAddOrder: 4
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    icon: Image,
    color: '#FFA07A',
    description: 'Display your visual work in an elegant image gallery with multiple layout options including grid, masonry, and carousel.',
    category: 'media',
    defaultHeight: 900, // px - large gallery grid
    quickAddOrder: 5
  },
  calendar: {
    type: 'calendar',
    label: 'Calendar',
    icon: CalendarMonth,
    color: '#98D8C8',
    description: 'Enable appointment booking with an integrated calendar. Choose between compact view for quick booking or full calendar with detailed event information.',
    category: 'interactive',
    defaultHeight: 750, // px - calendar widget height (can change based on type)
    quickAddOrder: 6
  },
  contact: {
    type: 'contact',
    label: 'Contact',
    icon: ContactMail,
    color: '#FFD93D',
    description: 'Make it easy for visitors to reach you with a contact form including email, phone, and optional location information.',
    category: 'interactive',
    defaultHeight: 500, // px - contact form section
    quickAddOrder: 7
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: Article,
    color: '#A8E6CF',
    description: 'Add rich text content with flexible formatting. Perfect for articles, announcements, or any written content.',
    category: 'content',
    defaultHeight: 400, // px - flexible text section
    quickAddOrder: 8
  },
  video: {
    type: 'video',
    label: 'Video',
    icon: VideoLibrary,
    color: '#C7CEEA',
    description: 'Embed videos from files, YouTube, or other platforms to showcase your work or share multimedia content.',
    category: 'media',
    defaultHeight: 600, // px - 16:9 video player
    quickAddOrder: 9
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    icon: RateReview,
    color: '#F8B195',
    description: 'Build trust by displaying client reviews and testimonials. Social proof that validates your expertise and service quality.',
    category: 'content',
    defaultHeight: 550, // px - testimonial cards
    quickAddOrder: 10
  },
  pricing: {
    type: 'pricing',
    label: 'Pricing (Legacy)',
    icon: AttachMoney,
    color: '#88D8B0',
    description: 'Legacy pricing tables kept for backward compatibility. Prefer the Services + Pricing module.',
    category: 'content',
    defaultHeight: 700,
    deprecated: true,
    hidden: true,
    quickAddOrder: 98
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    icon: Help,
    color: '#FFEAA7',
    description: 'Answer common questions in an organized accordion format. Helps reduce support inquiries and inform visitors.',
    category: 'content',
    defaultHeight: 650, // px - accordion section
    quickAddOrder: 11
  },
  team: {
    type: 'team',
    label: 'Team',
    icon: Group,
    color: '#DFE6E9',
    description: 'Introduce your team members with photos, names, roles, and short bios. Perfect for building personal connections.',
    category: 'content',
    defaultHeight: 700, // px - team member cards
    quickAddOrder: 12
  }
};

// Get module definition by type
export const getModuleDefinition = (type) => {
  const resolvedType = normalizeModuleType(type);
  return MODULE_DEFINITIONS[resolvedType] || {
    type: resolvedType,
    label: resolvedType
      ? resolvedType.charAt(0).toUpperCase() + resolvedType.slice(1)
      : 'Custom Module',
    icon: Article,
    color: '#B0B0B0',
    description: 'Custom module for specialized content and functionality.',
    defaultHeight: 600 // Default fallback for unknown modules
  };
};

// Get all available module types for toolbar (excludes special modules)
export const getAvailableModules = () => {
  return Object.values(MODULE_DEFINITIONS)
    .filter((module) => !module.special && !module.hidden)
    .sort((a, b) => (a.quickAddOrder ?? 999) - (b.quickAddOrder ?? 999));
};

// Color mapping for backward compatibility
export const MODULE_COLORS = Object.keys(MODULE_DEFINITIONS).reduce((acc, key) => {
  acc[key] = MODULE_DEFINITIONS[key].color;
  return acc;
}, { default: '#B0B0B0' });

// Default content factory for each module type
export const getDefaultModuleContent = (moduleType) => {
  const resolvedType = normalizeModuleType(moduleType);
  // Helper to pick random variant from defaults array
  const pickRandom = (defaults, layoutKey = null) => {
    if (!defaults) return {};
    
    if (layoutKey && defaults[layoutKey]) {
      const variants = defaults[layoutKey];
      if (Array.isArray(variants) && variants.length > 0) {
        return variants[Math.floor(Math.random() * variants.length)];
      }
      return variants;
    }
    
    // If defaults is an object with layout keys, pick first layout's random variant
    const firstLayoutKey = Object.keys(defaults)[0];
    if (firstLayoutKey) {
      const variants = defaults[firstLayoutKey];
      if (Array.isArray(variants) && variants.length > 0) {
        return variants[Math.floor(Math.random() * variants.length)];
      }
    }
    
    return {};
  };

  const defaults = {
    navigation: {
      logo: {
        text: 'Logo',
        type: 'text'
      },
      links: [
        { label: 'Home', route: '/' },
        { label: 'About', route: '/about' },
        { label: 'Contact', route: '/contact' }
      ],
      bgColor: '#ffffff',
      textColor: 'rgb(30, 30, 30)'
    },
    hero: pickRandom(HERO_DEFAULTS, 'centered'),
    about: pickRandom(ABOUT_DEFAULTS, 'imageRight'),
    services: pickRandom(SERVICES_DEFAULTS, 'cards'),
    servicesAndPricing: pickRandom(SERVICES_AND_PRICING_DEFAULTS, 'cards'),
    team: pickRandom(TEAM_DEFAULTS, 'grid'),
    gallery: pickRandom(GALLERY_DEFAULTS, 'grid'),
    blog: pickRandom(BLOG_DEFAULTS, 'grid'),
    events: pickRandom(EVENTS_DEFAULTS, 'list'),
    faq: pickRandom(FAQ_DEFAULTS, 'accordion'),
    contact: pickRandom(CONTACT_DEFAULTS, 'centered'),
    text: pickRandom(TEXT_DEFAULTS, 'basic'),
    button: pickRandom(BUTTON_DEFAULTS, 'primary'),
    video: pickRandom(VIDEO_DEFAULTS, 'embedded'),
    spacer: pickRandom(SPACER_DEFAULTS, 'medium'),
    publicCalendarBig: pickRandom(PUBLIC_CALENDAR_BIG_DEFAULTS, 'full'),
    publicCalendarSmall: {
      title: 'Book an Appointment',
      color: 'rgb(146, 0, 32)',
      allowIndividual: true,
      allowGroup: true,
      bgColor: 'white',
      events: []
    },
    calendar: {
      type: 'compact',
      title: 'Book an Appointment',
      color: 'rgb(146, 0, 32)',
      allowIndividual: true,
      allowGroup: true,
      bgColor: 'white',
      events: []
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
    }
  };

  return defaults[resolvedType] || {};
};

export const buildNavigationContent = (site, overrides = {}, entryPointPageId = null, activePageId = null) => {
  const pages = site?.pages || [];
  const defaultContent = getDefaultModuleContent('navigation');
  const merged = {
    ...defaultContent,
    ...overrides
  };

  const links = pages.map((page, index) => {
    const label = page.name || `Page ${index + 1}`;
    const baseRoute = page.route && page.route.startsWith('/') ? page.route : `/${page.route || ''}`;
    const derivedRoute = page.id === entryPointPageId
      ? '/'
      : baseRoute === '/' || baseRoute === ''
        ? `/${slugify(label)}`
        : baseRoute;

    return {
      label,
      href: derivedRoute,
      pageId: page.id
    };
  });

  return {
    ...merged,
    links,
    activePageId: activePageId || null
  };
};
