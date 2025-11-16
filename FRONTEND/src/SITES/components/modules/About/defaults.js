// defaults.js - Rich mock data variants for About module

// Helper function for generating random seeds for Picsum
export const ABOUT_DEFAULTS = {
  timeline: [
    {
      title: "Moja Droga Rozwoju",
      description: "Historia pasji do jogi i medytacji, która przekształciła się w misję dzielenia się spokojem",
      milestones: [
        { year: "2015", title: "Pierwsze Kroki", desc: "Certyfikacja instruktora jogi w Indiach" },
        { year: "2018", title: "Własne Studio", desc: "Otwarcie przestrzeni do praktyki w centrum miasta" },
        { year: "2021", title: "Rozszerzenie Oferty", desc: "Dodanie medytacji i terapii mindfulness" },
        { year: "2025", title: "Dziś", desc: "Społeczność 200+ regularnych praktykujących" }
      ]
    },
    {
      title: "Moja Podróż Biznesowa",
      description: "Od korporacji do własnej praktyki coachingowej - historia transformacji",
      milestones: [
        { year: "2012", title: "Start w Korporacji", desc: "15 lat doświadczenia w zarządzaniu projektami" },
        { year: "2019", title: "Certyfikacja Coach", desc: "Ukończenie programu ICF i ACC" },
        { year: "2022", title: "Własna Firma", desc: "Rozpoczęcie praktyki coachingowej" },
        { year: "2025", title: "Obecnie", desc: "Ponad 100 zadowolonych klientów" }
      ]
    },
    {
      title: "Ewolucja Artysty",
      description: "Jak pasja do fotografii stała się moim głównym źródłem inspiracji",
      milestones: [
        { year: "2016", title: "Pierwsze Zlecenia", desc: "Początek zawodowej przygody z fotografią" },
        { year: "2019", title: "Własne Studio", desc: "Profesjonalne wyposażenie i przestrzeń" },
        { year: "2022", title: "Nagrody", desc: "Wyróżnienia w konkursach fotograficznych" },
        { year: "2025", title: "Dziś", desc: "Setki udokumentowanych wyjątkowych momentów" }
      ]
    }
  ],
  grid: [
    {
      title: "Poznaj Moją Historię",
      description: "Jestem certyfikowaną instruktorką jogi z wieloletnim doświadczeniem w prowadzeniu sesji indywidualnych i grupowych. Moją misją jest pomoc w odnalezieniu równowagi między ciałem a umysłem.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      highlights: [
        { title: "10+ lat praktyki", desc: "Doświadczenie w różnych stylach jogi" },
        { title: "Certyfikacje", desc: "RYT 500, instruktor mindfulness" },
        { title: "200+ uczniów", desc: "Stała społeczność praktykujących" },
        { title: "Holistyczne podejście", desc: "Łączenie jogi z medytacją" }
      ]
    },
    {
      title: "Kim Jestem",
      description: "Jako biznes coach z 15-letnim doświadczeniem korporacyjnym, specjalizuję się w rozwoju liderów i transformacji organizacji. Pomagam przedsiębiorcom osiągać cele przy zachowaniu równowagi życiowej.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      highlights: [
        { title: "15 lat w biznesie", desc: "Doświadczenie w zarządzaniu projektami" },
        { title: "Certyfikowany Coach", desc: "ICF ACC, certyfikat z Harvard" },
        { title: "100+ klientów", desc: "Firmy i indywidualni przedsiębiorcy" },
        { title: "Mierzalne rezultaty", desc: "Średnio 40% wzrost efektywności" }
      ]
    },
    {
      title: "Moja Pasja",
      description: "Jestem fotografem specjalizującym się w portretach i fotografii eventowej. Wierzę, że każdy moment zasługuje na to, by zostać uwieczniony w sposób autentyczny i artystyczny.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      highlights: [
        { title: "8 lat doświadczenia", desc: "Setki zrealizowanych projektów" },
        { title: "Nagrody", desc: "Wyróżnienia w konkursach" },
        { title: "Własne studio", desc: "Profesjonalne wyposażenie" },
        { title: "Indywidualne podejście", desc: "Każda sesja jest wyjątkowa" }
      ]
    }
  ],
  narrative: [
    {
      title: "Moja Historia",
      description: "Moja podróż z jogą rozpoczęła się 12 lat temu, gdy szukałam sposobu na radzenie sobie ze stresem. To, co zaczęło się jako osobista praktyka, przekształciło się w głęboką pasję do dzielenia się tym pięknem z innymi. Po latach nauki u najlepszych nauczycieli w Indiach i Europie, stworzyłam przestrzeń, gdzie każdy może odnaleźć swój własny rytm i spokój. Wierzę, że joga to nie tylko asany - to styl życia, który prowadzi do wewnętrznej harmonii.",
      image: `https://picsum.photos/seed/about-1/600/400`
    },
    {
      title: "Dlaczego Coaching?",
      description: "Po 15 latach w korporacji, w których zarządzałam dużymi projektami i zespołami, odkryłam, że moją prawdziwą pasją jest rozwój ludzi, nie tylko procesów. Coaching pozwala mi łączyć moje biznesowe doświadczenie z głęboką satysfakcją z pomagania innym w osiąganiu ich celów. Każda sesja to nowa historia transformacji, a ja mam przywilej być jej częścią. Specjalizuję się w pracy z liderami i przedsiębiorcami, którzy chcą rozwijać swoje firmy nie tracąc przy tym siebie.",
      image: `https://picsum.photos/seed/about-1/600/400`
    },
    {
      title: "Fotografia to Moje Życie",
      description: "Odkryłam fotografię przypadkiem podczas podróży do Azji. Pierwsza seria zdjęć, którą zrobiłam, pokazała mi, że potrafię uchwycić nie tylko obraz, ale emocje i historie. Od tamtej pory minęło 8 lat intensywnej pracy, nauki i setek sesji. Każdy projekt traktuję jako możliwość opowiedzenia wyjątkowej historii. Specjalizuję się w portretach, które pokazują prawdziwą osobowość, oraz w fotografii eventowej, która uwiecznia autentyczne momenty radości.",
      image: `https://picsum.photos/seed/about-1/600/400`
    }
  ]
};

