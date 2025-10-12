import apiClient from './apiClient';

const persistTokens = (access, refresh) => {
    if (access) {
        localStorage.setItem('accessToken', access);
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
    }

    if (refresh) {
        localStorage.setItem('refreshToken', refresh);
    }
};

export const login = async (email, password) => {
    const response = await apiClient.post('/token/', { email, password });
    const { access, refresh } = response.data;
    persistTokens(access, refresh);
    return response.data;
};

export const googleLogin = async (accessToken) => {
    const response = await apiClient.post('/auth/google/', { access_token: accessToken });
    const { access, refresh } = response.data;
    persistTokens(access, refresh);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common.Authorization;
};

export const register = async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    const { access, refresh } = response.data;
    persistTokens(access, refresh);
    return response.data;
};

export const fetchMe = async () => {
    const response = await apiClient.get('/users/me/');
    return response.data;
};
