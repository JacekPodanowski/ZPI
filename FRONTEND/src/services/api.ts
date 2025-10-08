import axios from 'axios';

const API_BASE_URL = 'https://your-api-url.com/api'; // Replace with your actual API base URL

export const fetchTemplates = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/templates`);
        return response.data;
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
};

export const saveTemplate = async (templateData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/templates`, templateData);
        return response.data;
    } catch (error) {
        console.error('Error saving template:', error);
        throw error;
    }
};

export const fetchUserPages = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/pages`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user pages:', error);
        throw error;
    }
};

export const saveUserPage = async (userId, pageData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/${userId}/pages`, pageData);
        return response.data;
    } catch (error) {
        console.error('Error saving user page:', error);
        throw error;
    }
};