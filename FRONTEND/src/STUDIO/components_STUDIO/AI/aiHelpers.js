// aiHelpers.js - Utility functions for AI assistant optimization
// Based on token optimization concepts from SITES/AI

/**
 * Calculate token estimate for a string
 * Rough estimate: 1 token ≈ 4 characters
 */
export const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

/**
 * Parse user message to predict needed module types
 * Helps focus AI attention on relevant parts of the site
 */
export const extractModuleTypes = (message) => {
  const keywords = {
    hero: ['hero', 'header', 'intro', 'banner', 'welcome', 'główna', 'strona główna', 'tytuł'],
    about: ['about', 'o mnie', 'o nas', 'story', 'bio', 'biografia', 'historia'],
    services: ['service', 'usługa', 'offering', 'oferta', 'package', 'pakiet', 'price', 'pricing', 'cena', 'cennik'],
    calendar: ['calendar', 'kalendarz', 'booking', 'rezerwacja', 'schedule', 'appointment', 'spotkanie', 'session', 'sesja'],
    contact: ['contact', 'kontakt', 'email', 'phone', 'telefon', 'address', 'adres', 'form', 'formularz', 'message', 'wiadomość'],
    gallery: ['gallery', 'galeria', 'zdjęcia', 'photos', 'images', 'obrazy'],
    testimonials: ['testimonials', 'opinie', 'reviews', 'recenzje'],
    faq: ['faq', 'pytania', 'questions', 'odpowiedzi'],
    team: ['team', 'zespół', 'staff', 'people', 'ludzie'],
    navigation: ['nav', 'menu', 'navigation', 'nawigacja', 'link']
  };

  const messageLower = message.toLowerCase();
  const detectedModules = [];

  for (const [module, words] of Object.entries(keywords)) {
    if (words.some(word => messageLower.includes(word))) {
      detectedModules.push(module);
    }
  }

  return detectedModules;
};

/**
 * Prepare site data for AI context
 * Includes full content to give AI complete information
 */
export const prepareSiteForContext = (site) => {
  if (!site || !site.pages) return site;
  
  // Return full site structure - AI needs complete context
  return site;
};

/**
 * Build context message based on current mode
 * Includes full site structure so AI has complete information
 */
export const buildContextMessage = (mode, site, currentPageId = null) => {
  if (mode === 'structure') {
    return {
      mode: 'structure',
      viewContext: 'Użytkownik jest w trybie struktury (widok wszystkich stron)',
      structure: site
    };
  }
  
  if (mode === 'detail' && currentPageId) {
    const currentPage = site.pages?.find((p) => p.id === currentPageId);
    if (currentPage) {
      return {
        mode: 'detail',
        viewContext: `Użytkownik jest w trybie szczegółów na stronie "${currentPage.name}"`,
        currentPageId,
        currentPageName: currentPage.name,
        structure: site
      };
    }
  }
  
  return {
    mode: 'detail',
    viewContext: 'Użytkownik jest w trybie szczegółów',
    structure: site
  };
};

/**
 * Validate AI response structure
 * Ensures the response has the expected format
 */
export const validateAIResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Response is not an object' };
  }

  if (!response.status) {
    return { valid: false, error: 'Missing status field' };
  }

  if (response.status === 'success') {
    if (!response.site) {
      return { valid: false, error: 'Success response missing site object' };
    }
    
    // Check if site was wrapped in context (common mistake)
    if (response.site.mode && response.site.structure) {
      return { 
        valid: true, 
        warning: 'Site is wrapped in context object',
        unwrap: true 
      };
    }
    
    if (!response.site.pages || !Array.isArray(response.site.pages)) {
      return { valid: false, error: 'Site object missing pages array' };
    }
  }

  return { valid: true };
};

/**
 * Extract site data from AI response
 * Handles unwrapping if needed
 */
export const extractSiteFromResponse = (response) => {
  if (!response || !response.site) {
    return null;
  }

  // Check if wrapped in context
  if (response.site.mode && response.site.structure) {
    return response.site.structure;
  }

  return response.site;
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Wystąpił nieznany błąd';
};

export default {
  estimateTokens,
  extractModuleTypes,
  prepareSiteForContext,
  buildContextMessage,
  validateAIResponse,
  extractSiteFromResponse,
  formatErrorMessage
};
