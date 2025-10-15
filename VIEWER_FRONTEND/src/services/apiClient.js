import axios from 'axios';

const resolveApiBaseUrl = () => {
    const fallbackHost = import.meta.env.VITE_API_FALLBACK_HOST || '192.168.0.104';

    if (import.meta.env.VITE_API_BASE_URL) {
        try {
            const configuredUrl = new URL(import.meta.env.VITE_API_BASE_URL);
            const isLocalHost = ['localhost', '127.0.0.1'].includes(configuredUrl.hostname);

            if (isLocalHost && typeof window !== 'undefined' && window.location) {
                const windowHost = window.location.hostname;
                if (windowHost && !['localhost', '127.0.0.1'].includes(windowHost)) {
                    configuredUrl.hostname = windowHost;
                    return configuredUrl.toString();
                }
            }

            if (isLocalHost) {
                configuredUrl.hostname = fallbackHost;
                return configuredUrl.toString();
            }

            return configuredUrl.toString();
        } catch (error) {
            return `http://${fallbackHost}:8000/api/v1`;
        }
    }

    if (typeof window !== 'undefined' && window.location) {
        const { protocol, hostname } = window.location;
        const port = import.meta.env.VITE_API_PORT || '8000';
        return `${protocol}//${hostname}:${port}/api/v1`;
    }

    return `http://${fallbackHost}:8000/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // eslint-disable-next-line no-param-reassign
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                localStorage.removeItem('accessToken');
                return Promise.reject(error);
            }

            try {
                const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
                const newAccessToken = refreshResponse.data.access;
                localStorage.setItem('accessToken', newAccessToken);
                apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
