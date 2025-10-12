import apiClient from './apiClient';

export const fetchSites = async () => {
    const response = await apiClient.get('/sites/');
    return response.data;
};

export const fetchSiteById = async (siteId) => {
    const response = await apiClient.get(`/sites/${siteId}/`);
    return response.data;
};

export const updateSiteTemplate = async (siteId, templateConfig) => {
    const response = await apiClient.patch(`/sites/${siteId}/`, {
        template_config: templateConfig
    });
    return response.data;
};

export const createSite = async (payload) => {
    const response = await apiClient.post('/sites/', payload);
    return response.data;
};
