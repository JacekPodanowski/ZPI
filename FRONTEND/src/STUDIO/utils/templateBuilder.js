import composeSiteStyle from '../../SITES/styles/utils';
import { DEFAULT_STYLE_ID } from '../../SITES/styles';

export const createDefaultTemplateConfig = () => {
  const styleId = DEFAULT_STYLE_ID;
  const style = composeSiteStyle(styleId);

  return {
    site: {
      styleId,
      styleOverrides: {},
      pages: [
        {
          id: 'home',
          name: 'Strona Główna',
          route: '/',
          modules: [
            {
              id: 'hero-1',
              type: 'hero',
              content: {
                layout: 'centered',
                heading: 'Witaj w Świecie Wellness',
                subheading: 'Odkryj harmonię ciała i umysłu',
                description: 'Profesjonalna strona w kilka minut',
                image: {
                  url: '',
                  alt: ''
                },
                cta: {
                  primary: { text: 'Umów konsultację', link: '/kalendarz' },
                  secondary: { text: 'Poznaj ofertę', link: '/oferta' }
                }
              }
            }
          ]
        },
        {
          id: 'about',
          name: 'O Mnie',
          route: '/o-mnie',
          modules: [
            {
              id: 'about-1',
              type: 'about',
              content: {
                layout: 'narrative',
                title: 'O Mnie',
                description: 'Jestem certyfikowanym instruktorem wellness z pasją do zdrowego stylu życia.',
                image: {
                  url: '',
                  alt: ''
                }
              }
            }
          ]
        },
        {
          id: 'services',
          name: 'Oferta',
          route: '/oferta',
          modules: [
            {
              id: 'services-1',
              type: 'services',
              content: {
                layout: 'grid',
                title: 'Oferta',
                subtitle: 'Poznaj naszą ofertę i przejrzyste ceny',
                services: [
                  {
                    name: 'Sesja indywidualna',
                    description: '60 minut pracy dopasowanej do Twoich potrzeb.',
                    price: '180 PLN'
                  }
                ]
              }
            }
          ]
        },
        {
          id: 'calendar',
          name: 'Kalendarz',
          route: '/kalendarz',
          modules: [
            {
              id: 'calendar-1',
              type: 'calendar',
              content: {
                layout: 'full',
                title: 'Zarezerwuj Termin',
                description: 'Wybierz dogodny dla Ciebie termin'
              }
            }
          ]
        },
        {
          id: 'contact',
          name: 'Kontakt',
          route: '/kontakt',
          modules: [
            {
              id: 'contact-1',
              type: 'contact',
              content: {
                layout: 'split',
                title: 'Skontaktuj się',
                email: 'kontakt@wellness.pl',
                phone: '+48 123 456 789'
              }
            }
          ]
        },
        {
          id: 'gallery',
          name: 'Galeria',
          route: '/galeria',
          modules: [
            {
              id: 'gallery-1',
              type: 'gallery',
              content: {
                layout: 'masonry',
                title: 'Galeria',
                columns: 3,
                images: []
              }
            }
          ]
        },
        {
          id: 'faq',
          name: 'FAQ',
          route: '/faq',
          modules: [
            {
              id: 'faq-1',
              type: 'faq',
              content: {
                layout: 'accordion',
                title: 'Najczęściej zadawane pytania',
                items: []
              }
            }
          ]
        },
        {
          id: 'team',
          name: 'Zespół',
          route: '/zespol',
          modules: [
            {
              id: 'team-1',
              type: 'team',
              content: {
                layout: 'grid',
                title: 'Poznaj nasz zespół',
                members: []
              }
            }
          ]
        },
        {
          id: 'events',
          name: 'Wydarzenia',
          route: '/wydarzenia',
          modules: [
            {
              id: 'events-1',
              type: 'events',
              content: {
                layout: 'timeline',
                title: 'Nadchodzące wydarzenia',
                events: []
              }
            }
          ]
        }
      ]
    },
    // Keep old structure for backward compatibility in some parts of the code
    styleId,
    styleOverrides: {},
    style,
    pages: {
      home: {
        id: 'home',
        name: 'Strona Główna',
        path: '/',
        modules: []
      }
    }
  };
};

const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))

export const buildTemplateFromModules = (moduleIds, siteName = 'Moja Strona', category = 'wellness') => {
  // Get default page definitions
  const defaultConfig = createDefaultTemplateConfig()
  
  // Build array of pages based on selected modules
  const pagesArray = []
  const addedPageKeys = new Set()
  
  // Always include home page first
  const homePage = defaultConfig.site.pages.find(p => p.id === 'home')
  if (homePage) {
    pagesArray.push(deepClone(homePage))
    addedPageKeys.add('home')
  }

  // Map selected module IDs to pages and add them
  moduleIds.forEach((moduleId) => {
    // Find the page that contains this module type
    const pageWithModule = defaultConfig.site.pages.find(page => {
      return page.modules?.some(m => {
        // Match by module type
        if (m.type === moduleId) return true
        // Special cases for calendar
        if (moduleId === 'publicCalendar' && m.type === 'calendar') return true
        if (moduleId === 'publicCalendarBig' && m.type === 'calendar') return true
        if (moduleId === 'publicCalendarSmall' && m.type === 'calendar') return true
        return false
      })
    })
    
    if (pageWithModule && !addedPageKeys.has(pageWithModule.id)) {
      pagesArray.push(deepClone(pageWithModule))
      addedPageKeys.add(pageWithModule.id)
    }
  })

  // Convert to new format with site.pages array
  const newConfig = {
    site: {
      styleId: defaultConfig.site.styleId,
      styleOverrides: defaultConfig.site.styleOverrides || {},
      pages: pagesArray
    }
  }

  return newConfig
}

export const getDefaultTemplateConfig = createDefaultTemplateConfig
