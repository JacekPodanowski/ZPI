import { create } from 'zustand';
import { getDefaultModuleContent } from '../pages/Editor/moduleDefinitions';

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
    navigation: {
      // Only store customizations, defaults applied from moduleDefinitions
      // content: { } - only include if different from default
    },
    pages: [
      {
        id: 'home',
        name: 'Home',
        route: '/',
        modules: [
          {
            id: 'module-hero-default',
            type: 'hero',
            content: getDefaultModuleContent('hero'),
            enabled: true
          }
        ]
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
  addModule: (pageId, module, insertIndex = null) => set((state) => {
    console.log('[newEditorStore] addModule called:', { pageId, module, insertIndex });
    console.log('[newEditorStore] Current pages:', state.site.pages);
    
    const result = {
      site: {
        ...state.site,
        pages: state.site.pages.map(page => {
          if (page.id !== pageId) return page;
          
          console.log('[newEditorStore] Found matching page:', page.id);
          
          const newModule = {
            id: module.id || `module-${Date.now()}`,
            type: module.type,
            content: module.content || {},
            enabled: module.enabled !== undefined ? module.enabled : true
          };
          
          console.log('[newEditorStore] Created new module:', newModule);

          // Insert at specific index or append at end
          const newModules = [...page.modules];
          if (insertIndex !== null && insertIndex >= 0 && insertIndex <= newModules.length) {
            console.log('[newEditorStore] Inserting at index:', insertIndex);
            newModules.splice(insertIndex, 0, newModule);
          } else {
            console.log('[newEditorStore] Appending at end');
            newModules.push(newModule);
          }
          
          console.log('[newEditorStore] New modules array:', newModules);

          return {
            ...page,
            modules: newModules
          };
        })
      },
      hasUnsavedChanges: true
    };
    
    console.log('[newEditorStore] Returning new state with pages:', result.site.pages);
    return result;
  }),

  removeModule: (pageId, moduleId) => set((state) => {
    const updatedPages = state.site.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        modules: page.modules.filter(m => m.id !== moduleId)
      };
    });

    // Auto-delete pages that become empty (except home page - first page)
    const homePageId = state.site.pages[0]?.id;
    const filteredPages = updatedPages.filter(page => {
      // Always keep home page even if empty
      if (page.id === homePageId) return true;
      // Keep pages with modules
      return page.modules.length > 0;
    });

    return {
      site: {
        ...state.site,
        pages: filteredPages
      },
      selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
      hasUnsavedChanges: true
    };
  }),

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

  moveModule: (fromPageId, toPageId, moduleId, toIndex) => set((state) => {
    console.log('[newEditorStore] moveModule called:', { fromPageId, toPageId, moduleId, toIndex });
    
    // Find the module to move
    const fromPage = state.site.pages.find(p => p.id === fromPageId);
    const moduleToMove = fromPage?.modules.find(m => m.id === moduleId);
    
    if (!moduleToMove) {
      console.error('[newEditorStore] Module not found:', moduleId);
      return state;
    }

    // Special case: moving within the same page
    if (fromPageId === toPageId) {
      return {
        site: {
          ...state.site,
          pages: state.site.pages.map(page => {
            if (page.id !== fromPageId) return page;
            
            const newModules = [...page.modules];
            const currentIndex = newModules.findIndex(m => m.id === moduleId);
            
            if (currentIndex === -1) return page;
            
            // Remove from current position
            newModules.splice(currentIndex, 1);
            
            // Calculate insert position (adjust if moving forward)
            let insertIndex = toIndex;
            if (toIndex > currentIndex) {
              insertIndex = toIndex - 1;
            }
            
            // Insert at new position
            newModules.splice(insertIndex, 0, moduleToMove);
            
            return {
              ...page,
              modules: newModules
            };
          })
        },
        hasUnsavedChanges: true
      };
    }

    // Moving between different pages
    return {
      site: {
        ...state.site,
        pages: state.site.pages.map(page => {
          // Remove from source page
          if (page.id === fromPageId) {
            return {
              ...page,
              modules: page.modules.filter(m => m.id !== moduleId)
            };
          }
          
          // Add to target page
          if (page.id === toPageId) {
            const newModules = [...page.modules];
            const insertIndex = toIndex !== null && toIndex >= 0 && toIndex <= newModules.length 
              ? toIndex 
              : newModules.length;
            newModules.splice(insertIndex, 0, moduleToMove);
            
            return {
              ...page,
              modules: newModules
            };
          }
          
          return page;
        })
      },
      hasUnsavedChanges: true
    };
  }),

  updateModuleContent: (pageId, moduleId, content) => set((state) => {
    console.log('🏪 Store - updateModuleContent called:', { pageId, moduleId, content });
    
    const newState = {
      site: {
        ...state.site,
        pages: state.site.pages.map(page => {
          if (page.id !== pageId) return page;
          return {
            ...page,
            modules: page.modules.map(m => {
              if (m.id === moduleId) {
                const updatedModule = { ...m, content: { ...m.content, ...content } };
                console.log('🏪 Store - Updated module:', updatedModule);
                return updatedModule;
              }
              return m;
            })
          };
        })
      },
      hasUnsavedChanges: true
    };
    
    console.log('🏪 Store - New state pages:', newState.site.pages);
    return newState;
  }),

  // === Navigation Management ===
  updateNavigationContent: (content) => set((state) => ({
    site: {
      ...state.site,
      navigation: {
        ...state.site.navigation,
        content: {
          ...(state.site.navigation?.content || {}),
          ...content
        }
      }
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
  setSelectedPage: (pageId) => set({ selectedPageId: pageId }),
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
  loadSite: (siteData) => {
    console.log('[newEditorStore] loadSite called with:', siteData);
    const newState = {
      siteId: siteData.id || siteData.siteId || null,
      siteName: siteData.name || siteData.siteName || 'Untitled Site',
      site: siteData.site || createInitialState().site,
      userLibrary: siteData.userLibrary || createInitialState().userLibrary,
      entryPointPageId: siteData.entryPointPageId || (siteData.site?.pages?.[0]?.id || 'home'),
      hasUnsavedChanges: false
    };
    console.log('[newEditorStore] Setting new state:', newState);
    console.log('[newEditorStore] Pages in new state:', newState.site.pages);
    set(newState);
  },

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
