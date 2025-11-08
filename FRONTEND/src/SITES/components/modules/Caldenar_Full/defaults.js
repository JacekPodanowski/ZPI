const createDate = (offsetDays) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const createDateTime = (offsetDays, hour = 10, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
};

export const PUBLIC_CALENDAR_BIG_DEFAULTS = {
  default: {
    title: 'Pełny kalendarz wydarzeń',
    subtitle: 'Przeglądaj wszystkie nadchodzące zajęcia i wydarzenia w jednym miejscu.',
    backgroundColor: '#f0f0ed',
    textColor: '#1e1e1e',
    highlightColor: '#920020',
    emptyStateMessage: 'Wybierz dzień z kalendarza, aby zobaczyć szczegóły wydarzeń.',
    events: [
      {
        id: 'public-calendar-default-1',
        date: createDate(2),
        start: createDateTime(2, 9, 0),
        end: createDateTime(2, 10, 30),
        title: 'Poranna praktyka oddechowa',
        description: 'Delikatna sesja dla osób rozpoczynających przygodę z oddechem.',
        location: 'Studio Harmonia',
        category: 'Grupowe',
        capacity: 12
      },
      {
        id: 'public-calendar-default-2',
        date: createDate(5),
        start: createDateTime(5, 17, 30),
        end: createDateTime(5, 18, 30),
        title: 'Indywidualna konsultacja',
        description: 'Spotkanie 1:1 skupione na dobraniu odpowiedniej praktyki oddechowej.',
        location: 'Online',
        category: 'Indywidualne',
        capacity: 1
      },
      {
        id: 'public-calendar-default-3',
        date: createDate(9),
        start: createDateTime(9, 11, 0),
        end: createDateTime(9, 13, 0),
        title: 'Warsztat regeneracyjny',
        description: 'Dwugodzinny warsztat łączący ruch, oddech i relaksacyjne dźwięki.',
        location: 'Pracownia Jogi, ul. Świerkowa 4',
        category: 'Warsztat',
        capacity: 18
      }
    ]
  }
};
