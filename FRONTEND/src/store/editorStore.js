import { create } from 'zustand'

const useEditorStore = create((set) => ({
  mode: 'edit',
  selectedModule: null,
  templateConfig: {
    name: 'Wellness Template',
    modules: [
      { 
        id: 'hero', 
        name: 'Strona Główna', 
        enabled: true, 
        config: { 
          title: 'Witaj w Świecie Wellness', 
          subtitle: 'Odkryj harmonię ciała i umysłu', 
          bgColor: 'rgb(228, 229, 218)', 
          textColor: 'rgb(30, 30, 30)',
          backgroundImage: ''
        } 
      },
      { 
        id: 'calendar', 
        name: 'Kalendarz', 
        enabled: true, 
        config: { 
          title: 'Zarezerwuj Termin', 
          color: 'rgb(146, 0, 32)',
          minInterval: 15,
          allowIndividual: true,
          allowGroup: true
        } 
      },
      { 
        id: 'about', 
        name: 'O Mnie', 
        enabled: true, 
        config: { 
          title: 'O Mnie', 
          description: 'Jestem certyfikowanym instruktorem wellness z pasją do zdrowego stylu życia.', 
          imageUrl: '',
          avatar: ''
        } 
      },
      { 
        id: 'contact', 
        name: 'Kontakt', 
        enabled: true, 
        config: { 
          email: 'kontakt@wellness.pl', 
          phone: '+48 123 456 789' 
        } 
      },
    ],
  },
  history: [],
  currentVersion: 0,

  setMode: (mode) => set({ mode }),
  
  selectModule: (moduleId) => set({ selectedModule: moduleId }),
  
  updateModuleConfig: (moduleId, config) => set((state) => ({
    templateConfig: {
      ...state.templateConfig,
      modules: state.templateConfig.modules.map((m) =>
        m.id === moduleId ? { ...m, config: { ...m.config, ...config } } : m
      ),
    },
  })),
  
  toggleModule: (moduleId) => set((state) => ({
    templateConfig: {
      ...state.templateConfig,
      modules: state.templateConfig.modules.map((m) =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ),
    },
  })),
  
  saveVersion: () => set((state) => ({
    history: [...state.history, JSON.parse(JSON.stringify(state.templateConfig))],
    currentVersion: state.history.length,
  })),
  
  loadVersion: (version) => set((state) => ({
    templateConfig: state.history[version],
    currentVersion: version,
  })),

  exportTemplate: () => {
    const state = useEditorStore.getState()
    const templateData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: state.templateConfig
    }
    return JSON.stringify(templateData, null, 2)
  },

  importTemplate: (jsonString) => set((state) => {
    try {
      const data = JSON.parse(jsonString)
      return { templateConfig: data.config }
    } catch (error) {
      console.error('Failed to import template:', error)
      return state
    }
  }),
}))

export default useEditorStore
