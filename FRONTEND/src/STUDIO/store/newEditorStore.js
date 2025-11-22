import { create } from 'zustand';
import { getDefaultModuleContent } from '../pages/Editor/moduleDefinitions';
import { DEFAULT_STYLE_ID } from '../../SITES/styles';
import composeSiteStyle, {
  normalizeStyleState,
  sanitizeStyleOverrides,
  resolveStyleId
} from '../../SITES/styles/utils';

const MAX_STRUCTURE_HISTORY = 10;
const MAX_DETAIL_HISTORY = 20;

const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const isDeepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const createHistoryStack = () => ({
  past: [],
  future: []
});

const createTransactionState = () => ({
  active: false,
  mode: null,
  conversationId: null,
  description: '',
  startSnapshot: null,
  affectedModules: [],
  changesCount: 0,
  lastActionType: null
});

const createSnapshot = (state) => ({
  site: deepClone(state.site),
  entryPointPageId: state.entryPointPageId,
  selectedPageId: state.selectedPageId,
  selectedModuleId: state.selectedModuleId
});

const cloneSnapshot = (snapshot) => ({
  site: deepClone(snapshot.site),
  entryPointPageId: snapshot.entryPointPageId,
  selectedPageId: snapshot.selectedPageId,
  selectedModuleId: snapshot.selectedModuleId
});

const deriveSelectionFromSnapshot = (snapshot) => {
  const pages = snapshot.site?.pages || [];
  let selectedPageId = snapshot.selectedPageId ?? (pages[0]?.id || null);
  if (selectedPageId && !pages.some((page) => page.id === selectedPageId)) {
    selectedPageId = pages[0]?.id || null;
  }

  let selectedModuleId = snapshot.selectedModuleId ?? null;
  if (selectedModuleId) {
    const exists = pages.some(
      (page) => Array.isArray(page.modules) && page.modules.some((module) => module.id === selectedModuleId)
    );
    if (!exists) {
      selectedModuleId = null;
    }
  }

  return { selectedPageId, selectedModuleId };
};

const getHistoryConfig = (mode) =>
  mode === 'structure'
    ? { key: 'structureHistory', limit: MAX_STRUCTURE_HISTORY }
    : { key: 'detailHistory', limit: MAX_DETAIL_HISTORY };

const buildMeta = (metadata = {}) => ({
  timestamp: metadata.timestamp || Date.now(),
  source: metadata.source || 'user',
  actionType: metadata.actionType || 'unknown',
  description: metadata.description || '',
  conversationId: metadata.conversationId || null,
  affectedModules: Array.isArray(metadata.affectedModules) ? metadata.affectedModules : [],
  changesCount:
    typeof metadata.changesCount === 'number' && metadata.changesCount >= 0 ? metadata.changesCount : 1
});

const pushHistoryEntry = (state, mode, metadata, snapshotOverride = null) => {
  const { key, limit } = getHistoryConfig(mode);
  const snapshot = snapshotOverride ? cloneSnapshot(snapshotOverride) : createSnapshot(state);
  const entry = {
    state: snapshot,
    meta: buildMeta(metadata)
  };
  const past = [...state[key].past, entry];
  if (past.length > limit) {
    past.shift();
  }
  return {
    [key]: {
      past,
      future: []
    }
  };
};

const accumulateTransactionMeta = (transaction, metadata = {}) => {
  const modules = new Set(transaction.affectedModules || []);
  (metadata.affectedModules || []).forEach((id) => {
    if (id) {
      modules.add(id);
    }
  });

  const description = metadata.description || transaction.description || '';
  return {
    ...transaction,
    description,
    lastActionType: metadata.actionType || transaction.lastActionType,
    affectedModules: Array.from(modules),
    changesCount: (transaction.changesCount || 0) + (metadata.changesCount || 1)
  };
};

const toArray = (collection) => {
  if (Array.isArray(collection)) {
    return [...collection];
  }

  if (collection && typeof collection === 'object') {
    return Object.entries(collection).map(([legacyKey, value]) => ({
      ...(value || {}),
      __legacyKey: legacyKey
    }));
  }

  return [];
};

const buildStyleState = (styleId = DEFAULT_STYLE_ID, overrides = {}) => {
  const cleanOverrides = sanitizeStyleOverrides(overrides);
  const style = composeSiteStyle(styleId, cleanOverrides);
  return {
    styleId,
    styleOverrides: cleanOverrides,
    style
  };
};

