// descriptor.js - Use shortened keys to reduce tokens
export const HERO_DESCRIPTOR = {
  type: 'hero',
  desc: 'Eye-catching intro section',
  fields: {
    heading: { t: 'text', req: true, d: 'Main headline', category: 'content' },
    subheading: { t: 'text', d: 'Supporting text', category: 'content' },
    ctaText: { t: 'text', d: 'Button text', category: 'content' },
    ctaLink: { t: 'text', d: 'Button URL', category: 'content' },
    image: { t: 'image', d: 'Featured image', category: 'appearance' },
    imagePosition: { t: 'enum', vals: ['left', 'right'], d: 'Image side', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Background image', category: 'appearance' },
    overlay: { t: 'boolean', d: 'Dark overlay', category: 'advanced' }
  },
  layouts: ['centered', 'split', 'fullscreen']
};
