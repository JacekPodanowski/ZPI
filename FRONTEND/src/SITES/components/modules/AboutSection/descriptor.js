// descriptor.js
export const ABOUT_DESCRIPTOR = {
  type: 'about',
  desc: 'Tell story section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title' },
    description: { t: 'text', req: true, d: 'Main description text' },
    image: { t: 'image', d: 'Profile or feature image' },
    milestones: { t: 'array', d: 'Timeline milestones (year, title, desc)' },
    highlights: { t: 'array', d: 'Key highlights or achievements' }
  },
  layouts: ['timeline', 'grid', 'narrative']
};
