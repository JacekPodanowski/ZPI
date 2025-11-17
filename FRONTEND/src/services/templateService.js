import apiClient from './apiClient';

export const fetchTemplates = async () => {
  const response = await apiClient.get('/templates/');
  return response.data;
};

export const createTemplate = async (templateData) => {
  const response = await apiClient.post('/templates/', templateData);
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  const response = await apiClient.delete(`/templates/${templateId}/`);
  return response.data;
};
