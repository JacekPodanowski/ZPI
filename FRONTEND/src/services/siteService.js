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

export const fetchSiteCalendarData = async (siteId, startDate = null, endDate = null) => {
    let url = `/sites/${siteId}/calendar-data/`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
};

export const addTeamMember = async (memberData) => {
    const response = await apiClient.post('/team-members/', memberData);
    return response.data;
};

export const updateTeamMember = async (memberId, memberData) => {
    const response = await apiClient.patch(`/team-members/${memberId}/`, memberData);
    return response.data;
};

export const deleteTeamMember = async (memberId) => {
    const response = await apiClient.delete(`/team-members/${memberId}/`);
    return response.data;
};

export const sendTeamInvitation = async (memberId) => {
    const response = await apiClient.post(`/team-members/${memberId}/send-invitation/`);
    return response.data;
};

export const fetchTeamMembers = async (siteId) => {
    const response = await apiClient.get(`/team-members/?site=${siteId}`);
    return response.data;
};

export const fetchPendingInvitations = async () => {
    const response = await apiClient.get('/team-members/pending-invitations/');
    return response.data;
};

export const fetchAttendanceReport = async (siteId, { hostType, hostId, limit } = {}) => {
    const params = new URLSearchParams();
    if (hostType) params.append('host_type', hostType);
    if (hostId) params.append('host_id', hostId);
    if (limit) params.append('limit', limit);

    let url = `/sites/${siteId}/attendance-report/`;
    const query = params.toString();
    if (query) {
        url = `${url}?${query}`;
    }

    const response = await apiClient.get(url);
    return response.data;
};

export const publishSite = async (siteId) => {
    const response = await apiClient.post(`/sites/${siteId}/publish/`);
    return response.data;
};
