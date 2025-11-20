// descriptor.js
export const SERVICES_DESCRIPTOR = {
  type: 'services',
  desc: 'Sekcja oferty i cennika',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    services: { t: 'array', req: true, d: 'Lista usług', category: 'content' },
    currency: { t: 'text', d: 'Waluta', category: 'content' },
    substyle: {
      t: 'enum',
      d: 'Wariant wizualny',
      options: ['default', 'minimal', 'elegant', 'bold'],
      category: 'layout'
    },
    flipStyle: {
      t: 'enum',
      d: 'Styl animacji kart (tylko dla layoutu cards)',
      options: ['flip', 'slide', 'fade', 'rotate3d', 'cube'],
      category: 'layout'
    },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' },
    accentColor: { t: 'color', d: 'Kolor akcentu', category: 'appearance' }
  },
  layouts: ['cards', 'list', 'accordion']
};
