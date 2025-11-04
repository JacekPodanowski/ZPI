/**
 * Initial context sent to AI at conversation start (~50 tokens)
 * Provides high-level system understanding
 */
export const SYSTEM_CONTEXT = {
  system: 'Module-based site builder with vibes (styling) and themes (colors)',
  
  modules: [
    { type: 'hero', desc: 'Eye-catching intro', layouts: ['centered', 'split', 'fullscreen'] },
    { type: 'about', desc: 'Tell story', layouts: ['timeline', 'grid', 'narrative'] },
    { type: 'services', desc: 'Showcase offerings', layouts: ['cards', 'list', 'accordion'] },
    { type: 'calendar', desc: 'Booking interface', layouts: ['compact', 'detailed', 'list'] },
    { type: 'contact', desc: 'Get in touch', layouts: ['form', 'info', 'split'] },
    { type: 'navigation', desc: 'Site nav', layouts: ['horizontal', 'centered', 'minimal'], siteLevel: true }
  ],
  
  vibes: ['vibe1', 'vibe2', 'vibe3', 'vibe4', 'vibe5'],
  
  themes: ['modernWellness', 'sereneForest', 'oceanCalm', 'sunsetWarmth', 'lavenderDream', 
           'mintBreeze', 'coralSunset', 'slate', 'goldenHour', 'roseGarden'],
  
  rules: [
    'Empty content field = use default',
    'Request full descriptor only when needed',
    'Return only changed fields in output',
    'Keep responses under 75 words'
  ]
};

// Helper to get initial context for AI
export const getInitialContext = () => SYSTEM_CONTEXT;
