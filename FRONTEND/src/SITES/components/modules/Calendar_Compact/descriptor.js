// descriptor.js
export const CALENDAR_DESCRIPTOR = {
  type: 'calendar',
  desc: 'Interactive booking calendar with availability display',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    subtitle: { t: 'text', d: 'Section subtitle/description', category: 'content' },
    bgColor: { t: 'color', d: 'Background color', category: 'content' },
    textColor: { t: 'color', d: 'Text color', category: 'content' },
    calendarAccentColor: { t: 'color', d: 'Calendar accent color', category: 'content' },
    showCapacity: { t: 'boolean', d: 'Show available/total capacity', category: 'content', default: true }
  },
  layouts: ['sidebar', 'inline', 'compact']
};
