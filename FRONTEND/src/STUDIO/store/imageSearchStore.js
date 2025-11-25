import { create } from 'zustand';
import pexelsService from '../../services/pexelsService';

/**
 * Image Search Store
 * Manages Pexels image search state, results, and quota tracking
 */
const useImageSearchStore = create((set, get) => ({
  // Search state
  searchResults: [],
  isLoading: false,
  error: null,
  mode: 'focused', // 'focused' | 'bulk'
  currentQuery: '',
  currentPage: 1,
  totalResults: 0,
  hasMore: true,
  
  // Selection state
  activeElementId: null, // ID of the element waiting for image selection
  activeElementType: null, // 'single' | 'multiple'
  selectedImages: [], // Array of selected image URLs for bulk mode
  
  // Quota state
  quota: {
    used: 0,
    limit: 50,
    remaining: 50
  },
  
  // UI state
  isPanelOpen: false,
  isModalOpen: false,
  
  // Filters
  orientation: 'all',
  color: '',

  /**
   * Search for images on Pexels
   */
  searchImages: async (siteId, query, options = {}) => {
    const {
      mode = 'focused',
      page = 1,
      orientation = 'all',
      color = '',
      append = false
    } = options;

    set({ 
      isLoading: true, 
      error: null,
      currentQuery: query,
      currentPage: page,
      orientation,
      color,
      mode
    });

    try {
      const response = await pexelsService.searchImages(siteId, {
        query,
        mode,
        page,
        orientation,
        color
      });

      set((state) => ({
        searchResults: append 
          ? [...state.searchResults, ...response.images]
          : response.images,
        totalResults: response.total_results || 0,
        hasMore: response.images.length > 0,
        quota: response.quota || state.quota,
        isLoading: false
      }));

      return response;
    } catch (error) {
      set({ 
        error: error.message || 'Nie udało się wyszukać obrazków',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Load next page (for bulk mode infinite scroll)
   */
  loadNextPage: async (siteId) => {
    const state = get();
    if (state.isLoading || !state.hasMore) return;

    const nextPage = state.currentPage + 1;
    await state.searchImages(siteId, state.currentQuery, {
      mode: state.mode,
      page: nextPage,
      orientation: state.orientation,
      color: state.color,
      append: true
    });
  },

  /**
   * Set active element for image selection
   */
  setActiveElement: (elementId, elementType = 'single') => {
    set({ 
      activeElementId: elementId,
      activeElementType: elementType
    });
  },

  /**
   * Clear active element
   */
  clearActiveElement: () => {
    set({ 
      activeElementId: null,
      activeElementType: null
    });
  },

  /**
   * Select image (applies image to active element)
   */
  selectImage: (imageUrl, elementId = null) => {
    const state = get();
    const targetId = elementId || state.activeElementId;
    
    if (state.mode === 'bulk') {
      // In bulk mode, add to selection
      set((state) => ({
        selectedImages: [...state.selectedImages, { elementId: targetId, url: imageUrl }]
      }));
    }
    
    return { elementId: targetId, url: imageUrl };
  },

  /**
   * Clear selected images
   */
  clearSelectedImages: () => {
    set({ selectedImages: [] });
  },

  /**
   * Check quota status
   */
  checkQuota: async (siteId) => {
    try {
      const quota = await pexelsService.getQuota(siteId);
      set({ quota });
      return quota;
    } catch (error) {
      console.error('Error checking quota:', error);
      return null;
    }
  },

  /**
   * Open modal (focused mode)
   */
  openModal: () => {
    set({ isModalOpen: true, mode: 'focused' });
  },

  /**
   * Close modal
   */
  closeModal: () => {
    set({ isModalOpen: false });
  },

  /**
   * Open panel (bulk mode)
   */
  openPanel: () => {
    set({ isPanelOpen: true, mode: 'bulk' });
  },

  /**
   * Close panel
   */
  closePanel: () => {
    set({ isPanelOpen: false, selectedImages: [] });
  },

  /**
   * Set orientation filter
   */
  setOrientation: (orientation) => {
    set({ orientation });
  },

  /**
   * Set color filter
   */
  setColor: (color) => {
    set({ color });
  },

  /**
   * Reset search state
   */
  resetSearch: () => {
    set({
      searchResults: [],
      isLoading: false,
      error: null,
      currentQuery: '',
      currentPage: 1,
      totalResults: 0,
      hasMore: true,
      selectedImages: [],
      orientation: 'all',
      color: ''
    });
  },

  /**
   * Reset all state
   */
  reset: () => {
    set({
      searchResults: [],
      isLoading: false,
      error: null,
      mode: 'focused',
      currentQuery: '',
      currentPage: 1,
      totalResults: 0,
      hasMore: true,
      activeElementId: null,
      activeElementType: null,
      selectedImages: [],
      quota: {
        used: 0,
        limit: 50,
        remaining: 50
      },
      isPanelOpen: false,
      isModalOpen: false,
      orientation: 'all',
      color: ''
    });
  }
}));

export default useImageSearchStore;
