import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://192.168.0.104:8000'

const trimTrailingSlash = (value = '') => (value.endsWith('/') ? value.slice(0, -1) : value)

const deriveMediaBaseUrl = () => {
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL
  if (mediaBase) {
    return trimTrailingSlash(mediaBase)
  }

  const configuredApiBase = import.meta.env.VITE_API_BASE
  if (configuredApiBase) {
    return trimTrailingSlash(configuredApiBase)
  }

  const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (rawApiBaseUrl) {
    return trimTrailingSlash(rawApiBaseUrl.replace(/\/?api\/?v1\/?$/i, ''))
  }

  if (API_BASE) {
    return trimTrailingSlash(API_BASE)
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin)
  }

  return ''
}

export const MEDIA_BASE_URL = deriveMediaBaseUrl()

export const resolveMediaUrl = (input) => {
  if (!input) return ''

  const url = String(input).trim()
  if (!url) return ''

  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  if (!MEDIA_BASE_URL) {
    return normalizedPath
  }

  return `${MEDIA_BASE_URL}${normalizedPath}`
}

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
