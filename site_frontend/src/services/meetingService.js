import apiClient from './apiClient';

export const getMeetings = (params = {}) => {
    return apiClient.get('/meetings/', { params });
};

export const createMeetingSession = (sessionData) => {
    return apiClient.post('/meetings/create-session/', sessionData);
};

export const cancelMeetingSession = (meetingIds) => {
    return apiClient.post('/meetings/cancel-session/', { meeting_ids: meetingIds });
};

export const confirmMeetingSession = (meetingIds) => {
    return apiClient.post('/meetings/confirm-session/', { meeting_ids: meetingIds });
};

export const deleteAllPastMeetings = () => {
    return apiClient.post('/meetings/delete_past_meetings/');
};