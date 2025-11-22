import apiClient from './apiClient';

/**
 * Chat service for AI assistant history management
 */

/**
 * Get chat history for a specific agent
 * @param {Object} params - Query parameters
 * @param {string} params.agent_id - Required - Agent ID to get history for
 * @param {number} params.limit - Number of messages to return (default: 20, max: 100)
 * @returns {Promise<{messages: Array, count: number, agent: Object}>}
 */
export const getChatHistory = async (params = {}) => {
  const response = await apiClient.get('/chat/history/', { params });
  return response.data;
};

/**
 * Reset (delete) chat history for a specific agent
 * @param {Object} params - Filter parameters
 * @param {string} params.agent_id - Required - Agent ID to reset history for
 * @returns {Promise<{message: string, deleted_count: number, agent: Object}>}
 */
export const resetChatHistory = async (params = {}) => {
  const response = await apiClient.post('/chat/reset/', params);
  return response.data;
};

/**
 * Process AI task with context and agent
 * @param {string} prompt - User message
 * @param {Object} config - Full site configuration
 * @param {Object} context - Additional context
 * @param {string} context.context_type - Context type (studio_editor, studio_events, etc.)
 * @param {number} context.site_id - Site ID
 * @param {string} context.agent_id - Agent ID (required)
 * @param {string} context.currentPageId - Current page ID (optional)
 * @param {string} context.currentPageName - Current page name (optional)
 * @returns {Promise<{status: string, task_id: string, message: string}>}
 */
export const processAITaskWithContext = async (prompt, config, context = {}) => {
  const response = await apiClient.post('/ai-task/', {
    prompt,
    config,
    context
  });
  return response.data;
};

/**
 * Poll for AI task result
 * @param {string} taskId - Task ID to poll for
 * @returns {Promise<Object>}
 */
export const pollAITaskResult = async (taskId) => {
  const response = await apiClient.get(`/ai-task/${taskId}/poll/`);
  return response.data;
};
