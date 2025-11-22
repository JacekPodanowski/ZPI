import apiClient from './apiClient';

/**
 * Pexels Image Search Service
 * Handles communication with backend Pexels API integration
 */

const pexelsService = {
  /**
   * Search for images on Pexels
   * @param {number} siteId - The site ID
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {string} params.mode - 'focused' (10 images) or 'bulk' (80 images)
   * @param {number} params.page - Page number (default 1)
   * @param {string} params.orientation - 'landscape', 'portrait', 'square', or 'all'
   * @param {string} params.color - Color filter (optional)
   * @returns {Promise<Object>} Search results with images and quota info
   */
  searchImages: async (siteId, { query, mode = 'bulk', page = 1, orientation = 'all', color = '' }) => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('mode', mode);
      params.append('page', page.toString());
      
      if (orientation && orientation !== 'all') {
        params.append('orientation', orientation);
      }
      
      if (color) {
        params.append('color', color);
      }

      const response = await apiClient.get(`/api/v1/sites/${siteId}/images/search/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching images:', error);
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        throw new Error('Osiągnąłeś dzienny limit wyszukiwań (50). Spróbuj jutro.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Strona nie została znaleziona lub brak dostępu.');
      }
      
      throw new Error('Nie udało się wyszukać obrazków. Spróbuj ponownie.');
    }
  },

  /**
   * Get user's current quota status
   * @param {number} siteId - The site ID
   * @returns {Promise<Object>} Quota information
   */
  getQuota: async (siteId) => {
    try {
      const response = await apiClient.get(`/api/v1/sites/${siteId}/images/quota/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quota:', error);
      return {
        used: 0,
        limit: 50,
        remaining: 50
      };
    }
  }
};

export default pexelsService;