const normalizeModule = (module, index, pageId) => {
  if (!module || typeof module !== 'object') {
    return {
      id: `${pageId || 'page'}-module-${index}`,
      type: 'custom',
      name: 'Custom Module',
      content: {},
      enabled: true,
      order: index
    };
  }

  const moduleId =
    module.id || module.moduleId || module.slug || `${pageId || 'page'}-module-${index}`;
  const moduleType = module.type || module.moduleType || moduleId;
  const order = module.order ?? module.position ?? index;
  const enabled = module.enabled !== undefined ? module.enabled : module.visible !== false;
  const baseContent = deepClone(module.content || module.config || {});

  console.log(`[normalizeModule] Processing ${moduleType}:`, {
    hasModuleLayout: !!module.layout,
    hasContentLayout: !!baseContent?.layout,
    contentKeys: Object.keys(baseContent)
  });

  const { __legacyKey, modules: _childModules, ...rest } = module;

  const normalized = {
    ...rest,
    id: moduleId,
    type: moduleType,
    name: module.name || module.title || moduleType,
    layout: module.layout || baseContent?.layout || null,
    order,
    enabled,
    content: baseContent
  };

  if (!normalized.config && module.config) {
    normalized.config = deepClone(module.config);
  }

  console.log(`[normalizeModule] Result for ${moduleType}:`, {
    layout: normalized.layout,
    contentKeys: Object.keys(normalized.content)
  });

  return normalized;
};

const normalizePage = (page, index) => {
  if (!page || typeof page !== 'object') {
    return null;
  }

  const { modules: rawModules, __legacyKey, ...rest } = page;
  const pageId = page.id || page.pageId || page.slug || __legacyKey || `page-${index}`;
  const order = rest.order ?? index;
  const modules = toArray(rawModules)
    .map((module, moduleIndex) => normalizeModule(module, moduleIndex, pageId))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const routeCandidate = rest.route || rest.path;
  const route = routeCandidate || (pageId === 'home' ? '/' : `/${pageId}`);

  return {
    ...rest,
    id: pageId,
    name: rest.name || rest.title || pageId,
    route,
    modules,
    order
  };
};

const normalizeSiteConfig = (site = {}) => {
  const { pageOrder: legacyOrder, navigation: legacyNavigation, ...rest } = site || {};
  const styleState = normalizeStyleState(site);

  const pages = toArray(site.pages)
    .map((page, index) => normalizePage(page, index))
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const pageOrder = Array.isArray(legacyOrder) && legacyOrder.length
    ? legacyOrder
    : pages.map((page) => page.id);

  const navigation = legacyNavigation && typeof legacyNavigation === 'object' ? legacyNavigation : {};

  return {
    ...rest,
    styleId: styleState.styleId,
    styleOverrides: styleState.styleOverrides,
    style: styleState.style,
    pages,
    pageOrder,
    navigation
  };
};

const applyChangeWithHistory = (state, mode, metadata, updates, snapshotOverride = null) => {
  if (state.aiTransaction.active && (state.aiTransaction.mode || 'detail') === mode) {
    return {
      ...updates,
      aiTransaction: accumulateTransactionMeta(state.aiTransaction, metadata)
    };
  }
  const historyUpdate = pushHistoryEntry(state, mode, metadata, snapshotOverride);
  return {
    ...updates,
    ...historyUpdate
  };
};

const createInitialSite = () => {
  const styleState = buildStyleState(DEFAULT_STYLE_ID);
  return {
    ...styleState,
    navigation: {},
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
  };
};

const createInitialState = () => ({
  siteId: null,
  siteIdentifier: null,
  siteName: 'Untitled Site',
  site: createInitialSite(),
  userLibrary: {
    customAssets: []
  },
  editorMode: 'structure',
  selectedPageId: null,
  selectedModuleId: null,
  devicePreview: 'desktop',
  canvasZoom: 1,
  isDragging: false,
  draggedItem: null,
  hasUnsavedChanges: false,
  entryPointPageId: 'home',
  moduleHeights: {},
  structureHistory: createHistoryStack(),
  detailHistory: createHistoryStack(),
  aiTransaction: createTransactionState(),
  currentVersionNumber: 0,
  lastSavedAt: null
});

