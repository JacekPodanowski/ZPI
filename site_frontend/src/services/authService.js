import apiClient from './apiClient';

export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/token/', { email, password });
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        return response.data;
    } catch (error) {
        console.error("Login service error:", error.response?.data || error.message);
        throw error;
    }
};

export const googleLogin = async (accessToken) => {
    try {
        const response = await apiClient.post('/auth/google/', {
            access_token: accessToken,
        });

        if (response.data.access && response.data.refresh) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        return response.data;
    } catch (error) {
        console.error("Google login service error:", error.response?.data || error.message);
        throw error;
    }
};


export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
};

export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register/', userData);
        
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        
        return response.data;
    } catch (error) {
        console.error("Signup service error:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchMe = async () => {
    try {
        const response = await apiClient.get('/users/me/');
        return response.data;
    } catch (error) {
        console.error("Fetch current user error:", error.response?.data || error.message);
        throw error;
    }
};