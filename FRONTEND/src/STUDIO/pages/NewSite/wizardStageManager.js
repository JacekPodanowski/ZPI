/**
 * Wizard Stage Manager
 * Centralized validation and state management for the site creation wizard flow
 */

import { WIZARD_STORAGE_KEYS } from './wizardConstants';

// Define wizard stages in order
export const WIZARD_STAGES = {
    CATEGORY: 'category',
    PROJECT: 'project',
    STYLE: 'style',
    LOGIN: 'login'
};

// Stage order for validation
const STAGE_ORDER = [
    WIZARD_STAGES.CATEGORY,
    WIZARD_STAGES.PROJECT,
    WIZARD_STAGES.STYLE,
    WIZARD_STAGES.LOGIN
];

/**
 * Get the wizard data from localStorage
 * @returns {Object|null} The wizard data or null
 */
export const getWizardData = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = window.localStorage.getItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT);
        if (!stored) {
            return null;
        }
        return JSON.parse(stored);
    } catch (error) {
        console.warn('[WizardStageManager] Failed to read wizard data:', error);
        return null;
    }
};

/**
 * Save wizard data to localStorage
 * @param {Object} data - The data to save
 */
export const saveWizardData = (data) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(
            WIZARD_STORAGE_KEYS.ACTIVE_DRAFT,
            JSON.stringify(data)
        );
    } catch (error) {
        console.warn('[WizardStageManager] Failed to save wizard data:', error);
    }
};

/**
 * Clear wizard data from localStorage
 */
export const clearWizardData = () => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.removeItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT);
    } catch (error) {
        console.warn('[WizardStageManager] Failed to clear wizard data:', error);
    }
};

/**
 * Update wizard data with new values
 * @param {Object} updates - The updates to apply
 */
export const updateWizardData = (updates) => {
    const currentData = getWizardData() || {};
    const newData = { ...currentData, ...updates };
    saveWizardData(newData);
    return newData;
};

/**
 * Check if a specific stage is completed
 * @param {string} stage - The stage to check
 * @param {Object} data - Optional wizard data (if not provided, will be loaded)
 * @returns {boolean} True if the stage is completed
 */
export const isStageCompleted = (stage, data = null) => {
    const wizardData = data || getWizardData();
    
    if (!wizardData) {
        return false;
    }

    switch (stage) {
        case WIZARD_STAGES.CATEGORY:
            return !!wizardData.category;
        
        case WIZARD_STAGES.PROJECT:
            return !!(
                wizardData.category &&
                wizardData.name &&
                Array.isArray(wizardData.modules) &&
                wizardData.modules.length > 0
            );
        
        case WIZARD_STAGES.STYLE:
            return !!(
                wizardData.category &&
                wizardData.name &&
                Array.isArray(wizardData.modules) &&
                wizardData.modules.length > 0 &&
                wizardData.templateConfig
            );
        
        case WIZARD_STAGES.LOGIN:
            // Login is the final stage, no validation needed
            return false;
        
        default:
            return false;
    }
};

/**
 * Get the next incomplete stage
 * @param {Object} data - Optional wizard data
 * @returns {string} The next stage that needs to be completed
 */
export const getNextIncompleteStage = (data = null) => {
    const wizardData = data || getWizardData();
    
    if (!wizardData) {
        return WIZARD_STAGES.CATEGORY;
    }

    for (const stage of STAGE_ORDER) {
        if (!isStageCompleted(stage, wizardData)) {
            return stage;
        }
    }

    return WIZARD_STAGES.LOGIN;
};

/**
 * Get the route path for a stage
 * @param {string} stage - The stage
 * @returns {string} The route path
 */
export const getStageRoute = (stage) => {
    switch (stage) {
        case WIZARD_STAGES.CATEGORY:
            return '/studio/new';
        case WIZARD_STAGES.PROJECT:
            return '/studio/new_project';
        case WIZARD_STAGES.STYLE:
            return '/studio/new/style';
        case WIZARD_STAGES.LOGIN:
            return '/studio/building-login';
        default:
            return '/studio/new';
    }
};

/**
 * Validate if user can access a stage
 * @param {string} targetStage - The stage user wants to access
 * @returns {Object} { canAccess: boolean, redirectTo: string|null }
 */
export const validateStageAccess = (targetStage) => {
    const wizardData = getWizardData();
    
    // If no wizard data and not starting from category, redirect to category
    if (!wizardData && targetStage !== WIZARD_STAGES.CATEGORY) {
        return {
            canAccess: false,
            redirectTo: getStageRoute(WIZARD_STAGES.CATEGORY)
        };
    }

    // Get the stage index
    const targetIndex = STAGE_ORDER.indexOf(targetStage);
    
    // Check if all previous stages are completed
    for (let i = 0; i < targetIndex; i++) {
        const previousStage = STAGE_ORDER[i];
        if (!isStageCompleted(previousStage, wizardData)) {
            return {
                canAccess: false,
                redirectTo: getStageRoute(previousStage)
            };
        }
    }

    return {
        canAccess: true,
        redirectTo: null
    };
};

/**
 * Clear data for current stage and all following stages
 * Used when user goes back to a previous stage
 * @param {string} currentStage - The stage user is going back to
 */
export const clearStageAndFollowing = (currentStage) => {
    const wizardData = getWizardData();
    
    if (!wizardData) {
        return;
    }

    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const newData = { ...wizardData };

    // Clear current and following stages
    for (let i = currentIndex; i < STAGE_ORDER.length; i++) {
        const stage = STAGE_ORDER[i];
        
        switch (stage) {
            case WIZARD_STAGES.CATEGORY:
                delete newData.category;
                // Falls through to also clear following stages
            case WIZARD_STAGES.PROJECT:
                delete newData.name;
                delete newData.modules;
                // Falls through
            case WIZARD_STAGES.STYLE:
                delete newData.templateConfig;
                break;
        }
    }

    saveWizardData(newData);
    return newData;
};

/**
 * Mark a stage as completed with its data
 * @param {string} stage - The stage to mark as completed
 * @param {Object} stageData - The data for this stage
 */
export const completeStage = (stage, stageData) => {
    const currentData = getWizardData() || {};
    
    let updates = {};
    
    switch (stage) {
        case WIZARD_STAGES.CATEGORY:
            updates = { category: stageData.category };
            break;
        
        case WIZARD_STAGES.PROJECT:
            updates = {
                name: stageData.name,
                modules: stageData.modules
            };
            break;
        
        case WIZARD_STAGES.STYLE:
            updates = {
                templateConfig: stageData.templateConfig
            };
            break;
    }

    return updateWizardData(updates);
};
