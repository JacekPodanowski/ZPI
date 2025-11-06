// ai/aiHelpers.js - Utility functions for token optimization
import { SYSTEM_CONTEXT } from '../systemContext';

/**
 * Get essential modules to load initially (3 most common)
 * Reduces initial token load
 */
export const getEssentialModules = () => {
  return ['hero', 'about', 'services'];
};

/**
 * Parse user message to predict needed descriptors
 * Avoids sending unnecessary descriptors
 */
export const extractModuleTypes = (message) => {
  const keywords = {
    hero: ['hero', 'header', 'intro', 'banner', 'welcome'],
    about: ['about', 'story', 'bio', 'background', 'history'],
    services: ['service', 'offering', 'package', 'price', 'pricing'],
    calendar: ['calendar', 'booking', 'schedule', 'appointment', 'session'],
    contact: ['contact', 'email', 'phone', 'address', 'form', 'message'],
    navigation: ['nav', 'menu', 'header', 'link']
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
 * Truncate AI response to limit token usage
 * Keep responses under ~100 tokens (75 words)
 */
export const truncateResponse = (text, maxWords = 75) => {
  const words = text.split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
};

/**
 * Format minimal change object - only changed fields
 * Avoids sending full config back
 */
export const formatMinimalChange = (change) => {
  return {
    moduleId: change.moduleId,
    changed: Object.keys(change.content).reduce((acc, key) => {
      if (change.content[key] !== change.original?.[key]) {
        acc[key] = change.content[key];
      }
      return acc;
    }, {})
  };
};

/**
 * Calculate token estimate for a string
 * Rough estimate: 1 token ≈ 4 characters
 */
export const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

/**
 * Build initial AI context message
 * This is sent once at conversation start
 */
export const buildInitialContext = () => {
  return {
    type: 'system',
    content: SYSTEM_CONTEXT,
    tokens: estimateTokens(JSON.stringify(SYSTEM_CONTEXT))
  };
};

/**
 * Check if we should send full descriptor or just reference
 */
export const shouldSendFullDescriptor = (moduleType, knownDescriptors) => {
  return !knownDescriptors.includes(moduleType);
};

/**
 * Create a minimal descriptor reference
 * Used when AI already knows the full descriptor
 */
export const createDescriptorReference = (moduleType) => {
  return {
    type: moduleType,
    ref: true,
    message: `Using known ${moduleType} descriptor`
  };
};

/**
 * Optimize field list for AI
 * Send only relevant fields for current operation
 */
export const optimizeFieldList = (descriptor, operation) => {
  if (operation === 'create') {
    // Only required fields for creation
    return Object.entries(descriptor.fields)
      .filter(([_, field]) => field.req)
      .reduce((acc, [key, field]) => {
        acc[key] = field;
        return acc;
      }, {});
  }
  
  // Full descriptor for other operations
  return descriptor.fields;
};

export default {
  getEssentialModules,
  extractModuleTypes,
  truncateResponse,
  formatMinimalChange,
  estimateTokens,
  buildInitialContext,
  shouldSendFullDescriptor,
  createDescriptorReference,
  optimizeFieldList
};
