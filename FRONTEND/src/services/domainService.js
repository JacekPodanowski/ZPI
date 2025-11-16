import apiClient from './apiClient';

/**
 * Check domain availability for multiple TLDs
 * @param {string} domain - Domain name without TLD (e.g., "mybusiness")
 * @returns {Promise<Array>} Array of domain objects with availability and pricing
 */
export const checkDomainAvailability = async (domain) => {
    try {
        console.log('[domainService] Checking availability for:', domain);
        const response = await apiClient.get(`/domains/check-availability/`, {
            params: { domain }
        });
        console.log('[domainService] API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to check domain availability:', error);
        console.error('[domainService] Error response:', error.response?.data);
        console.error('[domainService] Error status:', error.response?.status);
        throw new Error(error.response?.data?.error || 'Failed to check domain availability');
    }
};

/**
 * Get domain pricing information
 * @param {string} tld - Top-level domain (e.g., "com", "pl", "io")
 * @returns {Promise<Object>} Pricing information
 */
export const getDomainPricing = async (tld) => {
    try {
        const response = await apiClient.get(`/domains/pricing/`, {
            params: { tld }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get domain pricing:', error);
        throw new Error(error.response?.data?.error || 'Failed to get domain pricing');
    }
};
