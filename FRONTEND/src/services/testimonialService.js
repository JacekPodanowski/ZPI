import apiClient from './apiClient';

/**
 * Service for managing testimonials
 */

/**
 * Fetch testimonials for a site with optional filters
 * @param {number} siteId - Site ID
 * @param {object} options - Filter options (sort, rating, limit, offset)
 * @returns {Promise<Array>} Array of testimonials
 */
export const fetchTestimonials = async (siteId, options = {}) => {
    const { sort = '-created_at', rating, limit, offset } = options;
    
    const params = {
        site_id: siteId,
        sort,
    };
    
    if (rating) params.rating = rating;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await apiClient.get('/testimonials/', { params });
    return response.data;
};

/**
 * Create a new testimonial
 * @param {object} testimonialData - Testimonial data
 * @returns {Promise<object>} Created testimonial
 */
export const createTestimonial = async (testimonialData) => {
    const response = await apiClient.post('/testimonials/', testimonialData);
    return response.data;
};

/**
 * Delete a testimonial (admin/manager only)
 * @param {number} testimonialId - Testimonial ID
 * @returns {Promise<void>}
 */
export const deleteTestimonial = async (testimonialId) => {
    await apiClient.delete(`/testimonials/${testimonialId}/`);
};

/**
 * Get AI-generated summary for site testimonials
 * @param {number} siteId - Site ID
 * @returns {Promise<object>} Summary data
 */
export const getTestimonialSummary = async (siteId) => {
    const response = await apiClient.get('/testimonials/summary/', {
        params: { site_id: siteId }
    });
    return response.data;
};

/**
 * Get testimonial statistics for admin panel
 * @param {number} siteId - Site ID
 * @returns {Promise<object>} Statistics data
 */
export const getTestimonialStats = async (siteId) => {
    const response = await apiClient.get('/testimonials/stats/', {
        params: { site_id: siteId }
    });
    return response.data;
};
