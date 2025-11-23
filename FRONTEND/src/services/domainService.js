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

/**
 * Purchase a domain
 * @param {string} domainName - Full domain name (e.g., "mybusiness.com")
 * @param {number} siteId - ID of the site this domain is for
 * @returns {Promise<Object>} Purchase response with payment URL and order ID
 */
export const purchaseDomain = async (domainName, siteId) => {
    try {
        console.log('[domainService] Purchasing domain:', domainName, 'for site:', siteId);
        const response = await apiClient.post('/domains/purchase/', {
            domain_name: domainName,
            site_id: siteId
        });
        console.log('[domainService] Purchase response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to purchase domain:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to initiate domain purchase');
    }
};

/**
 * Confirm domain payment (called from success page)
 * @param {number} orderId - Domain order ID
 * @returns {Promise<Object>} Confirmation response
 */
export const confirmDomainPayment = async (orderId) => {
    try {
        console.log('[domainService] Confirming payment for order:', orderId);
        const response = await apiClient.post('/domains/confirm-payment/', {
            order_id: orderId
        });
        console.log('[domainService] Confirmation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to confirm payment:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to confirm domain payment');
    }
};

/**
 * Get domain orders for a site
 * @param {number} siteId - Site ID
 * @returns {Promise<Array>} Array of domain orders
 */
export const getDomainOrders = async (siteId) => {
    try {
        console.log('[domainService] Getting domain orders for site:', siteId);
        const params = siteId ? { site_id: siteId } : {};
        const response = await apiClient.get('/domains/orders/', { params });
        console.log('[domainService] Orders response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to get domain orders:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to get domain orders');
    }
};

/**
 * Check order status in OVH and update local database
 * @param {number} orderId - Domain order ID
 * @returns {Promise<Object>} Status check response
 */
export const checkOrderStatus = async (orderId) => {
    try {
        console.log('[domainService] Checking order status for:', orderId);
        const response = await apiClient.post('/domains/check-status/', {
            order_id: orderId
        });
        console.log('[domainService] Status check response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to check order status:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to check order status');
    }
};

/**
 * Get order history from OVH
 * @param {number} orderId - Domain order ID
 * @returns {Promise<Object>} Order history with timeline
 */
export const getOrderHistory = async (orderId) => {
    try {
        console.log('[domainService] Getting order history for:', orderId);
        const response = await apiClient.get(`/domains/orders/${orderId}/history/`);
        console.log('[domainService] Order history response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to get order history:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to get order history');
    }
};

/**
 * Retry DNS configuration for a domain order
 * @param {number} orderId - Domain order ID
 * @returns {Promise<Object>} Retry result
 */
export const retryDnsConfiguration = async (orderId) => {
    try {
        console.log('[domainService] Retrying DNS configuration for:', orderId);
        const response = await apiClient.post('/domains/retry-dns/', {
            order_id: orderId
        });
        console.log('[domainService] DNS retry response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to retry DNS configuration:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to retry DNS configuration');
    }
};

/**
 * Get Cloudflare nameservers
 * @returns {Promise<Object>} Nameservers and instructions
 */
export const getCloudflareNameservers = async () => {
    try {
        console.log('[domainService] Getting Cloudflare nameservers');
        const response = await apiClient.get('/domains/nameservers/');
        console.log('[domainService] Nameservers response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to get nameservers:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to get Cloudflare nameservers');
    }
};

/**
 * Track domain status via Cloudflare API
 * @param {string} domainName - Full domain name (e.g., "example.com")
 * @returns {Promise<Object>} Domain status information
 */
export const trackDomainStatus = async (domainName) => {
    try {
        console.log('[domainService] Tracking domain status for:', domainName);
        const response = await apiClient.post('/domains/track-status/', {
            domain_name: domainName
        });
        console.log('[domainService] Domain status response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to track domain status:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to track domain status');
    }
};

/**
 * Add a domain by creating Cloudflare zone
 * @param {string} domainName - Full domain name (e.g., "example.com")
 * @param {number} siteId - Site ID (optional)
 * @returns {Promise<Object>} Domain add response with nameservers
 */
export const addDomainWithCloudflare = async (domainName, siteId = null) => {
    try {
        console.log('[domainService] Adding domain with Cloudflare:', domainName);
        const payload = { domain_name: domainName };
        if (siteId) {
            payload.site_id = siteId;
        }
        
        const response = await apiClient.post('/domains/add/', payload);
        console.log('[domainService] Domain add response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[domainService] Failed to add domain:', error);
        console.error('[domainService] Error response:', error.response?.data);
        throw new Error(error.response?.data?.error || 'Failed to add domain');
    }
};
