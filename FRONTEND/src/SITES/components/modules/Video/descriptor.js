export const VIDEO_DESCRIPTOR = {
  type: 'video',
  desc: 'Moduł do osadzania wideo z YouTube, Vimeo lub własnych plików',
  fields: {
    videoUrl: { t: 'text', req: true, d: 'URL wideo lub kod iframe', category: 'content' },
    caption: { t: 'text', d: 'Podpis pod wideo', category: 'content' },
    title: { t: 'text', d: 'Tytuł sekcji (dla layout split)', category: 'content' },
    description: { t: 'textarea', d: 'Opis obok wideo (dla layout split)', category: 'content' },
    sideImage: { t: 'image', d: 'Obrazek obok wideo (dla layout split)', category: 'appearance' },
    videoPosition: { t: 'enum', vals: ['left', 'right'], d: 'Pozycja wideo w split layout', category: 'appearance' },
    captionColor: { t: 'color', d: 'Kolor podpisu', category: 'appearance' },
    bgColor: { t: 'color', d: 'Kolor tła sekcji', category: 'appearance' },
    muted: { t: 'boolean', d: 'Wycisz wideo', category: 'advanced' }
  },
  layouts: ['standard', 'fullWidth', 'compact', 'split']
};
