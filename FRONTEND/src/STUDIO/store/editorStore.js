import { create } from 'zustand'

export const createDefaultTemplateConfig = () => ({
  name: 'Wellness Template',
  pages: {
    home: {
      id: 'home',
      name: 'Strona Główna',
      path: '/',
      modules: [
        {
          id: 'hero',
          name: 'Strona Główna',
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
          enabled: true,
          order: 0,
          config: {
            title: 'O Mnie',
            description: 'Jestem certyfikowanym instruktorem wellness z pasją do zdrowego stylu życia.',
            imageUrl: '',
            avatar: '',
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
          name: 'Kontakt',
          enabled: true,
          order: 0,
          config: {
            email: 'kontakt@wellness.pl',
            phone: '+48 123 456 789',
            bgColor: 'rgb(255, 255, 255)'
          }
        }
      ]
    }
  }
})

const useEditorStore = create((set, get) => ({
  mode: 'edit',
  expertMode: false,
  selectedModule: null,
  selectedChild: null, // { moduleId: string, childIndex: number }
  currentPage: 'home',
  siteStructure: 'multi-page', // 'single-page' | 'multi-page'
  animations: {
    enabled: true,
    style: 'smooth',
  },
  
  templateConfig: createDefaultTemplateConfig(),
  siteMeta: null,
  history: [],
  currentVersion: -1,
  previewDevice: 'desktop',
  setTemplateConfig: (config) => set({ templateConfig: JSON.parse(JSON.stringify(config || createDefaultTemplateConfig())) }),
  resetTemplateConfig: () => set({ templateConfig: createDefaultTemplateConfig(), history: [], currentVersion: 0, siteMeta: null }),
  setSiteMeta: (meta) => set({ siteMeta: meta }),
  

  setMode: (mode) => set({ mode }),
  setExpertMode: (expertMode) => set({ expertMode }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSiteStructure: (structure) => set({ siteStructure: structure }),
  setAnimations: (animations) => set((state) => ({
    animations: { ...state.animations, ...animations }
  })),
  
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
    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [targetPage]: {
            ...state.templateConfig.pages[targetPage],
            modules: currentPageModules.map((m) =>
              m.id === moduleId ? { ...m, config: { ...m.config, ...config } } : m
            )
          }
        }
      }
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
      }
    }
  }),

  addModule: (moduleType) => set((state) => {
    const currentPageModules = state.templateConfig.pages[state.currentPage].modules
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
        direction: 'horizontal', // 'horizontal' | 'vertical'
        gap: '1rem',
        align: 'center', // 'start' | 'center' | 'end'
        justify: 'center', // 'start' | 'center' | 'end' | 'between' | 'around'
        wrap: true,
        children: [] // Array of child module objects
      }
    }

    const newModule = {
      id: newId,
      type: moduleType,
      name: moduleType.charAt(0).toUpperCase() + moduleType.slice(1),
      enabled: true,
      order: currentPageModules.length,
      config: defaultConfigs[moduleType] || {}
    }

    return {
      templateConfig: {
        ...state.templateConfig,
        pages: {
          ...state.templateConfig.pages,
          [state.currentPage]: {
            ...state.templateConfig.pages[state.currentPage],
            modules: [...currentPageModules, newModule]
          }
        }
      },
      selectedModule: newId
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
      selectedModule: null
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
      }
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
      }
    }
  }),

  convertToSinglePage: () => set((state) => ({
    // W single-page wszystkie moduły są na stronie home, ale pages struktura pozostaje
    // aby można było wracać do multi-page
    siteStructure: 'single-page',
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
      currentVersion: version
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
      currentVersion: previousVersion
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
      currentVersion: nextVersion
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
        animations: data.animations || state.animations
      }
    } catch (error) {
      console.error('Failed to import template:', error)
      return state
    }
  }),
}))

export default useEditorStore
