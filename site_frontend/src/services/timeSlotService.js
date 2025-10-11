import apiClient from './apiClient';

export const bulkCreateTimeSlots = (slotsArray) => {
    if (!slotsArray || slotsArray.length === 0) {
        return Promise.resolve({ data: [] });
    }
    return apiClient.post('/timeslots/bulk-create/', slotsArray);
};

export const bulkDeleteTimeSlots = (slotIdsArray) => {
    if (!slotIdsArray || slotIdsArray.length === 0) {
        return Promise.resolve();
    }
    return apiClient.post('/timeslots/bulk-delete/', { ids: slotIdsArray });
};

export const getDailySummaries = (dateAfter, dateBefore) => {
    const params = {
        date__gte: dateAfter,
        date__lte: dateBefore,
        page_size: 31
    };
    return apiClient.get('/daily-summaries/', { params });
};

export const getTimeSlotsForAdminForDate = (date, tutorId) => {
    return apiClient.get('/timeslots/', { params: { date: date, tutor: tutorId, page_size: 200 } });
};

export const getTimeSlotsForDate = (date) => {
    const params = {
        date: date,
        is_available: true,
        page_size: 100
    };
    return apiClient.get('/timeslots/', { params });
};

export const getTimeSlots = (params = {}) => {
    const defaultParams = { page_size: 2000 };
    return apiClient.get('/timeslots/', { params: { ...defaultParams, ...params } });
};

export const getTimeSlotById = (id) => {
    return apiClient.get(`/timeslots/${id}/`);
};

export const createTimeSlot = (slotData) => {
    return apiClient.post('/timeslots/', slotData);
};

export const updateTimeSlot = (id, slotData) => {
    return apiClient.patch(`/timeslots/${id}/`, slotData);
};

export const deleteTimeSlot = (id) => {
    return apiClient.delete(`/timeslots/${id}/`);
};

export const recalculateSummaryForDate = (date) => {
    return apiClient.post('/daily-summaries/recalculate/', {
        date: date,
    });
};