const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov'];

/**
 * Checks if a given URL points to a video file based on its extension.
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL has a video extension, false otherwise.
 */
export const isVideoUrl = (url = '') => {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
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
