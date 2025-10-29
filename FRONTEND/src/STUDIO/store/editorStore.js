import { create } from 'zustand'
import { DEFAULT_REACT_COMPONENT_PROPS, DEFAULT_REACT_COMPONENT_SOURCE } from '../../constants/reactComponentDefaults'

const DEFAULT_ANIMATIONS = { enabled: true, style: 'smooth' }

export const createDefaultTemplateConfig = () => ({
  name: 'Wellness Template',
  themeId: 'modernWellness',
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
})

const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)))

export const buildTemplateFromModules = (moduleIds, siteName = 'Moja Strona', category = 'wellness') => {
  // Mapping module IDs to page keys
  const moduleToPageMap = {
    'publicCalendar': 'calendar',
    'about': 'about',
    'servicesAndPricing': 'servicesAndPricing',
    'events': 'events',
    'faq': 'faq',
    'team': 'team',
    'blog': 'blog',
    'gallery': 'gallery',
    'contact': 'contact'
  }

  console.log('[buildTemplateFromModules] Building template from modules:', moduleIds)
  
  const defaultConfig = createDefaultTemplateConfig()
  const newConfig = {
    ...defaultConfig,
    name: siteName,
    pageOrder: [],
    pages: {
      home: defaultConfig.pages.home // Always include home page
    }
  }

  // Build the pages based on selected modules
  moduleIds.forEach(moduleId => {
    const pageKey = moduleToPageMap[moduleId]
    if (pageKey && defaultConfig.pages[pageKey]) {
      console.log(`[buildTemplateFromModules] Adding page: ${pageKey} from module: ${moduleId}`)
      newConfig.pageOrder.push(pageKey)
      newConfig.pages[pageKey] = deepClone(defaultConfig.pages[pageKey])
    } else {
      console.warn(`[buildTemplateFromModules] Unknown module or page: ${moduleId}`)
    }
  })

  // Always add home to the beginning if not already there
  if (!newConfig.pageOrder.includes('home')) {
    newConfig.pageOrder.unshift('home')
  }

  console.log('[buildTemplateFromModules] Final template config:', {
    pageOrder: newConfig.pageOrder,
    pageKeys: Object.keys(newConfig.pages)
  })

  return newConfig
}


const normalizeModule = (module, expectedModule, index) => {
  const fallback = expectedModule ? deepClone(expectedModule) : {
    id: module?.id || `module-${index}`,
    name: module?.name || 'Moduł',
    enabled: module?.enabled !== undefined ? module.enabled : true,
    config: module?.config ? { ...module.config } : {}
  }

  if (!module) {
    const clone = fallback ? deepClone(fallback) : {
      id: `module-${index}`,
      name: 'Moduł',
      enabled: true,
      config: {}
    }
    clone.order = index
    return clone
  }

  const moduleKey = module.type || module.id
  const expectedKey = expectedModule ? (expectedModule.type || expectedModule.id) : moduleKey

  if (expectedModule && moduleKey && moduleKey !== expectedKey) {
    const clone = deepClone(expectedModule)
    clone.order = index
    return clone
  }

  const normalized = {
    ...(fallback || {}),
    ...module
  }

  if (expectedModule?.type && !normalized.type) {
    normalized.type = expectedModule.type
  }

  normalized.enabled = module.enabled !== undefined
    ? module.enabled
    : (fallback?.enabled !== undefined ? fallback.enabled : true)

  normalized.config = {
    ...(fallback?.config || {}),
    ...(module.config || {})
  }

  normalized.order = index
  return normalized
}

