// descriptor.js
export const ABOUT_DESCRIPTOR = {
  type: 'about',
  desc: 'Tell story section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    subtitle: { t: 'text', d: 'Section subtitle', category: 'content' },
    description: { t: 'text', req: true, d: 'Main description text', category: 'content' },
    image: { t: 'image', d: 'Profile or feature image', category: 'appearance' },
    timeline: { t: 'array', d: 'Timeline milestones (year, title, description)', category: 'content' },
    keyHighlights: { t: 'array', d: 'Key highlights or achievements (icon, title, description)', category: 'content' },
    // Deprecated fields - kept for backward compatibility
    milestones: { t: 'array', d: 'Timeline milestones (year, title, desc) - DEPRECATED, use timeline', category: 'content', deprecated: true },
    highlights: { t: 'array', d: 'Key highlights - DEPRECATED, use keyHighlights', category: 'content', deprecated: true },
    bgColor: { t: 'color', d: 'Background color', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Background image', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Background overlay color', category: 'appearance' }
  },
  layouts: ['narrative', 'timeline', 'grid']
};
