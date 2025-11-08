export const PUBLIC_CALENDAR_BIG_DESCRIPTOR = {
  type: 'publicCalendarBig',
  desc: 'Pełnoekranowy kalendarz wydarzeń z widokiem miesięcznym',
  fields: {
    title: { t: 'text', d: 'Nagłówek sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Opis wprowadzający', category: 'content' },
    backgroundColor: { t: 'color', d: 'Kolor tła sekcji', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu nagłówka', category: 'appearance' },
    highlightColor: { t: 'color', d: 'Kolor akcentu i wyróżnień', category: 'appearance' },
    emptyStateMessage: { t: 'text', d: 'Komunikat, gdy nie wybrano dnia', category: 'content' },
    events: { t: 'array', d: 'Lista wydarzeń przypisanych do konkretnych dni (YYYY-MM-DD)', category: 'content' }
  },
  layouts: ['default']
};
