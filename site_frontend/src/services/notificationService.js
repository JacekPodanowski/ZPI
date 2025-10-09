// src/services/notificationService.js
import apiClient from './apiClient';

// Backend powinien filtrować powiadomienia tylko dla zalogowanego użytkownika
export const getMyNotifications = (params = {}) => {
    // params np. { is_read: false }
    return apiClient.get('/notifications/', { params });
};

export const getNotificationById = (id) => {
    // Upewnij się, że backend sprawdza, czy użytkownik jest właścicielem
    return apiClient.get(`/notifications/${id}/`);
};

export const markNotificationAsRead = (id) => {
    return apiClient.patch(`/notifications/${id}/`, { is_read: true });
};

export const markAllNotificationsAsRead = () => {
    // Wymaga dedykowanego endpointu w backendzie, np. POST /notifications/mark-all-as-read/
    // return apiClient.post('/notifications/mark-all-as-read/');
    // Na razie nie implementujemy tego, bo nie ma endpointu.
    console.warn('markAllNotificationsAsRead not implemented in backend yet.');
    return Promise.resolve();
};

// Zazwyczaj powiadomienia są tworzone przez backend, a nie bezpośrednio przez frontend API.
// export const createNotification = (notificationData) => {
//     return apiClient.post('/notifications/', notificationData);
// };