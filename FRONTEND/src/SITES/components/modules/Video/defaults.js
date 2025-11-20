// defaults.js - Rich mock data variants for Video module
export const VIDEO_DEFAULTS = {
  standard: [
    {
      videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
      caption: 'Wprowadzenie do praktyki jogi dla początkujących',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      caption: 'Jak budować skuteczną strategię biznesową',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=BI-rlIZeLWs',
      caption: 'Za kulisami profesjonalnej sesji fotograficznej',
      muted: false
    }
  ],
  fullWidth: [
    {
      videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
      caption: 'Pełny trening jogi - 30 minut spokoju',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      caption: 'Masterclass: Zarządzanie zmianą w organizacji',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=BI-rlIZeLWs',
      caption: 'Portfolio 2024 - najlepsze prace roku',
      muted: false
    }
  ],
  compact: [
    {
      videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
      caption: 'Szybka medytacja 5-minutowa',
      muted: true
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      caption: 'Quick tip: Efektywna komunikacja',
      muted: true
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=BI-rlIZeLWs',
      caption: 'Timelapse sesji w studio',
      muted: true
    }
  ],
  split: [
    {
      videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
      title: 'Poznaj Praktykę Jogi',
      description: 'Yoga to nie tylko ćwiczenia fizyczne - to holistyczne podejście do zdrowia ciała i umysłu. W tym filmie przedstawiam podstawy praktyki, które pomogą Ci zacząć swoją przygodę z jogą.',
      videoPosition: 'left',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      title: 'Strategia dla Sukcesu',
      description: 'Dowiedz się, jak zbudować solidną strategię biznesową, która poprowadzi Twoją firmę do sukcesu. Praktyczne wskazówki oparte na latach doświadczenia.',
      sideImage: 'https://picsum.photos/seed/video-split-biz/800/600',
      videoPosition: 'right',
      muted: false
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=BI-rlIZeLWs',
      title: 'Jak Powstają Profesjonalne Zdjęcia',
      description: 'Zajrzyj za kulisy sesji fotograficznej i zobacz, ile pracy włożono w stworzenie perfekcyjnego ujęcia. Od przygotowań po post-produkcję.',
      videoPosition: 'left',
      muted: false
    }
  ]
};
