// descriptor.js
export const CONTACT_DESCRIPTOR = {
  type: 'contact',
  desc: 'Get in touch section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    description: { t: 'text', d: 'Section description', category: 'content' },
    email: { t: 'text', d: 'Contact email address', category: 'content' },
    phone: { t: 'text', d: 'Contact phone number', category: 'content' },
    address: { t: 'text', d: 'Physical address', category: 'content' },
    showForm: { t: 'boolean', d: 'Display contact form', category: 'advanced' },
    formFields: { t: 'array', d: 'Custom form fields', category: 'advanced' },
    bgColor: { t: 'color', d: 'Background color', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Background image', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Background overlay color', category: 'appearance' }
  },
  layouts: ['form', 'info', 'split']
};
