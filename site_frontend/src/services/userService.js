// src/services/userService.js
import apiClient from './apiClient';

export const getUsers = (params = {}) => {
    // Zazwyczaj wymaga uprawnień admina
    return apiClient.get('/users/', { params });
};

export const getUserById = (userId) => {
    // Zazwyczaj wymaga uprawnień admina lub bycia tym użytkownikiem
    return apiClient.get(`/users/${userId}/`);
};

export const createUser = (userData) => {
    // Zazwyczaj wymaga uprawnień admina
    // Dla publicznej rejestracji użyj endpointu signup z authService lub allauth
    return apiClient.post('/users/', userData);
};

export const updateUser = (userId, userData) => {
    // Właściciel lub admin
    return apiClient.patch(`/users/${userId}/`, userData); // PATCH dla częściowej aktualizacji
};

export const deleteUser = (userId) => {
    // Admin
    return apiClient.delete(`/users/${userId}/`);
};