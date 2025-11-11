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
    'servicesAndPricing',
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
    servicesAndPricing: {
      id: 'servicesAndPricing',
      name: 'Oferta',
      path: '/oferta',
      modules: [
        {
          id: 'default_services_and_pricing',
          type: 'servicesAndPricing',
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
            offers: [
              {
                id: `offer-${Date.now()}-1`,
                name: 'Sesja indywidualna',
                category: '1:1',
                description: '<p>60 minut pracy dopasowanej do Twoich potrzeb. Otrzymujesz plan praktyki domowej.</p>',
                price: '180',
                image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `offer-${Date.now()}-2`,
                name: 'Karnet 4 spotkania',
                category: 'Pakiet',
                description: '<p>4 tygodnie praktyki z dostępem do nagrań i zniżkami na warsztaty.</p>',
                price: '640',
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `offer-${Date.now()}-3`,
                name: 'Warsztaty grupowe',
                category: 'Grupa',
                description: '<p>Kameralne spotkania tematyczne rozwijające świadomość ciała i oddechu.</p>',
                price: '120',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `offer-${Date.now()}-4`,
                name: 'Program oddechowy',
                category: 'Online',
                description: '<p>Czterotygodniowy cykl spotkań online z nagraniami i materiałami PDF.</p>',
                price: '450',
                image: 'https://images.unsplash.com/photo-1526674183561-3a54354ceaba?auto=format&fit=crop&w=900&q=60'
              },
              {
                id: `offer-${Date.now()}-5`,
                name: 'Program regeneracyjny',
                category: 'Weekend',
                description: '<p>Weekend w kameralnej grupie z pełnym wyżywieniem i zestawem nagrań medytacyjnych.</p>',
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
    servicesAndPricing: 'servicesAndPricing',
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
