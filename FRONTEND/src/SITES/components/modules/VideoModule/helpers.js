export const normaliseVideoUrl = (rawUrl = '') => {
  if (!rawUrl) return '';
  const url = rawUrl.trim();

  if (url.startsWith('<iframe')) {
    const match = url.match(/src=["']([^"']+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) {
    return url;
  }

  if (url.includes('youtube.com/watch')) {
    return url.replace('watch?v=', 'embed/');
  }

  if (url.includes('youtu.be/')) {
    const [, idWithParams = ''] = url.split('youtu.be/');
    if (!idWithParams) return '';
    const [id, params] = idWithParams.split('?');
    const query = params ? `?${params}` : '';
    return `https://www.youtube.com/embed/${id}${query}`;
  }

  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const [, idWithParams = ''] = url.split('vimeo.com/');
    if (!idWithParams) return '';
    const [id, params] = idWithParams.split('?');
    const query = params ? `?${params}` : '';
    return `https://player.vimeo.com/video/${id}${query}`;
  }

  return url;
};

export const applyPlaybackPreferences = (rawUrl, options = {}) => {
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);
    const host = url.hostname;

    if (options.muted) {
      if (host.includes('youtube.com')) {
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', url.searchParams.get('playsinline') || '1');
      }

      if (host.includes('player.vimeo.com')) {
        url.searchParams.set('muted', '1');
      }
    }

    return url.toString();
  } catch (error) {
    return rawUrl;
  }
};
