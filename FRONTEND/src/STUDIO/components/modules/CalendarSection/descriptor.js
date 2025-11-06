// descriptor.js
export const CALENDAR_DESCRIPTOR = {
  type: 'calendar',
  desc: 'Booking interface section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title', category: 'content' },
    description: { t: 'text', d: 'Section description', category: 'content' },
    showAvailability: { t: 'boolean', d: 'Display available slots', category: 'advanced' },
    allowGroupBookings: { t: 'boolean', d: 'Allow group session bookings', category: 'advanced' },
    bookingUrl: { t: 'text', d: 'External booking system URL', category: 'advanced' }
  },
  layouts: ['compact', 'detailed', 'list']
};
