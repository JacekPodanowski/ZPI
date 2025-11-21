export const GALLERY_DESCRIPTOR = {
  type: 'gallery',
  desc: 'Galeria zdjęć i wideo z różnymi układami',
  fields: {
    images: { t: 'array', req: true, d: 'Lista zdjęć/wideo', category: 'content' },
    columns: { t: 'number', d: 'Liczba kolumn (dla layoutu grid)', category: 'appearance' },
    gap: { t: 'text', d: 'Odstęp między elementami', category: 'appearance' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' }
  },
  layouts: ['grid', 'masonry', 'slideshow', 'carousel', 'fade']
};
