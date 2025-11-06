export const EVENTS_DESCRIPTOR = {
  type: 'events',
  desc: 'Sekcja nadchodzących wydarzeń',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    events: { t: 'array', req: true, d: 'Lista wydarzeń', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    accentColor: { t: 'color', d: 'Kolor akcentu', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' }
  },
  layouts: ['list', 'grid', 'timeline']
};

export const EVENTS_DEFAULTS = {
  list: {
    title: 'Nadchodzące wydarzenia',
    subtitle: 'Zarezerwuj swoje miejsce wcześniej',
    events: []
  },
  grid: {
    title: 'Wydarzenia',
    subtitle: '',
    events: []
  },
  timeline: {
    title: 'Harmonogram wydarzeń',
    subtitle: '',
    events: []
  }
};
