import apiClient from './apiClient';

/**
 * Fetch all big events for the current user's sites
 */
export const fetchBigEvents = async () => {
    const response = await apiClient.get('/big-events/');
    return response.data;
};

/**
 * Fetch a single big event by ID
 */
export const fetchBigEvent = async (eventId) => {
    const response = await apiClient.get(`/big-events/${eventId}/`);
    return response.data;
};

/**
 * Create a new big event
 */
export const createBigEvent = async (eventData) => {
    const response = await apiClient.post('/big-events/', eventData);
    return response.data;
};

/**
 * Update an existing big event
 */
export const updateBigEvent = async (eventId, eventData) => {
    const response = await apiClient.patch(`/big-events/${eventId}/`, eventData);
    return response.data;
};

/**
 * Delete a big event
 */
export const deleteBigEvent = async (eventId) => {
    const response = await apiClient.delete(`/big-events/${eventId}/`);
    return response.data;
};

/**
 * Publish a big event (optionally send email notifications)
 */
export const publishBigEvent = async (eventId, sendEmail = false) => {
    const response = await apiClient.post(`/big-events/${eventId}/publish/`, {
        send_email: sendEmail
    });
    return response.data;
};

/**
 * Unpublish a big event
 */
export const unpublishBigEvent = async (eventId) => {
    const response = await apiClient.post(`/big-events/${eventId}/unpublish/`);
    return response.data;
};

/**
 * Fetch published big events for a public site identifier
 */
export const fetchPublicBigEvents = async (siteIdentifier) => {
    const response = await apiClient.get(`/public-sites/${siteIdentifier}/big-events/`);
    return response.data;
};
