import apiClient from './apiClient'
import { MEDIA_BASE_URL } from '../config/api'

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

const isDataLikeUrl = (url = '') => url.startsWith('data:') || url.startsWith('blob:')

const isRelativeUrl = (url = '') => !ABSOLUTE_URL_PATTERN.test(url)

export const isManagedMediaUrl = (url = '') => {
  const trimmed = url.trim()
  if (!trimmed || isDataLikeUrl(trimmed)) {
    return false
  }

  if (isRelativeUrl(trimmed)) {
    return true
  }

  if (!MEDIA_BASE_URL) {
    return false
  }

  return trimmed.startsWith(MEDIA_BASE_URL)
}

export const deleteMediaAsset = async (url = '', options = {}) => {
  if (!isManagedMediaUrl(url)) {
    return
  }

  try {
    const payload = { url }
    if (options.usage) {
      payload.usage = options.usage
    }
    if (options.siteId) {
      payload.site_id = options.siteId
    }
    const response = await apiClient.delete('/upload/', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Backend returns JSON with info about detached usages and whether the
    // underlying asset was removed. If the backend responds with 204 No Content
    // axios will return a response with no data; normalize that to an object.
    if (!response || response.status === 204) {
      return { asset_id: null, detached_usages: 0, removed: false }
    }

    return response.data || { asset_id: null, detached_usages: 0, removed: false }
  } catch (error) {
    console.error('Failed to delete media asset', error)
    return { asset_id: null, detached_usages: 0, removed: false, error: error?.message }
  }
}
