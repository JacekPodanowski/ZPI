import composeSiteStyle from '../../SITES/styles/utils';
import { DEFAULT_STYLE_ID } from '../../SITES/styles';

export const createDefaultTemplateConfig = () => {
  const styleId = DEFAULT_STYLE_ID;
  const style = composeSiteStyle(styleId);

  return {
    name: 'Wellness Template',
    styleId,
    styleOverrides: {},
    style,
    pageOrder: [
    'home',
    'about',
    'services',
    'calendar',
    'events',
    'faq',
    'team',
    'blog',
    'gallery',
    'contact'
    ],
    siteStructure: 'multi-page',
    pages: {
    home: {
      id: 'home',
      name: 'Strona Główna',
      path: '/',
      modules: [
        {
          id: 'hero',
          name: 'Strona Główna',
          type: 'hero',
          enabled: true,
          order: 0,
          config: {
            title: 'Witaj w Świecie Wellness',
            subtitle: 'Odkryj harmonię ciała i umysłu',
            bgColor: 'rgb(228, 229, 218)',
            textColor: 'rgb(30, 30, 30)',
            backgroundImage: ''
          }
        }
      ]
    },
    about: {
      id: 'about',
      name: 'O Mnie',
      path: '/o-mnie',
      modules: [
        {
          id: 'about',
          name: 'O Mnie',
          type: 'about',
          enabled: true,
          order: 0,
          config: {
            title: 'O Mnie',
            description: 'Jestem certyfikowanym instruktorem wellness z pasją do zdrowego stylu życia.',
            imageUrl: '',
            avatar: '',
            email: 'kontakt@wellness.pl',
            phone: '+48 123 456 789',
            bgColor: 'rgb(228, 229, 218)'
          }
        }
      ]
    },
    calendar: {
      id: 'calendar',
      name: 'Kalendarz',
      path: '/kalendarz',
      modules: [
        {
          id: 'calendar',
          name: 'Kalendarz',
          type: 'calendar',
          enabled: true,
          order: 0,
          config: {
            title: 'Zarezerwuj Termin',
            color: 'rgb(146, 0, 32)',
            bgColor: 'rgb(255, 255, 255)',
            minInterval: 15,
            allowIndividual: true,
            allowGroup: true
          }
        }
      ]
    },
    contact: {
      id: 'contact',
      name: 'Kontakt',
      path: '/kontakt',
      modules: [
        {
          id: 'contact',
          name: 'Formularz kontaktowy',
          type: 'contactForm',
          enabled: true,
          order: 0,
          config: {
            email: 'kontakt@wellness.pl',
            phone: '+48 123 456 789',
            bgColor: 'rgb(255, 255, 255)'
          }
        }
      ]
    },
    gallery: {
      id: 'gallery',
      name: 'Galeria',
      path: '/galeria',
      modules: [
        {
          id: 'gallery_module_main',
          type: 'gallery',
          name: 'Nasze Prace',
          enabled: true,
          order: 0,
          config: {
            images: [],
            columns: 3,
            gap: '1rem',
            style: 'masonry'
          }
        }
      ]
    },
    services: {
      id: 'services',
      name: 'Oferta',
      path: '/oferta',
      modules: [
        {
          id: 'default_services',
          type: 'services',
          name: 'Oferta',
          enabled: true,
          order: 0,
          config: {
            title: 'Oferta',
            subtitle: 'Poznaj naszą ofertę i przejrzyste ceny',
            bgColor: '#FFFFFF',
            textColor: 'rgb(30, 30, 30)',
            accentColor: 'rgb(146, 0, 32)',
            currency: 'PLN',
            services: [
              {
                id: `service-${Date.now()}-1`,
                name: 'Sesja indywidualna',
                category: '1:1',
                description: '<p>60 minut pracy dopasowanej do Twoich potrzeb. Podczas sesji skupiamy się na Twoich celach i wyzwaniach. Otrzymujesz spersonalizowany plan praktyki domowej oraz wsparcie w jego realizacji. Każde spotkanie to przestrzeń na rozwój i autentyczne odkrywanie siebie. Sesje prowadzone są w kameralnej atmosferze sprzyjającej głębokiej pracy. Możliwość rezerwacji sesji stacjonarnych lub online. Dedykowane osobom poszukującym indywidualnego podejścia. Pierwsze spotkanie zawiera szczegółową konsultację i diagnozę potrzeb.</p>',
                price: '180',
                image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `service-${Date.now()}-2`,
                name: 'Karnet 4 spotkania',
                category: 'Pakiet',
                description: '<p>4 tygodnie systematycznej praktyki z dostępem do nagrań wszystkich sesji. Program zapewnia kompleksowe wsparcie w budowaniu regularnej rutyny. Otrzymujesz ekskluzywny dostęp do biblioteki nagrań medytacyjnych i ćwiczeń. Karnet obejmuje zniżki na warsztaty tematyczne i wydarzenia specjalne. Elastyczny harmonogram dostosowany do Twojego stylu życia. Możliwość przedłużenia ważności karnetu w uzasadnionych przypadkach. Idealne rozwiązanie dla osób chcących zaangażować się w dłuższą praktykę. Dodatkowy bonus: konsultacja online w połowie programu.</p>',
                price: '640',
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `service-${Date.now()}-3`,
                name: 'Warsztaty grupowe',
                category: 'Grupa',
                description: '<p>Kameralne spotkania tematyczne rozwijające świadomość ciała i oddechu. Każdy warsztat to 3 godziny intensywnej pracy w grupie maksymalnie 12 osób. Tworzymy bezpieczną przestrzeń do eksploracji i wymiany doświadczeń. Program obejmuje praktykę ruchową, techniki oddechowe oraz medytację prowadzoną. Uczestników łączymy w pary wspierające się nawzajem w praktyce. Po warsztacie otrzymujesz zestaw materiałów do samodzielnej pracy. Regularne tematy obejmują zarządzanie stresem, poprawę snu i budowanie odporności. Dołącz do społeczności praktykujących i rozwijaj się w inspirującym towarzystwie.</p>',
                price: '120',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `service-${Date.now()}-4`,
                name: 'Program oddechowy',
                category: 'Online',
                description: '<p>Czterotygodniowy cykl spotkań online z kompleksowym podejściem do pracy z oddechem. Każdy tydzień to nowa technika i pogłębianie świadomości. Otrzymujesz dostęp do nagrań wszystkich sesji oraz materiałów PDF z instrukcjami. Program prowadzi certyfikowany instruktor z wieloletnim doświadczeniem. Spotkania odbywają się na żywo przez Zoom z możliwością zadawania pytań. Dodatkowe wsparcie poprzez grupę zamkniętą na komunikatorze. Uczysz się technik, które możesz stosować codziennie dla poprawy samopoczucia. Idealne dla osób pracujących, które cenią elastyczność i wygodę nauki online.</p>',
                price: '450',
                image: 'https://images.unsplash.com/photo-1526674183561-3a54354ceaba?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `service-${Date.now()}-5`,
                name: 'Program regeneracyjny',
                category: 'Weekend',
                description: '<p>Weekend w kameralnej grupie z pełnym wyżywieniem i kompleksowym programem odnowy. Dwa dni intensywnej praktyki w pięknym, spokojnym otoczeniu z dala od miejskiego zgiełku. Program obejmuje sesje poranne i wieczorne, warsztaty tematyczne oraz czas na indywidualną refleksję. Otrzymujesz zestaw nagrań medytacyjnych do dalszej praktyki w domu. Posiłki przygotowane z lokalnych, ekologicznych produktów wspierających regenerację organizmu. Zakwaterowanie w komfortowych pokojach 1-2 osobowych zapewniających prywatność i wypoczynek. Maksymalnie 16 uczestników gwarantuje kameralną atmosferę i indywidualne podejście. Idealne dla osób potrzebujących głębokiego resetu i oderwania się od codziennych obowiązków.</p>',
                price: '920',
                image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60'
              }
            ]
          }
        }
      ]
    },
    faq: {
      id: 'faq',
      name: 'FAQ',
      path: '/faq',
      modules: [
        {
          id: 'default_faq',
          type: 'faq',
          name: 'Najczęstsze pytania',
          enabled: true,
          order: 0,
          config: {
            title: 'Najczęściej zadawane pytania',
            intro: 'Szybkie odpowiedzi na podstawowe zagadnienia organizacyjne.',
            bgColor: '#FFFFFF',
            textColor: 'rgb(30, 30, 30)',
            items: []
          }
        }
      ]
    },
    team: {
      id: 'team',
      name: 'Zespół',
      path: '/zespol',
      modules: [
        {
          id: 'default_team',
          type: 'team',
          name: 'Zespół',
          enabled: true,
          order: 0,
          config: {
            title: 'Poznaj nasz zespół',
            subtitle: 'Instruktorzy i specjalistki, które czuwają nad Twoją praktyką',
            bgColor: '#FFFFFF',
            textColor: 'rgb(30, 30, 30)',
            accentColor: 'rgb(146, 0, 32)',
            members: []
          }
        }
      ]
    },
    events: {
      id: 'events',
      name: 'Wydarzenia',
      path: '/wydarzenia',
      modules: [
        {
          id: 'default_events',
          type: 'events',
          name: 'Nadchodzące wydarzenia',
          enabled: true,
          order: 0,
          config: {
            title: 'Nadchodzące wydarzenia',
            subtitle: 'Dołącz do wyjątkowych spotkań i warsztatów',
            bgColor: '#FFFFFF',
            textColor: 'rgb(30, 30, 30)',
            accentColor: 'rgb(146, 0, 32)',
            events: []
          }
        }
      ]
    },
    blog: {
      id: 'blog',
      name: 'Blog',
      path: '/blog',
      modules: [
        {
          id: 'default_blog',
          type: 'blog',
          name: 'Aktualności',
          enabled: true,
          order: 0,
          config: {
            title: 'Aktualności',
            subtitle: 'Bądź na bieżąco z naszymi projektami',
            bgColor: '#FFFFFF',
            textColor: 'rgb(30, 30, 30)',
            posts: []
          }
        }
      ]
    }
  }
  };
};

