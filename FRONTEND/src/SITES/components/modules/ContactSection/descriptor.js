// descriptor.js
export const CONTACT_DESCRIPTOR = {
  type: 'contact',
  desc: 'Get in touch section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title' },
    description: { t: 'text', d: 'Section description' },
    email: { t: 'text', d: 'Contact email address' },
    phone: { t: 'text', d: 'Contact phone number' },
    address: { t: 'text', d: 'Physical address' },
    showForm: { t: 'boolean', d: 'Display contact form' },
    formFields: { t: 'array', d: 'Custom form fields' }
  },
  layouts: ['form', 'info', 'split']
};
