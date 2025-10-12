import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://192.168.0.102:8000'
const API_EVENTS = import.meta.env.VITE_API_EVENTS || `${API_BASE}/api/events`
const API_BOOKINGS = import.meta.env.VITE_API_BOOKINGS || `${API_BASE}/api/bookings`
const API_AVAILABILITY = import.meta.env.VITE_API_AVAILABILITY || `${API_BASE}/api/availability`

// Events
export const getEvents = async (params = {}) => {
  try {
    const response = await axios.get(API_EVENTS, { params })
    return response.data
  } catch (error) {
    console.error('Failed to fetch events:', error)
    throw error
  }
}

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(API_EVENTS, eventData)
    return response.data
  } catch (error) {
    console.error('Failed to create event:', error)
    throw error
  }
}

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(`${API_EVENTS}/${eventId}`, eventData)
    return response.data
  } catch (error) {
    console.error('Failed to update event:', error)
    throw error
  }
}

export const deleteEvent = async (eventId) => {
  try {
    const response = await axios.delete(`${API_EVENTS}/${eventId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete event:', error)
    throw error
  }
}

// Bookings
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(API_BOOKINGS, bookingData)
    return response.data
  } catch (error) {
    console.error('Failed to create booking:', error)
    throw error
  }
}

export const getBookings = async (params = {}) => {
  try {
    const response = await axios.get(API_BOOKINGS, { params })
    return response.data
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    throw error
  }
}

export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.delete(`${API_BOOKINGS}/${bookingId}`)
    return response.data
  } catch (error) {
    console.error('Failed to cancel booking:', error)
    throw error
  }
}

// Availability
export const getAvailability = async (params = {}) => {
  try {
    const response = await axios.get(API_AVAILABILITY, { params })
    return response.data
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    throw error
  }
}

export const setAvailability = async (availabilityData) => {
  try {
    const response = await axios.post(API_AVAILABILITY, availabilityData)
    return response.data
  } catch (error) {
    console.error('Failed to set availability:', error)
    throw error
  }
}

// Google Calendar Integration
export const syncGoogleCalendar = async () => {
  try {
    const response = await axios.post(`${API_BASE}/api/calendar/google/sync`)
    return response.data
  } catch (error) {
    console.error('Failed to sync Google Calendar:', error)
    throw error
  }
}

export const connectGoogleCalendar = async (authCode) => {
  try {
    const response = await axios.post(`${API_BASE}/api/calendar/google/connect`, { code: authCode })
    return response.data
  } catch (error) {
    console.error('Failed to connect Google Calendar:', error)
    throw error
  }
}
