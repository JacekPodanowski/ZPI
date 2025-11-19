/**
 * AI Service
 * Handles communication with the two-tier AI system (Flash + Claude)
 */

import apiClient from './apiClient';

/**
 * Process AI task using two-tier system
 * @param {string} prompt - User command or request
 * @param {Object} config - Current site/module configuration
 * @param {Object} [context] - Optional additional context
 * @returns {Promise<Object>} AI response with action or task status
 */
export const processAITask = async (prompt, config, context = null) => {
    try {
        const payload = {
            prompt,
            config,
        };
        
        if (context) {
            payload.context = context;
        }
        
        const response = await apiClient.post('/ai-task/', payload);
        return response.data;
    } catch (error) {
        console.error('AI task processing failed:', error);
        throw error;
    }
};

/**
 * Check status of complex AI task
 * @param {string} taskId - Celery task ID
 * @returns {Promise<Object>} Task status and result
 */
export const checkTaskStatus = async (taskId) => {
    try {
        const response = await apiClient.get(`/ai-task/${taskId}/status/`);
        return response.data;
    } catch (error) {
        console.error('Failed to check task status:', error);
        throw error;
    }
};

/**
 * Apply AI action to site configuration
 * Helper function to merge AI response into current config
 * @param {Object} currentConfig - Current configuration object
 * @param {Object} action - Action object from AI response
 * @returns {Object} Updated configuration
 */
export const applyAIAction = (currentConfig, action) => {
    // Deep merge action into current config
    return {
        ...currentConfig,
        ...action,
        content: {
            ...currentConfig.content,
            ...action.content,
        },
    };
};
