// descriptor.js
export const CALENDAR_DESCRIPTOR = {
  type: 'calendar',
  desc: 'Booking interface section',
  fields: {
    title: { t: 'text', req: true, d: 'Section title' },
    description: { t: 'text', d: 'Section description' },
    showAvailability: { t: 'boolean', d: 'Display available slots' },
    allowGroupBookings: { t: 'boolean', d: 'Allow group session bookings' },
    bookingUrl: { t: 'text', d: 'External booking system URL' }
  },
  layouts: ['compact', 'detailed', 'list']
};