const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))

export const buildTemplateFromModules = (moduleIds, siteName = 'Moja Strona', category = 'wellness') => {
  const moduleToPageMap = {
    publicCalendar: 'calendar',
    publicCalendarBig: 'calendar',
    publicCalendarSmall: 'calendar',
    calendar: 'calendar',
    about: 'about',
    services: 'services',
    servicesAndPricing: 'services',
    events: 'events',
    faq: 'faq',
    team: 'team',
    blog: 'blog',
    gallery: 'gallery',
    contact: 'contact'
  }

  const defaultConfig = createDefaultTemplateConfig()
  const newConfig = {
    ...defaultConfig,
    name: siteName,
    pageOrder: [],
    pages: {
      home: defaultConfig.pages.home
    }
  }

  moduleIds.forEach((moduleId) => {
    const pageKey = moduleToPageMap[moduleId]
    if (pageKey && defaultConfig.pages[pageKey]) {
      if (!newConfig.pageOrder.includes(pageKey)) {
        newConfig.pageOrder.push(pageKey)
      }
      newConfig.pages[pageKey] = deepClone(defaultConfig.pages[pageKey])
    }
  })

  if (!newConfig.pageOrder.includes('home')) {
    newConfig.pageOrder.unshift('home')
  }

  newConfig.category = category
  newConfig.modules = Array.from(new Set(moduleIds))

  return newConfig
}

export const getDefaultTemplateConfig = createDefaultTemplateConfig
