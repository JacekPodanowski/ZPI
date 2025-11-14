import apiClient from './apiClient';

export const fetchSites = async () => {
    const response = await apiClient.get('/sites/');
    return response.data;
};

export const fetchSiteById = async (siteId) => {
    const response = await apiClient.get(`/sites/${siteId}/`);
    return response.data;
};

export const updateSiteTemplate = async (siteId, templateConfig, name) => {
    const payload = {
        template_config: templateConfig
    };

    if (name) {
        payload.name = name;
    }

    const response = await apiClient.patch(`/sites/${siteId}/`, payload);
    return response.data;
};

export const renameSite = async (siteId, name) => {
    const response = await apiClient.patch(`/sites/${siteId}/`, { name });
    return response.data;
};

export const createSite = async (payload) => {
    const response = await apiClient.post('/sites/', payload);
    return response.data;
};

export const deleteSite = async (siteId) => {
    const response = await apiClient.delete(`/sites/${siteId}/`);
    return response.data;
};

export const updateSiteColor = async (siteId, colorIndex) => {
    const response = await apiClient.patch(`/sites/${siteId}/update_color/`, {
        color_index: colorIndex
    });
    return response.data;
};

export const updateSite = async (siteId, payload) => {
    const response = await apiClient.patch(`/sites/${siteId}/`, payload);
    return response.data;
};

export const acceptTeamInvitation = async (teamMemberId) => {
    const response = await apiClient.post(`/team-members/${teamMemberId}/accept/`);
    return response.data;
};

export const rejectTeamInvitation = async (teamMemberId) => {
    const response = await apiClient.post(`/team-members/${teamMemberId}/reject/`);
    return response.data;
};

export const createSiteVersion = async (siteId, payload) => {
    const response = await apiClient.post(`/sites/${siteId}/versions/`, payload);
    return response.data;
};

export const fetchSiteVersions = async (siteId) => {
    const response = await apiClient.get(`/sites/${siteId}/versions/`);
    return response.data;
};

export const fetchSiteCalendarRoster = async (siteId) => {
    const response = await apiClient.get(`/sites/${siteId}/calendar-roster/`);
    return response.data;
};
