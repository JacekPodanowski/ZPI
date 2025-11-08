// defaults.js
export const CALENDAR_DEFAULTS = {
  compact: {
    title: "Book a Session",
    description: "Choose a time that works for you",
    showAvailability: true,
    allowGroupBookings: false,
    bookingUrl: "/calendar"
  },
  detailed: {
    title: "Schedule Your Session",
    description: "Select from available individual or group sessions. We offer flexible scheduling to accommodate your needs.",
    showAvailability: true,
    allowGroupBookings: true,
    bookingUrl: "/calendar"
  },
  list: {
    title: "Upcoming Sessions",
    description: "View and join our scheduled group sessions or book a private consultation",
    showAvailability: true,
    allowGroupBookings: true,
    bookingUrl: "/calendar"
  }
};
