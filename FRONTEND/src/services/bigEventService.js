import apiClient from './apiClient';

/**
 * Fetch all big events for the current user's sites
 */
export const fetchBigEvents = async () => {
    const response = await apiClient.get('/api/v1/big-events/');
    return response.data;
};

/**
 * Fetch a single big event by ID
 */
export const fetchBigEvent = async (eventId) => {
    const response = await apiClient.get(`/api/v1/big-events/${eventId}/`);
    return response.data;
};

/**
 * Create a new big event
 */
export const createBigEvent = async (eventData) => {
    const response = await apiClient.post('/api/v1/big-events/', eventData);
    return response.data;
};

/**
 * Update an existing big event
 */
export const updateBigEvent = async (eventId, eventData) => {
    const response = await apiClient.patch(`/api/v1/big-events/${eventId}/`, eventData);
    return response.data;
};

/**
 * Delete a big event
 */
export const deleteBigEvent = async (eventId) => {
    const response = await apiClient.delete(`/api/v1/big-events/${eventId}/`);
    return response.data;
};

/**
 * Publish a big event (optionally send email notifications)
 */
export const publishBigEvent = async (eventId, sendEmail = false) => {
    const response = await apiClient.post(`/api/v1/big-events/${eventId}/publish/`, {
        send_email: sendEmail
    });
    return response.data;
};

/**
 * Unpublish a big event
 */
export const unpublishBigEvent = async (eventId) => {
    const response = await apiClient.post(`/api/v1/big-events/${eventId}/unpublish/`);
    return response.data;
};
