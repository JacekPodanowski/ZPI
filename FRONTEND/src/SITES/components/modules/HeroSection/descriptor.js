// descriptor.js - Use shortened keys to reduce tokens
export const HERO_DESCRIPTOR = {
  type: 'hero',
  desc: 'Eye-catching intro section',
  fields: {
    heading: { t: 'text', req: true, d: 'Main headline' },
    subheading: { t: 'text', d: 'Supporting text' },
    ctaText: { t: 'text', d: 'Button text' },
    ctaLink: { t: 'text', d: 'Button URL' },
    image: { t: 'image', d: 'Featured image' },
    imagePosition: { t: 'enum', vals: ['left', 'right'], d: 'Image side' },
    backgroundImage: { t: 'image', d: 'Background image' },
    overlay: { t: 'boolean', d: 'Dark overlay' }
  },
  layouts: ['centered', 'split', 'fullscreen']
};
