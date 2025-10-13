import { create } from 'zustand'
import { fetchTemplates } from '../../services/templateService'

const useTemplateStore = create((set) => ({
  templates: [],
  selectedTemplate: null,
  loading: true,
  error: null,

  setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null })
      const templates = await fetchTemplates()
      const formattedTemplates = templates.map((template) => ({
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        name: template.name,
        description: template.description,
        modules: Object.values(template.template_config?.pages || {}).flatMap((page) =>
          (page.modules || []).map((module) => module.name)
        ),
        presetConfig: template.template_config,
        thumbnail: template.thumbnail_url || null
      }))
      set({ templates: formattedTemplates, loading: false })
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      set({ loading: false, error: 'Nie udało się wczytać szablonów.' })
    }
  },
}))

export default useTemplateStore
