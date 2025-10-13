import { create } from 'zustand'
import { createDefaultTemplateConfig } from './editorStore'

const useTemplateStore = create((set) => ({
  templates: [
    {
      id: 'wellness-1',
      name: 'Wellness Template',
      description: 'Elegancki szablon dla instruktorów wellness i trenerów',
      thumbnail: '/templates/wellness-thumb.jpg',
      modules: ['Hero', 'Kalendarz', 'O mnie', 'Kontakt'],
      presetConfig: createDefaultTemplateConfig(),
    },
  ],
  selectedTemplate: null,

  setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
  
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),
}))

export default useTemplateStore
