export const VIDEO_DESCRIPTOR = {
  type: 'video',
  desc: 'Moduł do osadzania wideo z YouTube, Vimeo lub własnych plików',
  fields: {
    videoUrl: { t: 'text', req: true, d: 'URL wideo lub kod iframe', category: 'content' },
    caption: { t: 'text', d: 'Podpis pod wideo', category: 'content' },
    captionColor: { t: 'color', d: 'Kolor podpisu', category: 'appearance' },
    bgColor: { t: 'color', d: 'Kolor tła sekcji', category: 'appearance' },
    muted: { t: 'boolean', d: 'Wycisz wideo', category: 'advanced' }
  },
  layouts: ['standard', 'fullWidth', 'compact']
};
