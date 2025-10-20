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

export const deleteMediaAsset = async (url = '') => {
  if (!isManagedMediaUrl(url)) {
    return
  }

  try {
    await apiClient.delete('/upload/', {
      data: {
        url,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Failed to delete media asset', error)
  }
}
