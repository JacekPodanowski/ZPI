// descriptor.js
export const NAVIGATION_DESCRIPTOR = {
  type: 'navigation',
  desc: 'Site navigation',
  fields: {
    logo: { t: 'object', d: 'Logo image and text (src, alt, text)' },
    links: { t: 'array', req: true, d: 'Navigation links (label, href)' },
    bgColor: { t: 'text', d: 'Background color override' },
    textColor: { t: 'text', d: 'Text color override' },
    sticky: { t: 'boolean', d: 'Sticky navigation on scroll' }
  },
  layouts: ['horizontal', 'centered', 'minimal'],
  siteLevel: true
};
