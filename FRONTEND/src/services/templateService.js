import apiClient from './apiClient';

export const fetchTemplates = async () => {
  const response = await apiClient.get('/templates/');
  return response.data;
};
