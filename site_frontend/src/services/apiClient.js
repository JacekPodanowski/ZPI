// src/services/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// UPROSZCZONY interceptor odpowiedzi dla odświeżania tokena.
// W produkcji rozważ bardziej zaawansowaną logikę (np. kolejkowanie żądań).
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Access token expired, attempting to refresh...');
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
                    const newAccessToken = response.data.access;
                    localStorage.setItem('accessToken', newAccessToken);
                    // Ustawienie domyślnego nagłówka dla przyszłych żądań przez tę instancję apiClient
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    // Zaktualizuj nagłówek oryginalnego żądania
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest); // Wyślij ponownie oryginalne żądanie
                } else {
                    console.log('No refresh token found, redirecting to login.');
                    // Wyloguj lub przekieruj
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    if (window.location.pathname !== '/login') window.location.href = '/login';
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error("Unable to refresh token", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (window.location.pathname !== '/login') window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;