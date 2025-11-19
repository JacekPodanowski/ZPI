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

export const updateUserPreferences = async (preferences) => {
    const response = await apiClient.patch('/users/me/', { preferences });
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await apiClient.patch('/users/me/', userData);
    return response.data;
};

export const fetchLatestTerms = async () => {
    const response = await apiClient.get('/terms/latest/');
    return response.data;
};

export const acceptLatestTerms = async () => {
    const response = await apiClient.post('/terms/accept/');
    return response.data;
};

export const resendVerificationEmail = async (email) => {
    const response = await apiClient.post('/auth/resend-verification/', { email });
    return response.data;
};

export const confirmEmail = async (key) => {
    const response = await apiClient.post('/auth/confirm-email/', { key });
    return response.data;
};

export const requestMagicLink = async (email) => {
    const response = await apiClient.post('/auth/magic-link/request/', { email });
    return response.data;
};

export const verifyMagicLink = async (token) => {
    const response = await apiClient.post('/auth/magic-link/verify/', { token });
    const { access, refresh } = response.data;
    persistTokens(access, refresh);
    return response.data;
};
