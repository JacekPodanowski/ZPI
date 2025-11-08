// descriptor.js
export const ABOUT_DESCRIPTOR = {
  type: 'about',
  desc: 'Tell story section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    description: { t: 'text', req: true, d: 'Main description text', category: 'content' },
    image: { t: 'image', d: 'Profile or feature image', category: 'appearance' },
    milestones: { t: 'array', d: 'Timeline milestones (year, title, desc)', category: 'content' },
    highlights: { t: 'array', d: 'Key highlights or achievements', category: 'content' },
    bgColor: { t: 'color', d: 'Background color', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Background image', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Background overlay color', category: 'appearance' }
  },
  layouts: ['timeline', 'grid', 'narrative']
};
