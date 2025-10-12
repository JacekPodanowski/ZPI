import { create } from 'zustand'

const useTemplateStore = create((set) => ({
  templates: [
    {
      id: 'wellness-1',
      name: 'Wellness Template',
      description: 'Elegancki szablon dla instruktorów wellness i trenerów',
      thumbnail: '/templates/wellness-thumb.jpg',
      modules: ['hero', 'calendar', 'about', 'contact'],
    },
  ],
  selectedTemplate: null,

  setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
  
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),
}))

export default useTemplateStore
