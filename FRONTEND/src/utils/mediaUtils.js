import { isBlobVideo } from '../services/tempMediaCache';

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov'];

/**
 * Checks if a given URL points to a video file based on its extension or blob metadata.
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL has a video extension or is a blob video, false otherwise.
 */
export const isVideoUrl = (url = '') => {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  // Check if it's a blob URL pointing to a video
  if (url.startsWith('blob:')) {
    return isBlobVideo(url);
  }
  
  try {
    const fileExtension = new URL(url, 'http://dummybase.com').pathname.split('.').pop().toLowerCase();
    return VIDEO_EXTENSIONS.includes(fileExtension);
  } catch (error) {
    // Fallback for relative paths or URLs that fail to parse
    const fileExtension = url.split('.').pop().split('?')[0].toLowerCase();
    return VIDEO_EXTENSIONS.includes(fileExtension);
  }
};
