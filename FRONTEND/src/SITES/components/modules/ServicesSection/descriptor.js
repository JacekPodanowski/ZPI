// descriptor.js
export const SERVICES_DESCRIPTOR = {
  type: 'services',
  desc: 'Showcase offerings section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title' },
    subtitle: { t: 'text', d: 'Section subtitle' },
    items: { 
      t: 'array', 
      req: true, 
      d: 'Service items (name, description, icon, image, details)' 
    }
  },
  layouts: ['cards', 'list', 'accordion']
};
