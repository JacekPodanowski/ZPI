export const FAQ_DESCRIPTOR = {
  type: 'faq',
  desc: 'Sekcja FAQ z pytaniami i odpowiedziami',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    intro: { t: 'text', d: 'Wprowadzenie', category: 'content' },
    items: { t: 'array', req: true, d: 'Lista pytań i odpowiedzi', category: 'content' },
    showContactOption: { t: 'boolean', d: 'Pokaż opcję "Nie znalazłeś odpowiedzi"', category: 'content' },
    contactFormLink: { t: 'text', d: 'Link do formularza kontaktowego', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' }
  },
  layouts: ['accordion', 'list', 'cards']
};
