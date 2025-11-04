// ai/contextManager.js - Tracks conversation state for multi-step editing
class ContextManager {
  constructor() {
    this.state = {
      currentPage: null,
      activeModules: [], // Last 3 edited modules
      knownDescriptors: new Set(),
      conversationHistory: [], // Last 10 messages
      siteConfig: null
    };
  }

  /**
   * Update context from user action
   */
  updateContext(action) {
    switch (action.type) {
      case 'SET_PAGE':
        this.state.currentPage = action.payload;
        break;
      
      case 'EDIT_MODULE':
        this._trackModuleEdit(action.payload.moduleType);
        break;
      
      case 'ADD_DESCRIPTOR':
        this.state.knownDescriptors.add(action.payload);
        break;
      
      case 'ADD_MESSAGE':
        this._addToHistory(action.payload);
        break;
      
      case 'SET_SITE_CONFIG':
        this.state.siteConfig = action.payload;
        break;
      
      case 'RESET':
        this._reset();
        break;
    }
  }

  /**
   * Get minimal context data for AI - only what's necessary
   */
  getMinimalContext() {
    return {
      currentPage: this.state.currentPage,
      recentModules: this.state.activeModules.slice(0, 3),
      knownDescriptors: Array.from(this.state.knownDescriptors)
    };
  }

  /**
   * Check if descriptor is already known to AI
   */
  isDescriptorKnown(type) {
    return this.state.knownDescriptors.has(type);
  }

  /**
   * Get full state (for debugging)
   */
  getState() {
    return {
      ...this.state,
      knownDescriptors: Array.from(this.state.knownDescriptors)
    };
  }

  /**
   * Track which modules are being actively edited
   * Keep only last 3
   */
  _trackModuleEdit(moduleType) {
    const modules = this.state.activeModules.filter(m => m !== moduleType);
    modules.unshift(moduleType);
    this.state.activeModules = modules.slice(0, 3);
  }

  /**
   * Add message to history, keep last 10
   */
  _addToHistory(message) {
    this.state.conversationHistory.push({
      ...message,
      timestamp: Date.now()
    });
    
    if (this.state.conversationHistory.length > 10) {
      this.state.conversationHistory = this.state.conversationHistory.slice(-10);
    }
  }

  /**
   * Reset context for new session
   */
  _reset() {
    this.state = {
      currentPage: null,
      activeModules: [],
      knownDescriptors: new Set(),
      conversationHistory: [],
      siteConfig: null
    };
  }
}

// Singleton instance
export const contextManager = new ContextManager();
export default contextManager;
