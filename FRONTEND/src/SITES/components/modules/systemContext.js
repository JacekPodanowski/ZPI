/**
 * Initial context sent to AI at conversation start (~50 tokens)
 * Provides high-level system understanding
 */
export const SYSTEM_CONTEXT = {
  system: 'Module-based site builder with unified style system',
  
  modules: [
    { type: 'hero', desc: 'Eye-catching intro', layouts: ['centered', 'split', 'fullscreen'] },
    { type: 'about', desc: 'Tell story', layouts: ['timeline', 'grid', 'narrative'] },
    { type: 'services', desc: 'Showcase offerings', layouts: ['cards', 'list', 'accordion'] },
    { type: 'calendar', desc: 'Booking interface', layouts: ['compact', 'detailed', 'list'] },
    { type: 'contact', desc: 'Get in touch', layouts: ['form', 'info', 'split'] },
    { type: 'navigation', desc: 'Site nav', layouts: ['horizontal', 'centered', 'minimal'], siteLevel: true }
  ],
  
  styles: ['auroraMinimal', 'nocturneBold', 'solsticePastel', 'verdantOrganic', 'lumenEditorial'],
  
  rules: [
    'Empty content field = use default',
    'Request full descriptor only when needed',
    'Return only changed fields in output',
    'Keep responses under 75 words'
  ]
};

// Helper to get initial context for AI
export const getInitialContext = () => SYSTEM_CONTEXT;
