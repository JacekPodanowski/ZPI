export const SERVICES_DESCRIPTOR = {
  type: 'servicesAndPricing',
  desc: 'Sekcja oferty i cennika',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    offers: { t: 'array', req: true, d: 'Lista ofert', category: 'content' },
    currency: { t: 'text', d: 'Waluta', category: 'content' },
  bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
  backgroundImage: { t: 'image', d: 'Zdjęcie tła', category: 'appearance' },
  backgroundOverlayColor: { t: 'color', d: 'Kolor nakładki na tło', category: 'appearance' },
  textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' },
    accentColor: { t: 'color', d: 'Kolor akcentu', category: 'appearance' }
  },
  layouts: ['cards', 'list', 'table']
};

export const SERVICES_DEFAULTS = {
  cards: {
    title: 'Oferta',
    subtitle: 'Sprawdź naszą ofertę i przejrzyste ceny',
    offers: [],
    currency: 'PLN'
  },
  list: {
    title: 'Cennik',
    subtitle: '',
    offers: [],
    currency: 'PLN'
  },
  table: {
    title: 'Usługi i ceny',
    subtitle: '',
    offers: [],
    currency: 'PLN'
  }
};

export const TEAM_DESCRIPTOR = {
  type: 'team',
  desc: 'Sekcja prezentująca zespół',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    members: { t: 'array', req: true, d: 'Lista członków zespołu', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' },
    accentColor: { t: 'color', d: 'Kolor akcentu', category: 'appearance' }
  },
  layouts: ['grid', 'carousel', 'list']
};

export const TEAM_DEFAULTS = {
  grid: {
    title: 'Poznaj nasz zespół',
    subtitle: 'Ludzie, którzy wspierają Cię w drodze do równowagi',
    members: []
  },
  carousel: {
    title: 'Nasz zespół',
    subtitle: '',
    members: []
  },
  list: {
    title: 'Zespół',
    subtitle: '',
    members: []
  }
};

export const CONTAINER_DESCRIPTOR = {
  type: 'container',
  desc: 'Kontener do grupowania innych modułów',
  fields: {
    direction: { t: 'enum', vals: ['horizontal', 'vertical'], d: 'Kierunek układu', category: 'appearance' },
    gap: { t: 'text', d: 'Odstęp między elementami', category: 'appearance' },
    align: { t: 'enum', vals: ['start', 'center', 'end'], d: 'Wyrównanie elementów', category: 'appearance' },
    justify: { t: 'enum', vals: ['start', 'center', 'end', 'between', 'around'], d: 'Justowanie elementów', category: 'appearance' },
    wrap: { t: 'boolean', d: 'Zawijanie elementów', category: 'advanced' },
    children: { t: 'array', req: true, d: 'Elementy wewnątrz kontenera', category: 'content' }
  },
  layouts: ['flex', 'grid']
};

export const CONTAINER_DEFAULTS = {
  flex: {
    direction: 'horizontal',
    gap: '1rem',
    align: 'center',
    justify: 'center',
    wrap: true,
    children: []
  },
  grid: {
    direction: 'horizontal',
    gap: '1rem',
    align: 'start',
    justify: 'start',
    wrap: false,
    children: []
  }
};

export const REACT_COMPONENT_DESCRIPTOR = {
  type: 'reactComponent',
  desc: 'Niestandardowy komponent React',
  fields: {
    componentUrl: { t: 'text', d: 'URL do skompilowanego komponentu', category: 'advanced' },
    sourceCode: { t: 'code', d: 'Kod źródłowy komponentu', category: 'advanced' },
    props: { t: 'object', d: 'Propsy przekazywane do komponentu', category: 'advanced' }
  },
  layouts: ['default']
};

export const REACT_COMPONENT_DEFAULTS = {
  default: {
    componentUrl: '',
    sourceCode: '',
    props: {}
  }
};
