import axios from 'axios'
import { isTempBlobUrl } from '../services/tempMediaCache'

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

  // Handle absolute URLs (http://, https://, //)
  if (/^(https?:)?\/\//i.test(url)) {
    return url
  }
  
  // Handle data: URIs
  if (url.startsWith('data:')) {
    return url
  }
  
  // Handle blob: URLs (only valid during current session)
  if (url.startsWith('blob:')) {
    // Check if this is a temporary blob from our cache
    if (isTempBlobUrl(url)) {
      return url // Valid temporary blob
    }
    // Stale blob URL - these are invalid after page reload
    // Return a placeholder or the URL as-is to let the browser handle it
    console.warn('⚠️ Stale blob URL detected (page may have been reloaded):', url.substring(0, 50))
    console.warn('   This image needs to be re-uploaded or saved properly.')
    return '' // Return empty to prevent broken image attempts
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  if (!MEDIA_BASE_URL) {
    return normalizedPath
  }

  const resolved = `${MEDIA_BASE_URL}${normalizedPath}`
  console.log('🖼️ Resolved media URL:', { input: url.substring(0, 50), resolved: resolved.substring(0, 80) })
  return resolved
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
