import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://192.168.0.102:8000'

export const API_PAGE = `${API_BASE}/api/page`
export const API_AUTH = `${API_BASE}/api/auth`
export const API_AI = `${API_BASE}/api/ai`
export const API_STORAGE = `${API_BASE}/api/storage`

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fetchTemplates = async () => {
  try {
    const response = await apiClient.get('/api/templates')
    return response.data
  } catch (error) {
    console.error('API Error: Failed to fetch templates', error)
    return []
  }
}

export const saveTemplate = async (templateData) => {
  try {
    const response = await apiClient.post('/api/page', templateData)
    return response.data
  } catch (error) {
    console.error('API Error: Failed to save template', error)
    throw error
  }
}

export const sendAIMessage = async (message) => {
  try {
    const response = await apiClient.post('/api/ai', { message })
    return response.data
  } catch (error) {
    console.error('AI API not available', error)
    throw error
  }
}

export default apiClient
