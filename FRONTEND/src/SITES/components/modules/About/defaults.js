// defaults.js - Rich mock data variants for About module

// Helper function for generating random seeds for Picsum
export const ABOUT_DEFAULTS = {
  timeline: [
    {
      title: "Moja Droga Rozwoju",
      subtitle: "Historia pasji, która przekształciła się w misję",
      description: "Historia pasji do jogi i medytacji, która przekształciła się w misję dzielenia się spokojem",
      timeline: [
        { year: "2015", title: "Pierwsze Kroki", description: "Certyfikacja instruktora jogi w Indiach" },
        { year: "2018", title: "Własne Studio", description: "Otwarcie przestrzeni do praktyki w centrum miasta" },
        { year: "2021", title: "Rozszerzenie Oferty", description: "Dodanie medytacji i terapii mindfulness" },
        { year: "2025", title: "Dziś", description: "Społeczność 200+ regularnych praktykujących" }
      ]
    },
    {
      title: "Moja Podróż Biznesowa",
      subtitle: "Od korporacji do własnej praktyki",
      description: "Od korporacji do własnej praktyki coachingowej - historia transformacji",
      timeline: [
        { year: "2012", title: "Start w Korporacji", description: "15 lat doświadczenia w zarządzaniu projektami" },
        { year: "2019", title: "Certyfikacja Coach", description: "Ukończenie programu ICF i ACC" },
        { year: "2022", title: "Własna Firma", description: "Rozpoczęcie praktyki coachingowej" },
        { year: "2025", title: "Obecnie", description: "Ponad 100 zadowolonych klientów" }
      ]
    },
    {
      title: "Ewolucja Artysty",
      subtitle: "Pasja do fotografii jako źródło inspiracji",
      description: "Jak pasja do fotografii stała się moim głównym źródłem inspiracji",
      timeline: [
        { year: "2016", title: "Pierwsze Zlecenia", description: "Początek zawodowej przygody z fotografią" },
        { year: "2019", title: "Własne Studio", description: "Profesjonalne wyposażenie i przestrzeń" },
        { year: "2022", title: "Nagrody", description: "Wyróżnienia w konkursach fotograficznych" },
        { year: "2025", title: "Dziś", description: "Setki udokumentowanych wyjątkowych momentów" }
      ]
    }
  ],
  grid: [
    {
      title: "Poznaj Moją Historię",
      subtitle: "Pasja do jogi i pomoc innym",
      description: "Jestem certyfikowaną instruktorką jogi z wieloletnim doświadczeniem w prowadzeniu sesji indywidualnych i grupowych. Moją misją jest pomoc w odnalezieniu równowagi między ciałem a umysłem.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      keyHighlights: [
        { icon: "star", title: "10+ lat praktyki", description: "Doświadczenie w różnych stylach jogi" },
        { icon: "award", title: "Certyfikacje", description: "RYT 500, instruktor mindfulness" },
        { icon: "users", title: "200+ uczniów", description: "Stała społeczność praktykujących" },
        { icon: "heart", title: "Holistyczne podejście", description: "Łączenie jogi z medytacją" }
      ]
    },
    {
      title: "Kim Jestem",
      subtitle: "Biznes coach z doświadczeniem korporacyjnym",
      description: "Jako biznes coach z 15-letnim doświadczeniem korporacyjnym, specjalizuję się w rozwoju liderów i transformacji organizacji. Pomagam przedsiębiorcom osiągać cele przy zachowaniu równowagi życiowej.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      keyHighlights: [
        { icon: "briefcase", title: "15 lat w biznesie", description: "Doświadczenie w zarządzaniu projektami" },
        { icon: "award", title: "Certyfikowany Coach", description: "ICF ACC, certyfikat z Harvard" },
        { icon: "users", title: "100+ klientów", description: "Firmy i indywidualni przedsiębiorcy" },
        { icon: "chart", title: "Mierzalne rezultaty", description: "Średnio 40% wzrost efektywności" }
      ]
    },
    {
      title: "Moja Pasja",
      subtitle: "Fotografia jako forma sztuki",
      description: "Jestem fotografem specjalizującym się w portretach i fotografii eventowej. Wierzę, że każdy moment zasługuje na to, by zostać uwieczniony w sposób autentyczny i artystyczny.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      keyHighlights: [
        { icon: "camera", title: "8 lat doświadczenia", description: "Setki zrealizowanych projektów" },
        { icon: "award", title: "Nagrody", description: "Wyróżnienia w konkursach" },
        { icon: "building", title: "Własne studio", description: "Profesjonalne wyposażenie" },
        { icon: "heart", title: "Indywidualne podejście", description: "Każda sesja jest wyjątkowa" }
      ]
    }
  ],
  narrative: [
    {
      title: "Moja Historia",
      subtitle: "Podróż z jogą jako styl życia",
      description: "Moja podróż z jogą rozpoczęła się 12 lat temu, gdy szukałam sposobu na radzenie sobie ze stresem. To, co zaczęło się jako osobista praktyka, przekształciło się w głęboką pasję do dzielenia się tym pięknem z innymi. Po latach nauki u najlepszych nauczycieli w Indiach i Europie, stworzyłam przestrzeń, gdzie każdy może odnaleźć swój własny rytm i spokój. Wierzę, że joga to nie tylko asany - to styl życia, który prowadzi do wewnętrznej harmonii.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      timeline: [
        { year: "2013", title: "Początek", description: "Pierwsza podróż do Indii i odkrycie jogi" },
        { year: "2016", title: "Certyfikacja", description: "Ukończenie kursu instruktorskiego RYT 500" },
        { year: "2020", title: "Własne Studio", description: "Otwarcie przestrzeni do praktyki" },
        { year: "2025", title: "Dziś", description: "Społeczność 200+ praktykujących" }
      ],
      keyHighlights: [
        { icon: "star", title: "12 lat praktyki", description: "Doświadczenie w różnych stylach jogi i medytacji" },
        { icon: "award", title: "Międzynarodowe certyfikaty", description: "RYT 500, instruktor mindfulness" },
        { icon: "heart", title: "Holistyczne podejście", description: "Łączenie jogi z terapią i medytacją" }
      ]
    },
    {
      title: "Dlaczego Coaching?",
      subtitle: "Od procesów do rozwoju ludzi",
      description: "Po 15 latach w korporacji, w których zarządzałam dużymi projektami i zespołami, odkryłam, że moją prawdziwą pasją jest rozwój ludzi, nie tylko procesów. Coaching pozwala mi łączyć moje biznesowe doświadczenie z głęboką satysfakcją z pomagania innym w osiąganiu ich celów. Każda sesja to nowa historia transformacji, a ja mam przywilej być jej częścią. Specjalizuję się w pracy z liderami i przedsiębiorcami, którzy chcą rozwijać swoje firmy nie tracąc przy tym siebie.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      timeline: [
        { year: "2010", title: "Kariera korporacyjna", description: "Start w zarządzaniu projektami" },
        { year: "2019", title: "Certyfikacja ICF", description: "Profesjonalne przygotowanie w coachingu" },
        { year: "2022", title: "Własna praktyka", description: "Pełnoetatowy coaching biznesowy" },
        { year: "2025", title: "100+ klientów", description: "Rozwijająca się praktyka i stali klienci" }
      ],
      keyHighlights: [
        { icon: "briefcase", title: "15 lat w biznesie", description: "Doświadczenie w zarządzaniu i strategii" },
        { icon: "award", title: "Certyfikowany Coach ICF", description: "Najwyższe standardy coachingu" },
        { icon: "chart", title: "Mierzalne efekty", description: "40% wzrost efektywności klientów" }
      ]
    },
    {
      title: "Fotografia to Moje Życie",
      subtitle: "Uchwycanie emocji i historii",
      description: "Odkryłam fotografię przypadkiem podczas podróży do Azji. Pierwsza seria zdjęć, którą zrobiłam, pokazała mi, że potrafię uchwycić nie tylko obraz, ale emocje i historie. Od tamtej pory minęło 8 lat intensywnej pracy, nauki i setek sesji. Każdy projekt traktuję jako możliwość opowiedzenia wyjątkowej historii. Specjalizuję się w portretach, które pokazują prawdziwą osobowość, oraz w fotografii eventowej, która uwiecznia autentyczne momenty radości.",
      image: `https://picsum.photos/seed/about-1/600/400`,
      timeline: [
        { year: "2017", title: "Pierwsze zlecenia", description: "Początek profesjonalnej fotografii" },
        { year: "2019", title: "Własne studio", description: "Pełne wyposażenie i przestrzeń" },
        { year: "2022", title: "Nagrody", description: "Wyróżnienia w konkursach" },
        { year: "2025", title: "Setki projektów", description: "Rozpoznawalna marka fotograficzna" }
      ],
      keyHighlights: [
        { icon: "camera", title: "8 lat doświadczenia", description: "Setki udanych sesji i projektów" },
        { icon: "award", title: "Nagrody fotograficzne", description: "Wyróżnienia w konkursach krajowych" },
        { icon: "heart", title: "Artystyczne podejście", description: "Każda sesja jako unikalna historia" }
      ]
    }
  ]
};