const normalizePage = (pageKey, page, defaultPage) => {
  const sourcePage = page || defaultPage || {}
  const normalizedPage = {
    id: sourcePage.id || defaultPage?.id || pageKey,
    name: sourcePage.name || defaultPage?.name || pageKey,
    path: sourcePage.path || defaultPage?.path || `/${pageKey}`
  }

  const modules = Array.isArray(sourcePage.modules)
    ? [...sourcePage.modules].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    : []
  const defaultModules = Array.isArray(defaultPage?.modules)
    ? [...defaultPage.modules].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    : []

  let normalizedModules = modules.map((mod, idx) => normalizeModule(mod, defaultModules[idx], idx))

  if (normalizedModules.length === 0 && defaultModules.length) {
    normalizedModules = defaultModules.map((mod, idx) => {
      const clone = deepClone(mod)
      if (clone) {
        clone.order = idx
      }
      return clone
    })
  } else {
    for (let idx = modules.length; idx < defaultModules.length; idx += 1) {
      const clone = deepClone(defaultModules[idx])
      if (clone) {
        clone.order = normalizedModules.length
        normalizedModules.push(clone)
      }
    }
  }

  normalizedPage.modules = normalizedModules
    .filter(Boolean)
    .map((mod, idx) => ({ ...mod, order: idx }))

  return normalizedPage
}

const migrateTemplateConfig = (incomingConfig, defaultConfig, options = {}) => {
  const cloned = deepClone(incomingConfig) || {}
  cloned.pages = cloned.pages ? { ...cloned.pages } : {}

  const defaultPages = defaultConfig.pages || {}
  const defaultOrder = defaultConfig.pageOrder || Object.keys(defaultPages)
  const restrictToDefaultPages = Boolean(options?.restrictToDefaultPages)

  const resolvedOrder = []
  const seen = new Set()

  defaultOrder.forEach((pageKey) => {
    const defaultPage = defaultPages[pageKey]
    const page = cloned.pages[pageKey]

    if (page) {
      cloned.pages[pageKey] = normalizePage(pageKey, page, defaultPage)
      resolvedOrder.push(pageKey)
      seen.add(pageKey)
    } else if (!page && pageKey === 'home' && defaultPage) {
      cloned.pages[pageKey] = normalizePage(pageKey, defaultPage, defaultPage)
      resolvedOrder.push(pageKey)
      seen.add(pageKey)
    }
  })

  if (!restrictToDefaultPages) {
    const existingOrder = Array.isArray(cloned.pageOrder) ? cloned.pageOrder : Object.keys(cloned.pages)
    existingOrder.forEach((pageKey) => {
      if (seen.has(pageKey)) {
        return
      }
      const defaultPage = defaultPages[pageKey]
      const page = cloned.pages[pageKey]
      if (page) {
        cloned.pages[pageKey] = normalizePage(pageKey, page, defaultPage)
        resolvedOrder.push(pageKey)
        seen.add(pageKey)
      }
    })
  }

  if (restrictToDefaultPages) {
    Object.keys(cloned.pages).forEach((pageKey) => {
      if (!seen.has(pageKey)) {
        delete cloned.pages[pageKey]
      }
    })
  }

  cloned.pageOrder = resolvedOrder
  cloned.name = cloned.name || defaultConfig.name
  cloned.themeId = cloned.themeId || defaultConfig.themeId
  cloned.siteStructure = cloned.siteStructure || defaultConfig.siteStructure || 'multi-page'

  return cloned
}

