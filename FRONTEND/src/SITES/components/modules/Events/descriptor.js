export const EVENTS_DESCRIPTOR = {
  type: 'events',
  desc: 'Sekcja nadchodzących wydarzeń',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    showNewsletter: { t: 'boolean', d: 'Pokaż formularz zapisu na newsletter', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
    backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' },
    accentColor: { t: 'color', d: 'Kolor akcentu', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' }
  },
  layouts: ['list', 'grid', 'timeline']
};

export const EVENTS_DEFAULTS = {
  list: [
    {
      title: 'Nadchodzące wydarzenia',
      subtitle: 'Zarezerwuj swoje miejsce wcześniej',
      showNewsletter: true,
      events: [
        { title: 'Warsztat Vinyasa Flow', date: '2025-11-22', summary: 'Intensywny 3-godzinny warsztat zaawansowanych technik Vinyasa', location: 'Studio Główne', tag: 'Warsztat' },
        { title: 'Medytacja Pełni Księżyca', date: '2025-11-27', summary: 'Specjalna sesja medytacyjna przy pełni księżyca', location: 'Sala Medytacji', tag: 'Wydarzenie' },
        { title: 'Weekend Retreat w Górach', date: '2025-12-05', summary: 'Weekendowy wyjazd praktyczny w Beskidy', location: 'Beskidy', tag: 'Retreat' }
      ]
    },
    {
      title: 'Nadchodzące wydarzenia',
      subtitle: 'Dołącz do naszych specjalnych sesji',
      showNewsletter: true,
      events: [
        { title: 'Warsztat Przywództwa', date: '2025-11-25', summary: 'Jednodniowy warsztat dla liderów i menedżerów', location: 'Online', tag: 'Warsztat' },
        { title: 'Networking dla Przedsiębiorców', date: '2025-12-01', summary: 'Spotkanie networkingowe dla naszych klientów', location: 'Business Hub, Warszawa', tag: 'Networking' },
        { title: 'Masterclass: Goal Setting 2026', date: '2025-12-10', summary: 'Planowanie celów na nadchodzący rok metodą OKR', location: 'Online', tag: 'Masterclass' }
      ]
    },
    {
      title: 'Nadchodzące wydarzenia',
      subtitle: 'Specjalne okazje i promocje',
      showNewsletter: true,
      events: [
        { title: 'Mini-sesje Świąteczne', date: '2025-12-08', summary: 'Krótkie sesje zdjęciowe w klimacie świąt - limitowana liczba miejsc', location: 'Studio', tag: 'Promocja' },
        { title: 'Portfolio Day', date: '2025-12-15', summary: 'Dzień otwarty studia - zobacz jak pracujemy', location: 'Studio Fotograficzne', tag: 'Wydarzenie' }
      ]
    }
  ],
  grid: [
    {
      title: 'Wydarzenia',
      subtitle: 'Nie przegap specjalnych okazji',
      showNewsletter: true,
      events: [
        { title: 'Joga dla Początkujących', date: '2025-11-20', summary: 'Darmowe zajęcia wprowadzające dla nowych uczniów', location: 'Studio', tag: 'Bezpłatne' },
        { title: 'Ajurweda w Praktyce', date: '2025-11-28', summary: 'Wykład o zasadach ajurwedycznego stylu życia', location: 'Sala Wykładowa', tag: 'Wykład' },
        { title: 'Noworoczny Retreat', date: '2025-12-29', summary: 'Powitaj Nowy Rok w spokoju i uważności', location: 'Mazury', tag: 'Retreat' }
      ]
    },
    {
      title: 'Wydarzenia',
      subtitle: 'Rozwijaj się razem z nami',
      showNewsletter: true,
      events: [
        { title: 'Webinar: Efektywna Komunikacja', date: '2025-11-23', summary: 'Darmowy webinar o komunikacji w zespole', location: 'Online', tag: 'Webinar' },
        { title: 'Coaching Circle', date: '2025-12-03', summary: 'Grupowa sesja coachingowa - wzajemne wsparcie', location: 'Online', tag: 'Grupa' },
        { title: 'Konferencja Leadership 2026', date: '2026-01-15', summary: 'Jednodniowa konferencja dla liderów', location: 'Warszawa', tag: 'Konferencja' }
      ]
    },
    {
      title: 'Wydarzenia',
      subtitle: 'Wyjątkowe okazje fotograficzne',
      showNewsletter: true,
      events: [
        { title: 'Konkurs Fotograficzny', date: '2025-11-30', summary: 'Zgłoś swoje zdjęcie i wygraj bezpłatną sesję', location: 'Online', tag: 'Konkurs' },
        { title: 'Pokaz Prac', date: '2025-12-12', summary: 'Wystawa moich najlepszych prac z 2025 roku', location: 'Galeria Sztuki', tag: 'Wystawa' }
      ]
    }
  ],
  timeline: [
    {
      title: 'Harmonogram wydarzeń',
      subtitle: 'Plan na najbliższe tygodnie',
      showNewsletter: true,
      events: [
        { title: 'Poranna Praktyka', date: '2025-11-18', summary: 'Specjalna poranna sesja z wschodniaem słońca', location: 'Park Miejski', tag: 'Praktyka' },
        { title: 'Wieczór z Jogą Nidra', date: '2025-11-24', summary: 'Relaksacyjna praktyka jogicznego snu', location: 'Studio', tag: 'Specjalne' },
        { title: 'Kurs Medytacji - Start', date: '2025-12-02', summary: '4-tygodniowy kurs medytacji dla początkujących', location: 'Online', tag: 'Kurs' }
      ]
    },
    {
      title: 'Harmonogram wydarzeń',
      subtitle: 'Zaplanuj swój rozwój',
      showNewsletter: true,
      events: [
        { title: 'Q&A Session', date: '2025-11-21', summary: 'Sesja pytań i odpowiedzi na żywo', location: 'Online', tag: 'Q&A' },
        { title: 'Success Stories', date: '2025-11-29', summary: 'Spotkanie z byłymi klientami - historie sukcesu', location: 'Biuro', tag: 'Inspiracje' },
        { title: 'Planowanie 2026', date: '2025-12-16', summary: 'Grupowy warsztat planowania celów na nowy rok', location: 'Online', tag: 'Warsztat' }
      ]
    },
    {
      title: 'Harmonogram wydarzeń',
      subtitle: 'Nadchodzące sesje i wydarzenia',
      showNewsletter: true,
      events: [
        { title: 'Dni Otwarte Studia', date: '2025-11-26', summary: 'Odwiedź studio i poznaj kulisy pracy fotografa', location: 'Studio', tag: 'Open Day' },
        { title: 'Zimowe Mini-Sesje', date: '2025-12-20', summary: 'Krótkie sesje w zimowej scenerii', location: 'Plener', tag: 'Mini-Sesje' }
      ]
    }
  ]
};
