// descriptor.js
export const NAVIGATION_DESCRIPTOR = {
  type: 'navigation',
  desc: 'Site navigation',
  fields: {
    logo: { t: 'object', d: 'Logo image and text (src, alt, text)', category: 'content' },
    links: { t: 'array', req: true, d: 'Navigation links (label, href)', category: 'content' },
    bgColor: { t: 'text', d: 'Background color override', category: 'appearance' },
    textColor: { t: 'text', d: 'Text color override', category: 'appearance' },
    sticky: { t: 'boolean', d: 'Sticky navigation on scroll', category: 'advanced' }
  },
  layouts: ['horizontal', 'centered', 'minimal', 'mobile'],
  siteLevel: true
};
