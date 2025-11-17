import apiClient from './apiClient';

/**
 * Event management service for the calendar
 */

// Events API
export const fetchEvents = async () => {
    try {
        const response = await apiClient.get('/events/');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const fetchEventsBySite = async (siteId) => {
    try {
        const response = await apiClient.get(`/events/?site=${siteId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching events by site:', error);
        throw error;
    }
};

export const createEvent = async (eventData) => {
    try {
        // Convert the form data to the expected API format
        const meetingType = eventData.meetingType || 'individual';
        const capacity = meetingType === 'group' ? (eventData.capacity || 1) : 1;
        
        const apiEventData = {
            title: eventData.title,
            description: eventData.description || '',
            start_time: `${eventData.date}T${eventData.startTime}:00`,
            end_time: `${eventData.date}T${eventData.endTime}:00`,
            capacity: capacity,
            event_type: meetingType,
            site: eventData.site_id,
        };

        if (eventData.assigned_to_owner) {
            apiEventData.assigned_to_owner = eventData.assigned_to_owner;
        }

        if (eventData.assigned_to_team_member) {
            apiEventData.assigned_to_team_member = eventData.assigned_to_team_member;
        }
        
        console.log('Sending event data to API:', apiEventData);
        const response = await apiClient.post('/events/', apiEventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
};

export const updateEvent = async (eventId, eventData) => {
    try {
        const response = await apiClient.patch(`/events/${eventId}/`, eventData);
        return response.data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

export const deleteEvent = async (eventId) => {
    try {
        await apiClient.delete(`/events/${eventId}/`);
        return true;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

// Availability Blocks API (these might need to be created in the backend)
export const fetchAvailabilityBlocks = async () => {
    try {
        // Assuming we need to create an availability endpoint
        const response = await apiClient.get('/availability-blocks/');
        return response.data;
    } catch (error) {
        console.error('Error fetching availability blocks:', error);
        // For now, return empty array if endpoint doesn't exist
        return [];
    }
};

export const createAvailabilityBlock = async (availabilityData) => {
    try {
        const apiAvailabilityData = {
            title: availabilityData.title || 'Dostępny',
            date: availabilityData.date,
            start_time: availabilityData.startTime,
            end_time: availabilityData.endTime,
            meeting_length: availabilityData.meeting_length || parseInt(availabilityData.meetingDuration) || 60,
            time_snapping: availabilityData.time_snapping || parseInt(availabilityData.timeSnapping) || 30,
            buffer_time: availabilityData.buffer_time || parseInt(availabilityData.bufferTime) || 0,
            site: availabilityData.site_id,
        };
        
        const response = await apiClient.post('/availability-blocks/', apiAvailabilityData);
        return response.data;
    } catch (error) {
        console.error('Error creating availability block:', error);
        throw error;
    }
};

// Bookings API
export const fetchBookings = async (siteId = null) => {
    try {
        const url = siteId ? `/bookings/?site=${siteId}` : '/bookings/';
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const cancelBooking = async (bookingId, reason = '') => {
    try {
        const response = await apiClient.post(`/bookings/${bookingId}/cancel/`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};

export const contactClient = async (bookingId, subject, message) => {
    try {
        const response = await apiClient.post(`/bookings/${bookingId}/contact/`, {
            subject,
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error contacting client:', error);
        throw error;
    }
};

export const updateAvailabilityBlock = async (blockId, availabilityData) => {
    try {
        const response = await apiClient.patch(`/availability-blocks/${blockId}/`, availabilityData);
        return response.data;
    } catch (error) {
        console.error('Error updating availability block:', error);
        throw error;
    }
};

export const deleteAvailabilityBlock = async (blockId) => {
    try {
        await apiClient.delete(`/availability-blocks/${blockId}/`);
        return true;
    } catch (error) {
        console.error('Error deleting availability block:', error);
        throw error;
    }
};