const useEditorStore = create((set, get) => ({
  mode: 'edit',
  expertMode: false,
  selectedModule: null,
  selectedChild: null, // { moduleId: string, childIndex: number }
  currentPage: 'home',
  siteStructure: 'multi-page', // 'single-page' | 'multi-page'
  animations: { ...DEFAULT_ANIMATIONS },
  
  templateConfig: createDefaultTemplateConfig(),
  siteMeta: null,
  history: [],
  currentVersion: -1,
  previewDevice: 'desktop',
  hasUnsavedChanges: false,
  setTemplateConfig: (config, options = {}) => set(() => {
    const defaultConfig = createDefaultTemplateConfig()
    const rawConfig = config ? JSON.parse(JSON.stringify(config)) : JSON.parse(JSON.stringify(defaultConfig))
    const normalisedConfig = migrateTemplateConfig(rawConfig, defaultConfig, options)
    const pageOrder = Array.isArray(normalisedConfig.pageOrder) && normalisedConfig.pageOrder.length
      ? normalisedConfig.pageOrder
      : Object.keys(normalisedConfig.pages || {})
    const targetPage = normalisedConfig.currentPage && normalisedConfig.pages?.[normalisedConfig.currentPage]
      ? normalisedConfig.currentPage
      : pageOrder[0] || 'home'

    normalisedConfig.pageOrder = pageOrder
    normalisedConfig.currentPage = targetPage
    normalisedConfig.animations = { ...DEFAULT_ANIMATIONS, ...(normalisedConfig.animations || {}) }

    return {
      templateConfig: normalisedConfig,
      currentPage: targetPage,
      selectedModule: null,
      selectedChild: null,
      siteStructure: normalisedConfig.siteStructure || 'multi-page',
      animations: { ...normalisedConfig.animations },
      history: [],
      currentVersion: -1,
      hasUnsavedChanges: Boolean(options.markDirty)
    }
  }),
  resetTemplateConfig: () => set(() => {
    const defaultConfig = createDefaultTemplateConfig()
    const freshConfig = migrateTemplateConfig(JSON.parse(JSON.stringify(defaultConfig)), defaultConfig, { restrictToDefaultPages: true })
    const pageOrder = freshConfig.pageOrder && freshConfig.pageOrder.length
      ? freshConfig.pageOrder
      : Object.keys(freshConfig.pages || {})
    const firstPageKey = pageOrder[0] || 'home'
    freshConfig.animations = { ...DEFAULT_ANIMATIONS, ...(freshConfig.animations || {}) }

    return {
      templateConfig: freshConfig,
      currentPage: firstPageKey,
      selectedModule: null,
      selectedChild: null,
      siteStructure: freshConfig.siteStructure || 'multi-page',
      animations: { ...freshConfig.animations },
      history: [],
      currentVersion: -1,
      siteMeta: null,
      hasUnsavedChanges: false
    }
  }),
  setSiteMeta: (meta) => set({ siteMeta: meta }),
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
  

  setMode: (mode) => set({ mode }),
  setExpertMode: (expertMode) => set({ expertMode }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSiteStructure: (structure) => set({ siteStructure: structure, hasUnsavedChanges: true }),
  setAnimations: (animations) => set((state) => ({
    animations: { ...state.animations, ...animations },
    hasUnsavedChanges: true
  })),

  addPage: (pageName) => set((state) => {
    const baseId = pageName.trim().toLowerCase().replace(/\s+/g, '-') || 'nowa-strona'
    const uniqueId = `${baseId}-${Date.now()}`
    const newPage = {
      id: uniqueId,
      name: pageName.trim() || 'Nowa strona',
      path: `/${uniqueId}`,
      modules: []
    }

    const updatedPages = {
      ...state.templateConfig.pages,
      [uniqueId]: newPage
    }
    const existingOrder = Array.isArray(state.templateConfig.pageOrder)
      ? state.templateConfig.pageOrder
      : Object.keys(updatedPages)
    const updatedOrder = [...existingOrder.filter((key) => key !== uniqueId), uniqueId]

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: updatedPages,
        pageOrder: updatedOrder
      },
      currentPage: uniqueId,
      hasUnsavedChanges: true
    }
  }),

  removePage: (pageId) => set((state) => {
    const pageCount = Object.keys(state.templateConfig.pages).length
    if (pageCount <= 1) {
      window.alert('Nie można usunąć ostatniej strony.')
      return state
    }
    if (pageId === 'home') {
      window.alert('Nie można usunąć strony głównej.')
      return state
    }

    const updatedPages = { ...state.templateConfig.pages }
    delete updatedPages[pageId]

    const updatedOrder = (state.templateConfig.pageOrder || Object.keys(updatedPages)).filter((key) => key !== pageId && updatedPages[key])
    const fallbackPage = updatedOrder[0] || 'home'
    const nextPage = fallbackPage in updatedPages ? fallbackPage : Object.keys(updatedPages)[0] || 'home'

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: updatedPages,
        pageOrder: updatedOrder
      },
      currentPage: nextPage,
      hasUnsavedChanges: true
    }
  }),

  updatePage: (pageId, newPageData) => set((state) => {
    const existingPage = state.templateConfig.pages[pageId]
    if (!existingPage) {
      return state
    }

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [pageId]: { ...existingPage, ...newPageData }
        }
      },
      hasUnsavedChanges: true
    }
  }),
  
  selectModule: (moduleId) => set({ selectedModule: moduleId, selectedChild: null }),
  
  selectChild: (moduleId, childIndex) => set({ 
    selectedModule: moduleId, 
    selectedChild: { moduleId, childIndex } 
  }),

  clearSelection: () => set({ selectedModule: null, selectedChild: null }),

  updateModuleConfig: (moduleId, config) => set((state) => {
    // Znajdź stronę zawierającą ten moduł
    let targetPage = state.currentPage
    
    // Jeśli moduł nie jest na aktualnej stronie, znajdź właściwą
    if (!state.templateConfig.pages[state.currentPage]?.modules?.find(m => m.id === moduleId)) {
      for (const pageKey in state.templateConfig.pages) {
        if (state.templateConfig.pages[pageKey].modules.find(m => m.id === moduleId)) {
          targetPage = pageKey
          break
        }
      }
    }
    
    const currentPageModules = state.templateConfig.pages[targetPage].modules
    
    // Create completely new objects to ensure React detects the change
    const updatedModules = currentPageModules.map((m) =>
      m.id === moduleId 
        ? { ...m, config: { ...m.config, ...config } } 
        : m
    )
    
    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [targetPage]: {
            ...state.templateConfig.pages[targetPage],
            modules: updatedModules
          }
        }
      },
      hasUnsavedChanges: true
    }
  }),
  
  toggleModule: (moduleId) => set((state) => {
    // Znajdź stronę zawierającą ten moduł
    let targetPage = state.currentPage
    
    if (!state.templateConfig.pages[state.currentPage]?.modules?.find(m => m.id === moduleId)) {
      for (const pageKey in state.templateConfig.pages) {
        if (state.templateConfig.pages[pageKey].modules.find(m => m.id === moduleId)) {
          targetPage = pageKey
          break
        }
      }
    }
    
    const currentPageModules = state.templateConfig.pages[targetPage].modules
    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [targetPage]: {
            ...state.templateConfig.pages[targetPage],
            modules: currentPageModules.map((m) =>
              m.id === moduleId ? { ...m, enabled: !m.enabled } : m
            )
          }
        }
      },
      hasUnsavedChanges: true
    }
  }),

  addModule: (moduleType, insertIndex = null) => set((state) => {
    const currentPageModules = [...state.templateConfig.pages[state.currentPage].modules]
    const newId = `${moduleType}-${Date.now()}`

    const defaultConfigs = {
      text: {
        content: 'Nowy tekst',
        fontSize: '16px',
        textColor: 'rgb(30, 30, 30)',
        align: 'left'
      },
      button: {
        text: 'Kliknij mnie',
        link: '#',
        bgColor: 'rgb(146, 0, 32)',
        textColor: 'rgb(228, 229, 218)',
        align: 'center'
      },
      gallery: {
        images: [],
        columns: 3,
        gap: '1rem',
        style: 'grid'
      },
      spacer: {
        height: '2rem'
      },
      container: {
        direction: 'horizontal',
        gap: '1rem',
        align: 'center',
        justify: 'center',
        wrap: true,
        children: []
      },
      video: {
        videoUrl: '',
        caption: 'Mój film',
        captionColor: '#4B5563',
        bgColor: '#FFFFFF',
        muted: false
      },
      faq: {
        title: 'Najczęściej zadawane pytania',
        intro: 'Poznaj odpowiedzi na najpopularniejsze pytania naszych klientów.',
        bgColor: '#FFFFFF',
        textColor: 'rgb(30, 30, 30)',
        items: [
          {
            id: `faq-${Date.now()}`,
            question: 'Jak przygotować się do zajęć?',
            answer: '<p>Wystarczy wygodny strój i mata. Przyjdź 10 minut przed rozpoczęciem, aby się wyciszyć.</p>'
          }
        ]
      },
      team: {
        title: 'Poznaj nasz zespół',
        subtitle: 'Instruktorzy i specjaliści, którzy wspierają Cię w praktyce',
        bgColor: '#FFFFFF',
        textColor: 'rgb(30, 30, 30)',
        accentColor: 'rgb(146, 0, 32)',
        members: [
          {
            id: `team-${Date.now()}`,
            name: 'Anna Kowalska',
            role: 'Instruktorka yin jogi',
            bio: '<p>Prowadzi łagodne sekwencje skupione na wyciszeniu i pracy z oddechem.</p>',
            focus: '<p>Specjalizacja: rozluźnianie napięć, relaksacja, praca z oddechem.</p>',
            image: ''
          }
        ]
      },
      blog: {
        title: 'Aktualności zespołu',
        subtitle: 'Bądź na bieżąco z naszymi działaniami',
        bgColor: '#FFFFFF',
        textColor: 'rgb(30, 30, 30)',
        posts: []
      },
      events: {
        title: 'Nadchodzące wydarzenia',
        subtitle: 'Dołącz do naszych wyjątkowych spotkań',
        bgColor: '#FFFFFF',
        accentColor: 'rgb(146, 0, 32)',
        textColor: 'rgb(30, 30, 30)',
        events: [
          {
            id: `event-${Date.now()}`,
            title: 'Warsztat oddechowy',
            date: new Date().toISOString().split('T')[0],
            summary: '<p>Intensywna sesja pracy z oddechem i relaksacją.</p>',
            location: 'Studio Wellness'
          }
        ]
      },
      servicesAndPricing: {
        title: 'Oferta',
        subtitle: 'Poznaj naszą ofertę i przejrzyste ceny',
        bgColor: '#FFFFFF',
        textColor: 'rgb(30, 30, 30)',
        accentColor: 'rgb(146, 0, 32)',
        currency: 'PLN',
        offers: []
      },
      contactForm: {
        title: 'Skontaktuj się ze mną',
        subtitle: 'Wyślij mi wiadomość, a odezwę się tak szybko jak to możliwe',
        bgColor: 'rgb(255, 255, 255)',
        textColor: 'rgb(30, 30, 30)',
        accentColor: 'rgb(146, 0, 32)'
      },
      reactComponent: {
        componentId: null,
        componentName: '',
        componentDescription: '',
        componentUrl: null,
        sourceCode: DEFAULT_REACT_COMPONENT_SOURCE,
        props: { ...DEFAULT_REACT_COMPONENT_PROPS }
      }
    }

    const moduleNameMap = {
      text: 'Tekst',
      button: 'Przycisk',
      gallery: 'Galeria',
      spacer: 'Odstęp',
      container: 'Kontener',
      video: 'Wideo',
      faq: 'FAQ',
      team: 'Zespół',
      blog: 'Blog',
      events: 'Wydarzenia',
      servicesAndPricing: 'Oferta',
      contactForm: 'Formularz kontaktowy',
      reactComponent: 'Komponent React'
    }

    const newModule = {
      id: newId,
      type: moduleType,
      name: moduleNameMap[moduleType] || moduleType.charAt(0).toUpperCase() + moduleType.slice(1),
      enabled: true,
      order: currentPageModules.length,
      config: defaultConfigs[moduleType] || {}
    }

    const targetIndex = typeof insertIndex === 'number' ? Math.min(Math.max(insertIndex, 0), currentPageModules.length) : currentPageModules.length
    currentPageModules.splice(targetIndex, 0, newModule)

    const orderedModules = currentPageModules.map((module, index) => ({ ...module, order: index }))

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [state.currentPage]: {
            ...state.templateConfig.pages[state.currentPage],
            modules: orderedModules
          }
        }
      },
      selectedModule: newId,
      hasUnsavedChanges: true
    }
  }),

  removeModule: (moduleId) => set((state) => {
    const currentPageModules = state.templateConfig.pages[state.currentPage].modules
    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [state.currentPage]: {
            ...state.templateConfig.pages[state.currentPage],
            modules: currentPageModules.filter(m => m.id !== moduleId)
          }
        }
      },
      selectedModule: null,
      hasUnsavedChanges: true
    }
  }),

  reorderModules: (startIndex, endIndex) => set((state) => {
    const currentPageModules = [...state.templateConfig.pages[state.currentPage].modules]
    const [removed] = currentPageModules.splice(startIndex, 1)
    currentPageModules.splice(endIndex, 0, removed)
    
    const reordered = currentPageModules.map((m, idx) => ({ ...m, order: idx }))

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [state.currentPage]: {
            ...state.templateConfig.pages[state.currentPage],
            modules: reordered
          }
        }
      },
      hasUnsavedChanges: true
    }
  }),

  reorderModuleChildren: (moduleId, sourceIndex, destinationIndex) => set((state) => {
    let targetPage = state.currentPage

    if (!state.templateConfig.pages[state.currentPage]?.modules?.find(m => m.id === moduleId)) {
      for (const pageKey in state.templateConfig.pages) {
        if (state.templateConfig.pages[pageKey].modules.find(m => m.id === moduleId)) {
          targetPage = pageKey
          break
        }
      }
    }

    const currentPageModules = state.templateConfig.pages[targetPage].modules
    const moduleIndex = currentPageModules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) {
      return state
    }

    const targetModule = currentPageModules[moduleIndex]
    const children = [...(targetModule.config?.children || [])]
    if (children.length === 0 || sourceIndex === destinationIndex) {
      return state
    }

    const [movedChild] = children.splice(sourceIndex, 1)
    children.splice(destinationIndex, 0, movedChild)

    const updatedModule = {
      ...targetModule,
      config: {
        ...targetModule.config,
        children
      }
    }

    const updatedModules = currentPageModules.map((mod) =>
      mod.id === moduleId ? updatedModule : mod
    )

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [targetPage]: {
            ...state.templateConfig.pages[targetPage],
            modules: updatedModules
          }
        }
      },
      hasUnsavedChanges: true
    }
  }),

  convertToSinglePage: () => set((state) => ({
    // W single-page wszystkie moduły są na stronie home, ale pages struktura pozostaje
    // aby można było wracać do multi-page
    siteStructure: 'single-page',
    hasUnsavedChanges: true,
  })),
  
  setPreviewDevice: (device) => set({ previewDevice: device }),
  
  saveVersion: () => set((state) => {
    const snapshot = JSON.parse(JSON.stringify(state.templateConfig));
    const baseHistory = state.currentVersion >= 0
      ? state.history.slice(0, state.currentVersion + 1)
      : [];
    const updatedHistory = [...baseHistory, snapshot];
    return {
      history: updatedHistory,
      currentVersion: updatedHistory.length - 1
    };
  }),
  
  loadVersion: (version) => set((state) => {
    const snapshot = state.history[version];
    if (!snapshot) {
      return state;
    }
    return {
      templateConfig: JSON.parse(JSON.stringify(snapshot)),
      currentVersion: version,
      hasUnsavedChanges: true
    };
  }),

  undoVersion: () => set((state) => {
    if (state.currentVersion <= 0) {
      return state;
    }
    const previousVersion = state.currentVersion - 1;
    const snapshot = state.history[previousVersion];
    if (!snapshot) {
      return state;
    }
    return {
      templateConfig: JSON.parse(JSON.stringify(snapshot)),
      currentVersion: previousVersion,
      hasUnsavedChanges: true
    };
  }),

  redoVersion: () => set((state) => {
    if (state.currentVersion === -1) {
      return state;
    }
    const nextVersion = state.currentVersion + 1;
    const snapshot = state.history[nextVersion];
    if (!snapshot) {
      return state;
    }
    return {
      templateConfig: JSON.parse(JSON.stringify(snapshot)),
      currentVersion: nextVersion,
      hasUnsavedChanges: true
    };
  }),

  exportTemplate: () => {
    const state = get()
    const templateData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: state.templateConfig,
      siteStructure: state.siteStructure,
      animations: state.animations
    }
    return JSON.stringify(templateData, null, 2)
  },

  importTemplate: (jsonString) => set((state) => {
    try {
      const data = JSON.parse(jsonString)
      return { 
        templateConfig: data.config,
        siteStructure: data.siteStructure || 'multi-page',
        animations: data.animations || state.animations,
        hasUnsavedChanges: true
      }
    } catch (error) {
      console.error('Failed to import template:', error)
      return state
    }
  }),
}))

export default useEditorStore