const useNewEditorStore = create((set, get) => ({
  ...createInitialState(),

  setEditorMode: (mode) => set({ editorMode: mode }),
  enterDetailMode: (pageId) =>
    set({
      editorMode: 'detail',
      selectedPageId: pageId,
      selectedModuleId: null
    }),
  exitDetailMode: () =>
    set({
      editorMode: 'structure',
      selectedModuleId: null
    }),

  addPage: (page = {}) =>
    set((state) => {
      const trimmedName = (page.name || 'New Page').trim() || 'New Page';
      const pageId = page.id || `page-${Date.now()}`;
      const route =
        page.route || `/${trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '')}`;
      const modules = Array.isArray(page.modules)
        ? page.modules.map((module, index) => ({
            id: module.id || `module-${Date.now()}-${index}`,
            type: module.type,
            content: deepClone(module.content || {}),
            enabled: module.enabled !== undefined ? module.enabled : true
          }))
        : [];

      const updatedSite = {
        ...state.site,
        pages: [...state.site.pages, { id: pageId, name: trimmedName, route, modules }]
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'add_page',
        description: `Added page "${trimmedName}"`,
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        selectedPageId: pageId,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  removePage: (pageId) =>
    set((state) => {
      if (!pageId) {
        return {};
      }
      const pages = state.site.pages;
      if (pages.length <= 1 || pageId === 'home') {
        return {};
      }

      const pageIndex = pages.findIndex((page) => page.id === pageId);
      if (pageIndex === -1) {
        return {};
      }

      const pageToRemove = pages[pageIndex];
      const remainingPages = pages.filter((page) => page.id !== pageId);
      const fallbackPageId = remainingPages[0]?.id || null;

      const updatedSite = {
        ...state.site,
        pages: remainingPages
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'remove_page',
        description: `Removed page "${pageToRemove.name || pageId}"`,
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        selectedPageId: state.selectedPageId === pageId ? fallbackPageId : state.selectedPageId,
        entryPointPageId: state.entryPointPageId === pageId ? fallbackPageId : state.entryPointPageId,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  renamePage: (pageId, newName) =>
    set((state) => {
      const trimmed = (newName || '').trim();
      if (!trimmed) {
        return {};
      }

      const pageIndex = state.site.pages.findIndex((page) => page.id === pageId);
      if (pageIndex === -1) {
        return {};
      }

      const targetPage = state.site.pages[pageIndex];
      if (targetPage.name === trimmed) {
        return {};
      }

      const updatedPages = state.site.pages.map((page) =>
        page.id === pageId ? { ...page, name: trimmed } : page
      );

      const updatedSite = {
        ...state.site,
        pages: updatedPages
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'rename_page',
        description: `Renamed page to "${trimmed}"`,
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  setEntryPoint: (pageId) =>
    set((state) => {
      if (!pageId || state.entryPointPageId === pageId) {
        return {};
      }

      const targetPage = state.site.pages.find((page) => page.id === pageId);
      if (!targetPage) {
        return {};
      }

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'set_entry_point',
        description: `Set entry point to "${targetPage.name || pageId}"`,
        changesCount: 1
      };

      const updates = {
        entryPointPageId: pageId,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  addModule: (pageId, module, insertIndex = null) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      if (!page || !module?.type) {
        return {};
      }

      const newModule = {
        id: module.id || `module-${Date.now()}`,
        type: module.type,
        content: deepClone(module.content || {}),
        enabled: module.enabled !== undefined ? module.enabled : true
      };

      const modules = Array.isArray(page.modules) ? [...page.modules] : [];
      const targetIndex =
        typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= modules.length
          ? insertIndex
          : modules.length;

      modules.splice(targetIndex, 0, newModule);

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) => (p.id === pageId ? { ...p, modules } : p))
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'add_module',
        description: `Added ${module.type} module`,
        affectedModules: [newModule.id],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        selectedPageId: pageId,
        selectedModuleId: newModule.id,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  removeModule: (pageId, moduleId) =>
    set((state) => {
      const pages = state.site.pages;
      const pageIndex = pages.findIndex((page) => page.id === pageId);
      if (pageIndex === -1) {
        return {};
      }

      const page = pages[pageIndex];
      const modules = Array.isArray(page.modules) ? page.modules : [];
      const moduleIndex = modules.findIndex((module) => module.id === moduleId);
      if (moduleIndex === -1) {
        return {};
      }

      const removedModule = modules[moduleIndex];
      const remainingModules = modules.filter((module) => module.id !== moduleId);
      const homePageId = pages[0]?.id;

      const updatedPages = pages
        .map((p) => {
          if (p.id === pageId) {
            return {
              ...p,
              modules: remainingModules
            };
          }
          return p;
        })
        .filter((p) => {
          if (p.id === pageId && p.id !== homePageId) {
            return p.modules.length > 0;
          }
          return true;
        });

      let selectedPageId = state.selectedPageId;
      if (!updatedPages.some((p) => p.id === selectedPageId)) {
        selectedPageId = updatedPages[0]?.id || null;
      }

      const entryPointPageId = updatedPages.some((p) => p.id === state.entryPointPageId)
        ? state.entryPointPageId
        : updatedPages[0]?.id || null;

      const updatedSite = {
        ...state.site,
        pages: updatedPages
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'remove_module',
        description: `Removed ${removedModule.type || 'module'}`,
        affectedModules: [moduleId],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        selectedPageId,
        selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
        entryPointPageId,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  reorderModules: (pageId, moduleIds) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      if (!page) {
        return {};
      }

      const currentOrder = (page.modules || []).map((module) => module.id);
      if (
        currentOrder.length !== moduleIds.length ||
        currentOrder.every((id, index) => id === moduleIds[index])
      ) {
        return {};
      }

      const modulesMap = new Map((page.modules || []).map((module) => [module.id, module]));
      const reordered = moduleIds.map((id) => modulesMap.get(id)).filter(Boolean);
      if (reordered.length !== currentOrder.length) {
        return {};
      }

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) => (p.id === pageId ? { ...p, modules: reordered } : p))
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'reorder_module',
        description: `Reordered modules on "${page.name}"`,
        affectedModules: moduleIds,
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  moveModule: (fromPageId, toPageId, moduleId, toIndex) =>
    set((state) => {
      const fromPage = state.site.pages.find((p) => p.id === fromPageId);
      const toPage = state.site.pages.find((p) => p.id === toPageId);
      if (!fromPage || !toPage) {
        return {};
      }

      const moduleToMove = (fromPage.modules || []).find((module) => module.id === moduleId);
      if (!moduleToMove) {
        return {};
      }

      if (fromPageId === toPageId) {
        const currentModules = [...(fromPage.modules || [])];
        const currentIndex = currentModules.findIndex((module) => module.id === moduleId);
        if (currentIndex === -1 || currentModules.length <= 1) {
          return {};
        }

        currentModules.splice(currentIndex, 1);

        let insertAt = typeof toIndex === 'number' ? toIndex : currentModules.length;
        if (insertAt > currentIndex) {
          insertAt -= 1;
        }
        insertAt = Math.max(0, Math.min(currentModules.length, insertAt));
        currentModules.splice(insertAt, 0, moduleToMove);

        const updatedSite = {
          ...state.site,
          pages: state.site.pages.map((p) =>
            p.id === fromPageId ? { ...p, modules: currentModules } : p
          )
        };

        const metadata = {
          source: state.aiTransaction.active ? 'ai' : 'user',
          actionType: 'reorder_module',
          description: `Reordered modules on "${fromPage.name}"`,
          affectedModules: [moduleId],
          changesCount: 1
        };

        const updates = {
          site: updatedSite,
          hasUnsavedChanges: true
        };

        return applyChangeWithHistory(state, 'detail', metadata, updates);
      }

      const fromModules = (fromPage.modules || []).filter((module) => module.id !== moduleId);
      const toModules = [...(toPage.modules || [])];
      const insertAt =
        typeof toIndex === 'number' && toIndex >= 0 && toIndex <= toModules.length
          ? toIndex
          : toModules.length;
      toModules.splice(insertAt, 0, moduleToMove);

      const homePageId = state.site.pages[0]?.id;
      const updatedPages = state.site.pages
        .map((p) => {
          if (p.id === fromPageId) {
            return {
              ...p,
              modules: fromModules
            };
          }
          if (p.id === toPageId) {
            return {
              ...p,
              modules: toModules
            };
          }
          return p;
        })
        .filter((p) => {
          if (p.id === fromPageId && p.id !== homePageId) {
            return p.modules.length > 0;
          }
          return true;
        });

      let selectedPageId = state.selectedPageId;
      if (!updatedPages.some((p) => p.id === selectedPageId)) {
        selectedPageId = updatedPages[0]?.id || null;
      }

      const entryPointPageId = updatedPages.some((p) => p.id === state.entryPointPageId)
        ? state.entryPointPageId
        : updatedPages[0]?.id || null;

      const updatedSite = {
        ...state.site,
        pages: updatedPages
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'move_module',
        description: `Moved module to "${toPage.name}"`,
        affectedModules: [moduleId],
        changesCount: 2
      };

      const updates = {
        site: updatedSite,
        selectedPageId: toPageId,
        selectedModuleId: moduleId,
        entryPointPageId,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'structure', metadata, updates);
    }),

  updateModuleContent: (pageId, moduleId, content = {}) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      if (!page) {
        return {};
      }

      const modules = page.modules || [];
      const module = modules.find((m) => m.id === moduleId);
      if (!module) {
        return {};
      }

      const incomingKeys = Object.keys(content);
      if (incomingKeys.length === 0) {
        return {};
      }

      const changedKeys = incomingKeys.filter((key) => {
        const previousValue = module.content?.[key];
        const nextValue = content[key];
        return JSON.stringify(previousValue) !== JSON.stringify(nextValue);
      });

      if (changedKeys.length === 0) {
        return {};
      }

      const updatedModule = {
        ...module,
        content: {
          ...deepClone(module.content || {}),
          ...deepClone(content)
        }
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: (p.modules || []).map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_content',
        description: `Edited ${module.type || 'module'} content`,
        affectedModules: [moduleId],
        changesCount: changedKeys.length
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  // Update module property (not content) - for layout, enabled, order, etc.
  updateModuleProperty: (pageId, moduleId, property, value) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      if (!page) {
        return {};
      }

      const modules = page.modules || [];
      const module = modules.find((m) => m.id === moduleId);
      if (!module) {
        return {};
      }

      // Check if value actually changed
      if (JSON.stringify(module[property]) === JSON.stringify(value)) {
        return {};
      }

      const updatedModule = {
        ...module,
        [property]: value
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: (p.modules || []).map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_property',
        description: `Changed ${property} of ${module.type || 'module'}`,
        affectedModules: [moduleId],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  batchUpdateModuleContents: (updates = {}) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === state.selectedPageId);
      if (!page) {
        return {};
      }

      const moduleIds = Object.keys(updates);
      if (moduleIds.length === 0) {
        return {};
      }

      let totalChanges = 0;
      const updatedModules = (page.modules || []).map((module) => {
        if (updates[module.id]) {
          const content = updates[module.id];
          const incomingKeys = Object.keys(content);
          
          const changedKeys = incomingKeys.filter((key) => {
            const previousValue = module.content?.[key];
            const nextValue = content[key];
            return JSON.stringify(previousValue) !== JSON.stringify(nextValue);
          });

          if (changedKeys.length > 0) {
            totalChanges += changedKeys.length;
            return {
              ...module,
              content: {
                ...deepClone(module.content || {}),
                ...deepClone(content)
              }
            };
          }
        }
        return module;
      });

      if (totalChanges === 0) {
        return {};
      }

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === state.selectedPageId
            ? { ...p, modules: updatedModules }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'batch_edit_content',
        description: `Applied settings to ${moduleIds.length} modules`,
        affectedModules: moduleIds,
        changesCount: totalChanges
      };

      const updates_state = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates_state);
    }),

  updateNavigationContent: (content = {}) =>
    set((state) => {
      const currentNavigation = state.site.navigation?.content || {};
      const incomingKeys = Object.keys(content);
      if (incomingKeys.length === 0) {
        return {};
      }

      const changedKeys = incomingKeys.filter((key) => {
        const previousValue = currentNavigation[key];
        const nextValue = content[key];
        return JSON.stringify(previousValue) !== JSON.stringify(nextValue);
      });

      if (changedKeys.length === 0) {
        return {};
      }

      const updatedSite = {
        ...state.site,
        navigation: {
          ...(state.site.navigation || {}),
          content: {
            ...deepClone(currentNavigation),
            ...deepClone(content)
          }
        }
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_navigation',
        description: 'Updated navigation content',
        changesCount: changedKeys.length
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  addCollectionItem: (pageId, moduleId, collectionKey, newItem) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      const module = page?.modules?.find((m) => m.id === moduleId);
      if (!module || !collectionKey) {
        return {};
      }

      const collection = Array.isArray(module.content?.[collectionKey])
        ? module.content[collectionKey]
        : [];

      const updatedCollection = [...collection, deepClone(newItem)];
      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          [collectionKey]: updatedCollection
        }
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: p.modules.map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'add_collection_item',
        description: `Added item to ${module.type || 'module'} collection`,
        affectedModules: [moduleId],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  removeCollectionItem: (pageId, moduleId, collectionKey, index) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      const module = page?.modules?.find((m) => m.id === moduleId);
      const collection = Array.isArray(module?.content?.[collectionKey])
        ? module.content[collectionKey]
        : [];
      if (!module || index < 0 || index >= collection.length) {
        return {};
      }

      const updatedCollection = collection.filter((_, idx) => idx !== index);
      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          [collectionKey]: updatedCollection
        }
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: p.modules.map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'remove_collection_item',
        description: `Removed item from ${module.type || 'module'} collection`,
        affectedModules: [moduleId],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  updateCollectionItem: (pageId, moduleId, collectionKey, index, updates = {}) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      const module = page?.modules?.find((m) => m.id === moduleId);
      const collection = Array.isArray(module?.content?.[collectionKey])
        ? module.content[collectionKey]
        : [];
      if (!module || index < 0 || index >= collection.length) {
        return {};
      }

      const existingItem = collection[index];
      const changedKeys = Object.keys(updates).filter((key) => {
        const prevValue = existingItem?.[key];
        const nextValue = updates[key];
        return JSON.stringify(prevValue) !== JSON.stringify(nextValue);
      });

      if (changedKeys.length === 0) {
        return {};
      }

      const newItems = [...collection];
      newItems[index] = {
        ...deepClone(existingItem),
        ...deepClone(updates)
      };

      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          [collectionKey]: newItems
        }
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: p.modules.map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_collection_item',
        description: `Updated ${module.type || 'module'} collection item`,
        affectedModules: [moduleId],
        changesCount: changedKeys.length
      };

      const stateUpdates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, stateUpdates);
    }),

  reorderCollectionItem: (pageId, moduleId, collectionKey, fromIndex, toIndex) =>
    set((state) => {
      const page = state.site.pages.find((p) => p.id === pageId);
      const module = page?.modules?.find((m) => m.id === moduleId);
      const collection = Array.isArray(module?.content?.[collectionKey])
        ? [...module.content[collectionKey]]
        : [];
      if (!module || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
        return {};
      }
      if (fromIndex >= collection.length || toIndex >= collection.length) {
        return {};
      }

      const [movedItem] = collection.splice(fromIndex, 1);
      collection.splice(toIndex, 0, movedItem);

      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          [collectionKey]: collection
        }
      };

      const updatedSite = {
        ...state.site,
        pages: state.site.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                modules: p.modules.map((m) => (m.id === moduleId ? updatedModule : m))
              }
            : p
        )
      };

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'reorder_collection_item',
        description: `Reordered ${module.type || 'module'} collection`,
        affectedModules: [moduleId],
        changesCount: 1
      };

      const updates = {
        site: updatedSite,
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  updateStyleOverrides: (overrides = {}) =>
    set((state) => {
      if (!overrides || typeof overrides !== 'object') {
        return {};
      }

      const overrideKeys = Object.keys(overrides);
      if (overrideKeys.length === 0) {
        return {};
      }

      const currentOverrides = state.site.styleOverrides || {};
      const mergedOverrides = sanitizeStyleOverrides({
        ...currentOverrides,
        ...overrides
      });

      if (isDeepEqual(currentOverrides, mergedOverrides)) {
        return {};
      }

      const { style } = buildStyleState(state.site.styleId || DEFAULT_STYLE_ID, mergedOverrides);

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_style',
        description: 'Updated style overrides',
        changesCount: Math.max(overrideKeys.length, 1)
      };

      const updates = {
        site: {
          ...state.site,
          style,
          styleOverrides: mergedOverrides
        },
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  setStyleId: (styleId, options = {}) =>
    set((state) => {
      const resolvedStyleId = resolveStyleId(styleId);
      const resetOverrides = options.resetOverrides ?? false;
      const providedOverrides =
        options.overrides && typeof options.overrides === 'object' ? options.overrides : null;

      const baseOverrides = resetOverrides ? {} : state.site.styleOverrides || {};
      const mergedOverrides = sanitizeStyleOverrides(
        providedOverrides ? { ...baseOverrides, ...providedOverrides } : baseOverrides
      );

      if (
        resolvedStyleId === state.site.styleId &&
        !resetOverrides &&
        !providedOverrides
      ) {
        return {};
      }

      const nextStyleState = buildStyleState(resolvedStyleId, mergedOverrides);

      if (
        resolvedStyleId === state.site.styleId &&
        isDeepEqual(state.site.styleOverrides || {}, nextStyleState.styleOverrides) &&
        isDeepEqual(state.site.style, nextStyleState.style)
      ) {
        return {};
      }

      const metadata = {
        source: state.aiTransaction.active ? 'ai' : 'user',
        actionType: 'edit_style',
        description: `Changed site style to "${nextStyleState.style?.name || nextStyleState.styleId}"`,
        changesCount: 1
      };

      const updates = {
        site: {
          ...state.site,
          styleId: nextStyleState.styleId,
          styleOverrides: nextStyleState.styleOverrides,
          style: nextStyleState.style
        },
        hasUnsavedChanges: true
      };

      return applyChangeWithHistory(state, 'detail', metadata, updates);
    }),

  setSiteName: (name) =>
    set({
      siteName: name,
      hasUnsavedChanges: true
    }),

  setSiteId: (id) => set({ siteId: id }),
  setSiteIdentifier: (identifier) => set({ siteIdentifier: identifier }),

  addToLibrary: (asset) =>
    set((state) => ({
      userLibrary: {
        customAssets: [
          ...state.userLibrary.customAssets,
          {
            id: asset.id || `asset-${Date.now()}`,
            type: asset.type,
            name: asset.name,
            ...asset,
            createdAt: new Date().toISOString()
          }
        ]
      },
      hasUnsavedChanges: true
    })),

  removeFromLibrary: (assetId) =>
    set((state) => ({
      userLibrary: {
        customAssets: state.userLibrary.customAssets.filter((asset) => asset.id !== assetId)
      },
      hasUnsavedChanges: true
    })),

  setSelectedPage: (pageId) => set({ selectedPageId: pageId }),
  selectModule: (moduleId) => set({ selectedModuleId: moduleId }),
  deselectModule: () => set({ selectedModuleId: null }),

  setDragging: (isDragging, draggedItem = null) =>
    set({
      isDragging,
      draggedItem
    }),

  setDevicePreview: (device) => set({ devicePreview: device }),

  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),

  loadSite: (siteData) => {
    const rawSite = deepClone(siteData.site || createInitialSite());
    const nextSite = normalizeSiteConfig(rawSite);
    const requestedEntryPoint =
      siteData.entryPointPageId || rawSite.entryPointPageId || rawSite.homePageId || null;
    const defaultEntryPoint = nextSite.pages?.[0]?.id || null;
    const entryPoint = requestedEntryPoint && nextSite.pages.some((page) => page.id === requestedEntryPoint)
      ? requestedEntryPoint
      : defaultEntryPoint;

    console.log('[EditorStore] loadSite - pages:', nextSite.pages?.map(p => ({ id: p.id, name: p.name })));
    console.log('[EditorStore] loadSite - entryPoint:', entryPoint);
    console.log('[EditorStore] loadSite - selectedPageId will be:', entryPoint);

    set((state) => ({
      siteId: siteData.id || siteData.siteId || null,
      siteIdentifier: siteData.identifier || siteData.siteIdentifier || state.siteIdentifier || null,
      siteName: siteData.name || siteData.siteName || 'Untitled Site',
      site: nextSite,
      userLibrary: deepClone(siteData.userLibrary || { customAssets: [] }),
      entryPointPageId: entryPoint,
      selectedPageId: entryPoint,
      selectedModuleId: null,
      hasUnsavedChanges: false,
      structureHistory: createHistoryStack(),
      detailHistory: createHistoryStack(),
      aiTransaction: createTransactionState(),
      currentVersionNumber:
        siteData.currentVersionNumber || siteData.currentVersion || siteData.latestVersionNumber || 0,
      lastSavedAt: siteData.lastSavedAt || siteData.updated_at || null
    }));
  },

  markAsSaved: (payload = {}) =>
    set((state) => {
      const version = payload.version || null;
      const lastSavedAt = version?.created_at || payload.lastSavedAt || new Date().toISOString();
      const versionNumber = version?.version_number ?? state.currentVersionNumber;

      return {
        hasUnsavedChanges: false,
        currentVersionNumber: versionNumber,
        lastSavedAt
      };
    }),

  reset: () => set(createInitialState()),

  getSelectedPage: () => {
    const state = get();
    return state.site.pages.find((page) => page.id === state.selectedPageId) || null;
  },

  getSelectedModule: () => {
    const state = get();
    const page = state.site.pages.find((p) => p.id === state.selectedPageId);
    return page?.modules?.find((module) => module.id === state.selectedModuleId) || null;
  },

  getPageModules: (pageId) => {
    const state = get();
    return state.site.pages.find((page) => page.id === pageId)?.modules || [];
  },

  recordModuleHeight: (moduleType, height) =>
    set((state) => ({
      moduleHeights: {
        ...state.moduleHeights,
        [moduleType]: height
      }
    })),

  getModuleHeight: (moduleType, defaultHeight = 600) => {
    const state = get();
    return state.moduleHeights[moduleType] || defaultHeight;
  },

  // Replace entire site state with history tracking (for AI updates)
  replaceSiteStateWithHistory: (newSiteConfig, metadata = {}) =>
    set((state) => {
      const mode = metadata.mode || 'detail'; // AI changes are detail-level
      const snapshotOverride = createSnapshot(state); // Save current state BEFORE change

      // Normalize and validate new site config - CRITICAL: ensures module.layout is set correctly
      const rawSite = newSiteConfig.site || newSiteConfig;
      const normalizedSite = normalizeSiteConfig(rawSite);
      
      console.log('[EditorStore] replaceSiteStateWithHistory - normalized site:', {
        pagesCount: normalizedSite.pages?.length,
        firstPageModules: normalizedSite.pages?.[0]?.modules?.map(m => ({
          id: m.id,
          type: m.type,
          layout: m.layout,
          contentKeys: Object.keys(m.content || {})
        }))
      });
      
      const updates = {
        site: normalizedSite,
        hasUnsavedChanges: true,
      };

      // Push current state to history before applying new state
      const historyUpdate = pushHistoryEntry(state, mode, {
        timestamp: Date.now(),
        source: metadata.source || 'ai',
        actionType: metadata.actionType || 'ai_edit',
        description: metadata.description || 'AI-generated change',
        conversationId: metadata.conversationId || null,
        affectedModules: metadata.affectedModules || [],
        changesCount: metadata.changesCount || 1,
      }, snapshotOverride);

      return {
        ...updates,
        ...historyUpdate,
      };
    }),

  undo: (mode) =>
    set((state) => {
      const chosenMode = mode || state.editorMode;
      const { key } = getHistoryConfig(chosenMode);
      const history = state[key];
      if (!history || history.past.length === 0) {
        return {};
      }

      const entry = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      const currentSnapshot = createSnapshot(state);
      const newFuture = [...history.future, { state: currentSnapshot, meta: entry.meta }];

      const snapshot = cloneSnapshot(entry.state);
      const selection = deriveSelectionFromSnapshot(snapshot);

      return {
        site: snapshot.site,
        entryPointPageId: snapshot.entryPointPageId,
        selectedPageId: selection.selectedPageId,
        selectedModuleId: selection.selectedModuleId,
        [key]: {
          past: newPast,
          future: newFuture
        },
        hasUnsavedChanges: true,
        aiTransaction: createTransactionState()
      };
    }),

  redo: (mode) =>
    set((state) => {
      const chosenMode = mode || state.editorMode;
      const { key } = getHistoryConfig(chosenMode);
      const history = state[key];
      if (!history || history.future.length === 0) {
        return {};
      }

      const entry = history.future[history.future.length - 1];
      const newFuture = history.future.slice(0, -1);
      const currentSnapshot = createSnapshot(state);
      const newPast = [...history.past, { state: currentSnapshot, meta: entry.meta }];

      const snapshot = cloneSnapshot(entry.state);
      const selection = deriveSelectionFromSnapshot(snapshot);

      return {
        site: snapshot.site,
        entryPointPageId: snapshot.entryPointPageId,
        selectedPageId: selection.selectedPageId,
        selectedModuleId: selection.selectedModuleId,
        [key]: {
          past: newPast,
          future: newFuture
        },
        hasUnsavedChanges: true,
        aiTransaction: createTransactionState()
      };
    }),

  clearHistories: () =>
    set({
      structureHistory: createHistoryStack(),
      detailHistory: createHistoryStack()
    }),

  startAITransaction: ({ mode = 'detail', conversationId = null, description = '' } = {}) =>
    set((state) => {
      if (state.aiTransaction.active) {
        return {};
      }

      return {
        aiTransaction: {
          active: true,
          mode,
          conversationId,
          description,
          startSnapshot: createSnapshot(state),
          affectedModules: [],
          changesCount: 0,
          lastActionType: null
        }
      };
    }),

  registerAIChange: (metadata = {}) =>
    set((state) => {
      if (!state.aiTransaction.active) {
        return {};
      }

      return {
        aiTransaction: accumulateTransactionMeta(state.aiTransaction, metadata)
      };
    }),

  endAITransaction: ({ description, affectedModules = [], changesCount = 0, actionType } = {}) =>
    set((state) => {
      if (!state.aiTransaction.active || !state.aiTransaction.startSnapshot) {
        return {};
      }

      const transaction = state.aiTransaction;
      const combinedModules = new Set([
        ...(transaction.affectedModules || []),
        ...affectedModules.filter(Boolean)
      ]);

      const meta = {
        source: 'ai',
        actionType: actionType || transaction.lastActionType || 'ai_batch',
        description: description || transaction.description || 'AI changes',
        conversationId: transaction.conversationId,
        affectedModules: Array.from(combinedModules),
        changesCount: (transaction.changesCount || 0) + (changesCount || 0)
      };

      let hasChanges = meta.changesCount > 0;
      if (!hasChanges) {
        const currentSnapshot = createSnapshot(state);
        hasChanges = JSON.stringify(currentSnapshot.site) !== JSON.stringify(transaction.startSnapshot.site);
        if (hasChanges) {
          meta.changesCount = Math.max(meta.changesCount, 1);
        }
      }

      const resetTransaction = createTransactionState();

      if (!hasChanges) {
        return {
          aiTransaction: resetTransaction
        };
      }

      const historyUpdate = pushHistoryEntry(
        state,
        transaction.mode || 'detail',
        meta,
        transaction.startSnapshot
      );

      return {
        ...historyUpdate,
        hasUnsavedChanges: true,
        aiTransaction: resetTransaction
      };
    }),

  cancelAITransaction: () =>
    set((state) => {
      if (!state.aiTransaction.active || !state.aiTransaction.startSnapshot) {
        return {
          aiTransaction: createTransactionState()
        };
      }

      const snapshot = cloneSnapshot(state.aiTransaction.startSnapshot);
      const selection = deriveSelectionFromSnapshot(snapshot);

      return {
        site: snapshot.site,
        entryPointPageId: snapshot.entryPointPageId,
        selectedPageId: selection.selectedPageId,
        selectedModuleId: selection.selectedModuleId,
        hasUnsavedChanges: true,
        aiTransaction: createTransactionState()
      };
    })
}));

export default useNewEditorStore;
