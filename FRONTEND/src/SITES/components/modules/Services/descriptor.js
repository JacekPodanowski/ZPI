// descriptor.js
export const SERVICES_DESCRIPTOR = {
  type: 'services',
  desc: 'Showcase offerings section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    subtitle: { t: 'text', d: 'Section subtitle', category: 'content' },
    items: { 
      t: 'array', 
      req: true, 
      d: 'Service items (name, description, icon, image, details)', 
      category: 'content' 
    },
    bgColor: { t: 'color', d: 'Background color', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Background image', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Background overlay color', category: 'appearance' }
  },
  layouts: ['cards', 'list', 'accordion']
};
