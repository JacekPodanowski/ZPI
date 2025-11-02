import { create } from 'zustand';

// Initial state structure following EDITOR_PLAN.md
const createInitialState = () => ({
  // Site metadata
  siteId: null,
  siteName: 'Untitled Site',
  
  site: {
    vibe: 'minimal',
    theme: {
      primary: '#920020',
      secondary: '#2D5A7B',
      neutral: '#E4E5DA'
    },
    pages: [
      {
        id: 'home',
        name: 'Home',
        route: '/',
        modules: []
      }
    ]
  },
  userLibrary: {
    customAssets: []
  },
  // Editor state
  editorMode: 'structure', // 'structure' | 'detail'
  selectedPageId: null,
  selectedModuleId: null,
  devicePreview: 'desktop', // 'desktop' | 'mobile'
  isDragging: false,
  draggedItem: null,
  hasUnsavedChanges: false,
  entryPointPageId: 'home'
});

export const useNewEditorStore = create((set, get) => ({
  ...createInitialState(),

  // === Mode Management ===
  setEditorMode: (mode) => set({ editorMode: mode }),
  
  enterDetailMode: (pageId) => set({ 
    editorMode: 'detail', 
    selectedPageId: pageId,
    selectedModuleId: null 
  }),
  
  exitDetailMode: () => set({ 
    editorMode: 'structure',
    selectedModuleId: null
  }),

  // === Page Management ===
  addPage: (page) => set((state) => ({
    site: {
      ...state.site,
      pages: [...state.site.pages, {
        id: page.id || `page-${Date.now()}`,
        name: page.name || 'New Page',
        route: page.route || `/${page.name?.toLowerCase().replace(/\s+/g, '-')}`,
        modules: []
      }]
    },
    hasUnsavedChanges: true
  })),

  removePage: (pageId) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.filter(p => p.id !== pageId)
    },
    selectedPageId: state.selectedPageId === pageId ? null : state.selectedPageId,
    hasUnsavedChanges: true
  })),

  renamePage: (pageId, newName) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(p => 
        p.id === pageId ? { ...p, name: newName } : p
      )
    },
    hasUnsavedChanges: true
  })),

  setEntryPoint: (pageId) => set({ 
    entryPointPageId: pageId,
    hasUnsavedChanges: true 
  }),

  // === Module Management ===
  addModule: (pageId, module, insertIndex = null) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        
        const newModule = {
          id: module.id || `module-${Date.now()}`,
          type: module.type,
          content: module.content || {},
          enabled: module.enabled !== undefined ? module.enabled : true
        };

        // Insert at specific index or append at end
        const newModules = [...page.modules];
        if (insertIndex !== null && insertIndex >= 0 && insertIndex <= newModules.length) {
          newModules.splice(insertIndex, 0, newModule);
        } else {
          newModules.push(newModule);
        }

        return {
          ...page,
          modules: newModules
        };
      })
    },
    hasUnsavedChanges: true
  })),

  removeModule: (pageId, moduleId) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.filter(m => m.id !== moduleId)
        };
      })
    },
    selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
    hasUnsavedChanges: true
  })),

  reorderModules: (pageId, moduleIds) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        
        const modulesMap = new Map(page.modules.map(m => [m.id, m]));
        return {
          ...page,
          modules: moduleIds.map(id => modulesMap.get(id))
        };
      })
    },
    hasUnsavedChanges: true
  })),

  updateModuleContent: (pageId, moduleId, content) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.map(m => 
            m.id === moduleId ? { ...m, content: { ...m.content, ...content } } : m
          )
        };
      })
    },
    hasUnsavedChanges: true
  })),

  // === Collection Item Management (from old editor) ===
  addCollectionItem: (pageId, moduleId, collectionKey, newItem) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              content: {
                ...m.content,
                [collectionKey]: [...(m.content[collectionKey] || []), newItem]
              }
            };
          })
        };
      })
    },
    hasUnsavedChanges: true
  })),

  removeCollectionItem: (pageId, moduleId, collectionKey, index) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              content: {
                ...m.content,
                [collectionKey]: m.content[collectionKey].filter((_, i) => i !== index)
              }
            };
          })
        };
      })
    },
    hasUnsavedChanges: true
  })),

  updateCollectionItem: (pageId, moduleId, collectionKey, index, updates) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.map(m => {
            if (m.id !== moduleId) return m;
            const items = [...m.content[collectionKey]];
            items[index] = { ...items[index], ...updates };
            return {
              ...m,
              content: {
                ...m.content,
                [collectionKey]: items
              }
            };
          })
        };
      })
    },
    hasUnsavedChanges: true
  })),

  reorderCollectionItem: (pageId, moduleId, collectionKey, fromIndex, toIndex) => set((state) => ({
    site: {
      ...state.site,
      pages: state.site.pages.map(page => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          modules: page.modules.map(m => {
            if (m.id !== moduleId) return m;
            const items = [...m.content[collectionKey]];
            const [movedItem] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, movedItem);
            return {
              ...m,
              content: {
                ...m.content,
                [collectionKey]: items
              }
            };
          })
        };
      })
    },
    hasUnsavedChanges: true
  })),

  // === Theme Management ===
  updateTheme: (colorUpdates) => set((state) => ({
    site: {
      ...state.site,
      theme: {
        ...state.site.theme,
        ...colorUpdates
      }
    },
    hasUnsavedChanges: true
  })),

  setVibe: (vibe) => set((state) => ({
    site: {
      ...state.site,
      vibe
    },
    hasUnsavedChanges: true
  })),

  // === Site Metadata ===
  setSiteName: (name) => set({ 
    siteName: name,
    hasUnsavedChanges: true 
  }),

  setSiteId: (id) => set({ siteId: id }),

  // === User Library ===
  addToLibrary: (asset) => set((state) => ({
    userLibrary: {
      customAssets: [...state.userLibrary.customAssets, {
        id: asset.id || `asset-${Date.now()}`,
        type: asset.type,
        name: asset.name,
        ...asset,
        createdAt: new Date().toISOString()
      }]
    },
    hasUnsavedChanges: true
  })),

  removeFromLibrary: (assetId) => set((state) => ({
    userLibrary: {
      customAssets: state.userLibrary.customAssets.filter(a => a.id !== assetId)
    },
    hasUnsavedChanges: true
  })),

  // === Selection ===
  selectModule: (moduleId) => set({ selectedModuleId: moduleId }),
  deselectModule: () => set({ selectedModuleId: null }),

  // === Drag & Drop ===
  setDragging: (isDragging, draggedItem = null) => set({ 
    isDragging, 
    draggedItem 
  }),

  // === Device Preview ===
  setDevicePreview: (device) => set({ devicePreview: device }),

  // === Save/Load ===
  loadSite: (siteData) => set({
    siteId: siteData.id || siteData.siteId || null,
    siteName: siteData.name || siteData.siteName || 'Untitled Site',
    site: siteData.site || createInitialState().site,
    userLibrary: siteData.userLibrary || createInitialState().userLibrary,
    entryPointPageId: siteData.entryPointPageId || (siteData.site?.pages?.[0]?.id || 'home'),
    hasUnsavedChanges: false
  }),

  markAsSaved: () => set({ hasUnsavedChanges: false }),

  // === Reset ===
  reset: () => set(createInitialState()),

  // === Getters ===
  getSelectedPage: () => {
    const state = get();
    if (!state.site || !state.site.pages) return null;
    return state.site.pages.find(p => p.id === state.selectedPageId);
  },

  getSelectedModule: () => {
    const state = get();
    if (!state.site || !state.site.pages) return null;
    const page = state.site.pages.find(p => p.id === state.selectedPageId);
    if (!page) return null;
    return page.modules.find(m => m.id === state.selectedModuleId);
  },

  getPageModules: (pageId) => {
    const state = get();
    if (!state.site || !state.site.pages) return [];
    const page = state.site.pages.find(p => p.id === pageId);
    return page?.modules || [];
  }
}));

export default useNewEditorStore;
