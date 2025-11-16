// Helper function for generating random seeds for Picsum
const randomSeed = () => Math.random().toString(36).substring(7);

export const SERVICES_DESCRIPTOR = {
  type: 'servicesAndPricing',
  desc: 'Sekcja oferty i cennika',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji', category: 'content' },
    subtitle: { t: 'text', d: 'Podtytuł', category: 'content' },
    serviceItems: { 
      t: 'array', 
      d: 'Service items', 
      category: 'content'
    },
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
  cards: [
    {
      title: 'Wellness & Movement',
      subtitle: 'Kompleksowa oferta praktyk dla ciała i umysłu',
      offers: [
        { 
          name: 'Karnet 8 wejść', 
          description: 'Elastyczny miesięczny karnet na zajęcia grupowe. Idealne rozwiązanie dla osób początkujących swoją przygodę z regularną praktyką.', 
          price: '320', 
          category: 'Karnety', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Karnet Premium Unlimited', 
          description: 'Nielimitowany dostęp do wszystkich zajęć grupowych oraz dwie sesje indywidualne miesięcznie. Zawiera również dostęp do biblioteki praktyk online.', 
          price: '540', 
          category: 'Karnety', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Sesja Indywidualna 60 min', 
          description: 'Spersonalizowana praktyka dopasowana do Twoich potrzeb, uwzględniająca stan ciała, oddech i intencję.', 
          price: '180', 
          category: 'Indywidualne', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Warsztat Weekendowy', 
          description: 'Trzygodzinna intensywna praktyka tematyczna. Obejmuje teorię, praktykę i czas na integrację doświadczeń.', 
          price: '140', 
          category: 'Warsztaty', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Professional Coaching',
      subtitle: 'Programy rozwojowe dla liderów i zespołów',
      offers: [
        { 
          name: 'Start Up Intensive', 
          description: 'Sześć sesji po 75 minut z planem działania i materiałami rozwojowymi. Dla osób rozpoczynających swoją ścieżkę rozwoju zawodowego.', 
          price: '2700', 
          category: 'Pakiety', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Growth Accelerator', 
          description: 'Dwunastotygodniowy program obejmujący regularne sesje coachingowe, wsparcie mailowe oraz dostęp do społeczności praktyków.', 
          price: '5800', 
          category: 'Pakiety', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Executive Leadership Program', 
          description: 'Kompleksowy program dla kadry zarządzającej. Dwadzieścia sesji indywidualnych, strategia rozwoju oraz warsztaty zespołowe.', 
          price: '13500', 
          category: 'Premium', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Sesja Coachingowa 90 min', 
          description: 'Pojedyncza sesja coachingowa z doświadczonym praktykiem. Dla osób potrzebujących wsparcia w konkretnej sytuacji biznesowej.', 
          price: '480', 
          category: 'Pojedyncze', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Visual Storytelling',
      subtitle: 'Profesjonalne sesje zdjęciowe dla marek osobistych',
      offers: [
        { 
          name: 'Brand Essentials', 
          description: 'Godzinna sesja zdjęciowa w wybranej lokalizacji. Otrzymujesz 30 starannie wyselekcjonowanych i obrobionych fotografii gotowych do publikacji.', 
          price: '450', 
          category: 'Sesje', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Premium Brand Story', 
          description: 'Dwugodzinna sesja z retuszem profesjonalnym, wybranymi wydrukami i mood boardem brandowym. Idealne dla twórców budujących silną markę osobistą.', 
          price: '900', 
          category: 'Sesje', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Event Coverage Full Day', 
          description: 'Kompleksowa obsługa fotograficzna wydarzeń do ośmiu godzin. Dwóch fotografów, album cyfrowy i materiały promocyjne.', 
          price: '2800', 
          category: 'Eventy', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        },
        { 
          name: 'Business Portrait Session', 
          description: 'Profesjonalne zdjęcia biznesowe do profilu LinkedIn, strony internetowej i materiałów promocyjnych. Sesja w studio lub wybranej lokalizacji.', 
          price: '380', 
          category: 'Biznes', 
          image: `https://picsum.photos/seed/${randomSeed()}/600/400` 
        }
      ],
      currency: 'PLN'
    }
  ],
  list: [
    {
      title: 'Movement & Bodywork',
      subtitle: 'Przejrzysta lista wszystkich usług z terminami i cenami',
      offers: [
        { 
          name: 'Zajęcia Drop-in', 
          description: 'Pojedyncze wejście na zajęcia grupowe bez zobowiązań. Dowolny termin w harmonogramie.', 
          price: '55', 
          category: 'Pojedyncze' 
        },
        { 
          name: 'Karnet 4 wejścia', 
          description: 'Elastyczny karnet ważny 30 dni od daty zakupu. Rezerwacja miejsc przez panel klienta.', 
          price: '200', 
          category: 'Karnety' 
        },
        { 
          name: 'Karnet 12 wejść', 
          description: 'Najkorzystniejsza opcja dla regularnie ćwiczących. Ważność 60 dni, możliwość zamrożenia.', 
          price: '480', 
          category: 'Karnety' 
        },
        { 
          name: 'Sesja Indywidualna 90 min', 
          description: 'Rozszerzona sesja personalna z elementami terapii manualnej i breathwork. Zawiera konsultację i plan praktyki domowej.', 
          price: '240', 
          category: 'Indywidualne' 
        },
        { 
          name: 'Pakiet 5 Sesji Indywidualnych', 
          description: 'Cykliczne sesje indywidualne w atrakcyjnej cenie. Idealne dla pracy z konkretnym celem lub obszarem ciała.', 
          price: '850', 
          category: 'Pakiety' 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Leadership Development',
      subtitle: 'Usługi coachingowe i rozwojowe dla profesjonalistów',
      offers: [
        { 
          name: 'Sesja Diagnostyczna', 
          description: 'Pierwsze spotkanie poznawcze z mapowaniem celów i wyzwań. Otrzymujesz spersonalizowany raport i rekomendacje dalszej pracy.', 
          price: '350', 
          category: 'Sesje' 
        },
        { 
          name: 'Coaching Indywidualny 90 min', 
          description: 'Sesja coachingowa skoncentrowana na konkretnym wyzwaniu zawodowym. Praca z metodą GROW i narzędziami systemowymi.', 
          price: '480', 
          category: 'Sesje' 
        },
        { 
          name: 'Team Coaching 2h', 
          description: 'Sesja dla zespołów do dziesięciu osób. Facylitacja dynamiki grupowej, komunikacji i współpracy.', 
          price: '900', 
          category: 'Zespołowe' 
        },
        { 
          name: 'Corporate Workshop Full Day', 
          description: 'Intensywny warsztat firmowy dostosowany do potrzeb organizacji. Materiały, catering i follow-up w cenie.', 
          price: '3800', 
          category: 'Warsztaty' 
        },
        { 
          name: 'Mentoring Program 3 miesiące', 
          description: 'Długoterminowe wsparcie w rozwoju zawodowym. Dwanaście sesji, nielimitowany kontakt mailowy i dostęp do zasobów.', 
          price: '4900', 
          category: 'Mentoring' 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Photography Services',
      subtitle: 'Portfolio usług fotograficznych dla różnych potrzeb',
      offers: [
        { 
          name: 'Portrait Session 60 min', 
          description: 'Sesja portretowa w studio lub plenerze. Trzydzieści wyselekcjonowanych zdjęć z profesjonalną obróbką.', 
          price: '420', 
          category: 'Portrety' 
        },
        { 
          name: 'Family Session 2h', 
          description: 'Sesja rodzinna w wybranej lokalizacji outdoor. Sześćdziesiąt zdjęć uchwycających autentyczne chwile i emocje.', 
          price: '750', 
          category: 'Rodzinne' 
        },
        { 
          name: 'Maternity Session', 
          description: 'Delikatna sesja ciążowa uwieczniająca wyjątkowy czas oczekiwania. Możliwość realizacji w studio lub domowym zaciszu.', 
          price: '480', 
          category: 'Specjalne' 
        },
        { 
          name: 'Newborn Session', 
          description: 'Sesja z noworodkiem do czternastego dnia życia. Przeprowadzana w spokojnym tempie z uwzględnieniem potrzeb malucha.', 
          price: '650', 
          category: 'Specjalne' 
        },
        { 
          name: 'Product Photography', 
          description: 'Fotografia produktowa w studio z profesjonalnym oświetleniem. Do dwudziestu produktów z retuszem i optimalizacją do e-commerce.', 
          price: '880', 
          category: 'Komercyjne' 
        }
      ],
      currency: 'PLN'
    }
  ],
  table: [
    {
      title: 'Porównanie pakietów',
      subtitle: 'Znajdź idealną opcję dla swoich potrzeb',
      offers: [
        { 
          name: 'Starter Package', 
          description: 'Osiem wejść na zajęcia grupowe oraz dostęp do biblioteki video z nagraniami praktyk. Idealne na początek przygody.', 
          price: '320', 
          category: 'Standard' 
        },
        { 
          name: 'Regular Package', 
          description: 'Dwanaście wejść ważnych dwa miesiące plus jedna sesja indywidualna. Najczęściej wybierana opcja przez praktykujących.', 
          price: '450', 
          category: 'Standard' 
        },
        { 
          name: 'Premium Unlimited', 
          description: 'Nielimitowany dostęp do zajęć oraz dwie sesje indywidualne miesięcznie. Pełna elastyczność i wsparcie.', 
          price: '580', 
          category: 'Premium' 
        },
        { 
          name: 'VIP All-Inclusive', 
          description: 'Pakiet Premium rozszerzony o cztery sesje indywidualne oraz udział w wyjazdowym retreatcie. Kompleksowa transformacja.', 
          price: '920', 
          category: 'VIP' 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Coaching Comparison',
      subtitle: 'Dopasuj program do swojego etapu rozwoju',
      offers: [
        { 
          name: 'Start Up Foundation', 
          description: 'Sześć sesji coachingowych po 75 minut z bieżącym wsparciem mailowym. Podstawa rozwoju dla początkujących liderów.', 
          price: '2700', 
          category: 'Podstawowy' 
        },
        { 
          name: 'Growth Accelerator', 
          description: 'Dwanaście sesji z nieograniczonym dostępem do coach przez komunikatory. Program dla osób gotowych na intensywny rozwój.', 
          price: '5900', 
          category: 'Rozszerzony' 
        },
        { 
          name: 'Executive Mastery', 
          description: 'Dwadzieścia sesji indywidualnych, warsztaty grupowe, strategia biznesowa i kompleksowe wsparcie. Program dla kadry zarządzającej.', 
          price: '13500', 
          category: 'Premium' 
        },
        { 
          name: 'Custom Tailored', 
          description: 'Program całkowicie dopasowany do Twoich unikalnych potrzeb i celów biznesowych. Konsultacja i wycena indywidualna.', 
          price: 'Na zapytanie', 
          category: 'Dedykowany' 
        }
      ],
      currency: 'PLN'
    },
    {
      title: 'Photography Packages',
      subtitle: 'Przejrzyste pakiety dla każdego budżetu',
      offers: [
        { 
          name: 'Express Mini Session', 
          description: 'Pół godziny dynamicznej sesji idealna na szybkie ujęcia. Piętnaście zdjęć z podstawową obróbką kolorystyczną.', 
          price: '280', 
          category: 'Mini' 
        },
        { 
          name: 'Standard Brand Session', 
          description: 'Godzinna sesja z trzydziestoma zdjęciami po profesjonalnej obróbce. Dobre wyjście dla marek budujących obecność online.', 
          price: '450', 
          category: 'Standard' 
        },
        { 
          name: 'Premium Brand Story', 
          description: 'Dwie godziny pracy, sześćdziesiąt zdjęć z retuszem portretowym oraz wybrane wydruki premium. Kompleksowa narracja wizualna.', 
          price: '880', 
          category: 'Premium' 
        },
        { 
          name: 'Exclusive Full Coverage', 
          description: 'Czterogodzinna sesja lifestyle, sto zdjęć, profesjonalny album fotograficzny i kolekcja wydruków artystycznych. Pełna opowieść.', 
          price: '1680', 
          category: 'Exclusive' 
        }
      ],
      currency: 'PLN'
    }
  ]
};

export const SERVICES_AND_PRICING_DEFAULTS = {
  cards: [
    {
      title: 'Pakiety Wellness',
      subtitle: 'Połącz indywidualną praktykę z regeneracją ciała i głowy',
      currency: 'PLN',
      bgColor: '#FDFCF9',
      textColor: 'rgb(30, 30, 30)',
      accentColor: 'rgb(146, 0, 32)',
      offers: [
        {
          id: 'spa-essence',
          name: 'Essence 1:1',
          category: 'Indywidualnie',
          description: '<p>60 minut pracy nad oddechem, uważnością i rozluźnieniem powięziowym.</p>',
          price: '220',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'spa-ritual',
          name: 'Weekend Ritual',
          category: 'Weekend',
          description: '<p>2 noclegi, 4 sesje jogi, sauna i kuchnia roślinna w kameralnej grupie.</p>',
          price: '960',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'spa-retreat',
          name: 'Full Retreat',
          category: 'Retreat',
          description: '<p>Autorski wyjazd od piątku do niedzieli z warsztatami i konsultacją 1:1.</p>',
          price: '1480',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        }
      ]
    },
    {
      title: 'Programy Coachingowe',
      subtitle: 'Wybierz ścieżkę dopasowaną do Twoich potrzeb biznesowych',
      currency: 'PLN',
      bgColor: '#FFFFFF',
      textColor: 'rgb(30, 30, 30)',
      accentColor: 'rgb(39, 70, 144)',
      offers: [
        {
          id: 'coach-focus',
          name: 'Focus Sprint',
          category: '4 tygodnie',
          description: '<p>4 sesje po 75 minut + plan działania i check-in na Slacku.</p>',
          price: '2800',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'coach-growth',
          name: 'Growth Lab',
          category: '3 miesiące',
          description: '<p>12 spotkań, dostęp do materiałów premium i warsztatów Q&A.</p>',
          price: '7200',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'coach-exec',
          name: 'Executive Circle',
          category: 'Elitarny',
          description: '<p>Indywidualny mentoring dla liderów + sesje zespołowe i audyty.</p>',
          price: '14800',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        }
      ]
    },
    {
      title: 'Studio Kreatywne',
      subtitle: 'Oferta fotograficzna + pakiety contentowe',
      currency: 'PLN',
      bgColor: '#FAFBFF',
      textColor: 'rgb(30, 30, 30)',
      accentColor: 'rgb(13, 90, 150)',
      offers: [
        {
          id: 'studio-basic',
          name: 'Basic Branding',
          category: 'Sesja',
          description: '<p>2h zdjęć studyjnych + 30 ujęć po retuszu i moodboard brandowy.</p>',
          price: '980',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'studio-pro',
          name: 'Pro Content Day',
          category: 'Dzień zdjęciowy',
          description: '<p>6h pracy, wideo behind-the-scenes, pakiet stories + 60 zdjęć ready-to-post.</p>',
          price: '2100',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        },
        {
          id: 'studio-subscription',
          name: 'Monthly Subscription',
          category: 'Abonament',
          description: '<p>Stała obsługa contentowa: 1 dzień zdjęciowy / mc + strategia.</p>',
          price: '3500',
          image: `https://picsum.photos/seed/${randomSeed()}/600/400`
        }
      ]
    }
  ],
  list: [
    {
      title: 'Oferta Indywidualna',
      subtitle: 'Zaprojektowana dla osób, które chcą wrócić do formy we własnym tempie',
      currency: 'PLN',
      offers: [
        { id: 'list-dropin', name: 'Sesja drop-in', category: 'Jednorazowo', description: '50 minut dopasowanej praktyki', price: '180' },
        { id: 'list-pass', name: 'Pakiet 4 spotkań', category: 'Pakiet', description: 'Cykle tygodniowe + materiały PDF', price: '640' },
        { id: 'list-intensive', name: 'Intensywny miesiąc', category: 'Program', description: '8 spotkań + plan praktyki + kontakt na Whatsapp', price: '1180' }
      ]
    },
    {
      title: 'Oferta dla firm',
      subtitle: 'Outsourcing dobrostanu dla zespołów pracujących hybrydowo',
      currency: 'PLN',
      offers: [
        { id: 'b2b-stretch', name: 'Stretch & Focus', category: 'Warsztat 90 min', description: 'Łączy ruch, oddech i ergonomię pracy przy biurku', price: '850' },
        { id: 'b2b-cycle', name: 'Program 6 tygodni', category: 'Program', description: '6 spotkań online, workbook, raport wdrożeń', price: '4200' },
        { id: 'b2b-offsite', name: 'Mindful Offsite', category: 'Event', description: 'Całodniowy wyjazd integracyjny z praktyką i cateringiem', price: '8900' }
      ]
    },
    {
      title: 'Studio Contentowe',
      subtitle: 'Kompleksowe pakiety foto + social copy dla marek osobistych',
      currency: 'PLN',
      offers: [
        { id: 'content-mini', name: 'Mini content day', category: '2h', description: '25 zdjęć + 5 gotowych opisów na IG', price: '890' },
        { id: 'content-standard', name: 'Standard content day', category: '4h', description: '40 zdjęć + 10 opisów + plan publikacji', price: '1650' },
        { id: 'content-premium', name: 'Premium storytelling', category: '8h', description: '60 zdjęć, reels, strategie highlightów i newsletter', price: '3100' }
      ]
    }
  ],
  table: [
    {
      title: 'Porównanie pakietów',
      subtitle: 'Wszystkie pakiety zawierają materiały video i wsparcie mailowe',
      currency: 'PLN',
      offers: [
        { id: 'table-basic', name: 'Basic', category: 'Starter', description: '4 spotkania, plan PDF, dostęp do biblioteki', price: '640' },
        { id: 'table-regular', name: 'Regular', category: 'Popularne', description: '8 spotkań, konsultacja dietetyczna, check-in audio', price: '1180' },
        { id: 'table-premium', name: 'Premium', category: 'VIP', description: '12 spotkań, wsparcie 24/7, warsztat oddechowy', price: '1780' }
      ]
    },
    {
      title: 'Pakiety sesji foto',
      subtitle: 'Cena zawiera retusz i gotowe pliki do social media',
      currency: 'PLN',
      offers: [
        { id: 'photo-mini', name: 'Mini', category: 'Studio', description: '60 minut, 20 zdjęć, 1 stylizacja', price: '650' },
        { id: 'photo-brand', name: 'Brand Day', category: 'Lokalizacja', description: '3h, 45 zdjęć, moodboard, stories BTS', price: '1650' },
        { id: 'photo-team', name: 'Team Deluxe', category: 'Firma', description: '5h, zdjęcia dla 6 osób + zdjęcia wnętrz', price: '3150' }
      ]
    },
    {
      title: 'Program mentoringowy',
      subtitle: 'Łączy sesje strategiczne z pracą wdrożeniową',
      currency: 'PLN',
      offers: [
        { id: 'mentor-start', name: 'Start', category: '1 miesiąc', description: '4 spotkania, plan rozwoju, audyt komunikacji', price: '3900' },
        { id: 'mentor-grow', name: 'Grow', category: '3 miesiące', description: '12 spotkań, proces celów OKR, warsztaty zespołowe', price: '9400' },
        { id: 'mentor-elite', name: 'Elite', category: '6 miesięcy', description: '24 spotkania, sesje shadowing, roadmap marketingowa', price: '16800' }
      ]
    }
  ]
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
  grid: [
    {
      title: 'Poznaj nasz zespół',
      subtitle: 'Instruktorzy, którzy poprowadzą Cię przez praktykę',
      members: [
        { name: 'Anna Kowalska', role: 'Założycielka & Instruktorka Główna', bio: 'Praktykuję jogę od 15 lat. Certyfikowana instruktorka RYT 500 i mindfulness. Specjalizuję się w Hatha i Vinyasa Yoga.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Jan Nowak', role: 'Instruktor Vinyasa Flow', bio: '8 lat doświadczenia w prowadzeniu dynamicznych praktyk. Pasjonat filozofii jogi i ajurwedy.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Maria Wiśniewska', role: 'Instruktorka Medytacji', bio: 'Specjalistka od praktyk medytacyjnych i Joga Nidra. Pomaga odnaleźć spokój w codziennym życiu.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Piotr Zieliński', role: 'Instruktor Jogi Terapeutycznej', bio: 'Fizjoterapeuta i instruktor jogi. Łączy wiedzę medyczną z praktyką dla bezpiecznego rozwoju.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Nasi Eksperci',
      subtitle: 'Doświadczeni coachowie i mentorzy',
      members: [
        { name: 'Michał Kowalski', role: 'Główny Coach & Founder', bio: '15 lat w biznesie korporacyjnym, certyfikowany coach ICF ACC. Specjalizacja: leadership i transformacja biznesowa.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Katarzyna Nowak', role: 'Career Coach', bio: 'Pomaga w rozwoju kariery i zmianie ścieżki zawodowej. HR z 10-letnim doświadczeniem.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Tomasz Wiśniewski', role: 'Executive Coach', bio: 'Były CEO, teraz wspiera liderów w osiąganiu szczytów. Mentor dla top management.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Poznaj Nas',
      subtitle: 'Twórcy wyjątkowych kadrów',
      members: [
        { name: 'Piotr Wiśniewski', role: 'Fotograf Główny & Założyciel', bio: '10 lat doświadczenia w fotografii portretowej i ślubnej. Nagrody w konkursach fotograficznych.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Anna Lewandowska', role: 'Fotograf Eventowy', bio: 'Specjalistka od reportaży ślubnych i eventowych. Uwiecznia emocje i autentyczne momenty.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Marek Kowalczyk', role: 'Fotograf Produktowy', bio: 'Specjalizacja: fotografia komercyjna i produktowa dla e-commerce i brandów.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Ewa Zielińska', role: 'Retuszerka & Edytorka', bio: 'Magik post-produkcji. Każde zdjęcie dopracowuje do perfekcji z zachowaniem naturalności.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    }
  ],
  carousel: [
    {
      title: 'Nasz zespół',
      subtitle: 'Pasja i profesjonalizm',
      members: [
        { name: 'Kasia Nowak', role: 'Yin Yoga Instructor', bio: 'Prowadzę spokojne, regenerujące praktyki Yin. Idealne po intensywnym dniu.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Bartek Kowalski', role: 'Ashtanga Instructor', bio: 'Tradycyjna praktyka Ashtangi w moim wykonaniu. Dla tych, którzy lubią wyzwania.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Zosia Wiśniewska', role: 'Kids Yoga', bio: 'Pracuję z dziećmi, ucząc je świadomości ciała i umysłu przez zabawę.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Zespół Coachów',
      subtitle: 'Wspieramy Twój rozwój',
      members: [
        { name: 'Agnieszka Malinowska', role: 'Life Coach', bio: 'Specjalizuję się w work-life balance i rozwoju osobistym. Pomagam odnaleźć równowagę.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Robert Nowicki', role: 'Team Coach', bio: 'Buduję efektywne zespoły. Pracuję z firmami nad komunikacją i współpracą.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Monika Zielińska', role: 'Wellness Coach', bio: 'Łączę coaching z podejściem holistycznym. Ciało, umysł i dusza w harmonii.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Studio Team',
      subtitle: 'Profesjonaliści za obiektywem',
      members: [
        { name: 'Jakub Nowak', role: 'Asystent Fotografa', bio: 'Wspieram przy dużych sesjach i eventach. Uczę się od najlepszych.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Kasia Lewandowska', role: 'Stylistka', bio: 'Dbam o wygląd podczas sesji - fryzury, makijaż, styling. Sprawiamy, że wyglądasz perfekcyjnie.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Tomasz Kowalczyk', role: 'Oświetleniowiec', bio: 'Magik światła. Każda sesja to dla mnie szansa na stworzenie idealnego oświetlenia.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    }
  ],
  list: [
    {
      title: 'Zespół',
      subtitle: 'Poznaj ludzi, którzy tworzą naszą społeczność',
      members: [
        { name: 'Laura Kowalska', role: 'Kundalini Instructor', bio: 'Prowadzę praktyki Kundalini Yoga - energetyczne przebudzenie i transformacja.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Marcin Nowak', role: 'Pranayama Specialist', bio: 'Specjalizuję się w technikach oddechowych. Oddech to życie - naucz się go kontrolować.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Ania Zielińska', role: 'Prenatal Yoga', bio: 'Pracuję z kobietami w ciąży, przygotowując je na poród i macierzyństwo.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Nasi Specjaliści',
      subtitle: 'Eksperci w swoich dziedzinach',
      members: [
        { name: 'Paweł Wiśniewski', role: 'Business Strategy Coach', bio: 'Pomagam firmom w tworzeniu i realizacji strategii wzrostu. MBA, 20 lat doświadczenia.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Ewa Kowalczyk', role: 'Mindfulness Coach', bio: 'Uczę uważności w życiu zawodowym. Mindfulness to klucz do efektywności bez stresu.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Kamil Nowicki', role: 'Sales Coach', bio: 'Trenuję zespoły sprzedażowe. Zwiększam skuteczność przez rozwój kompetencji.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    },
    {
      title: 'Nasz Zespół Kreatywny',
      subtitle: 'Wszyscy zaangażowani w Twój sukces',
      members: [
        { name: 'Magda Kowalska', role: 'Menedżer Studia', bio: 'Koordynuję wszystkie sesje i dbam o płynną organizację. Pierwszy kontakt dla klientów.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Wojtek Nowak', role: 'Videograf', bio: 'Oprócz foto robimy też video. Tworzę filmy z sesji i eventów.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` },
        { name: 'Ola Wiśniewska', role: 'Grafik', bio: 'Projektuję albumy, zaproszenia i wszystkie materiały graficzne dla klientów.', image: `https://picsum.photos/seed/${randomSeed()}/400/400` }
      ]
    }
  ]
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
