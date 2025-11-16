export const BLOG_DESCRIPTOR = {
  type: 'blog',
  desc: 'Sekcja aktualności i wpisów blogowych',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    posts: { t: 'array', req: true, d: 'Lista wpisów', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' }
  },
  layouts: ['grid', 'list', 'masonry']
};
