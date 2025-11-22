import apiClient from './apiClient';

/**
 * Agent management service
 * Handles AI agents - separate assistants with their own conversation history
 */

export const getAgents = async ({ site_id, context_type }) => {
  const params = {};
  if (site_id) params.site_id = site_id;
  if (context_type) params.context_type = context_type;

  const response = await apiClient.get('/agents/', { params });
  return response.data;
};

export const createAgent = async ({ site_id, context_type, name }) => {
  const response = await apiClient.post('/agents/', {
    site_id,
    context_type,
    name
  });
  return response.data;
};

export const getAgentDetails = async (agent_id) => {
  const response = await apiClient.get(`/agents/${agent_id}/`);
  return response.data;
};

export const deleteAgent = async (agent_id) => {
  const response = await apiClient.delete(`/agents/${agent_id}/`);
  return response.data;
};

/**
 * Get agent ID from localStorage or create new one
 * @param {number|null} siteId - Site ID (null for global agents like studio_editor)
 * @param {string} contextType - Context type (studio_editor, studio_events, etc.)
 * @returns {Promise<string>} Agent ID (UUID)
 */
export const getOrCreateAgent = async (siteId, contextType) => {
  // For global contexts (like studio_editor without site), use context-only key
  const storageKey = siteId ? `agent_${siteId}_${contextType}` : `agent_global_${contextType}`;
  
  // Try to get from localStorage
  let agentId = localStorage.getItem(storageKey);
  
  if (agentId) {
    // Verify agent still exists
    try {
      await getAgentDetails(agentId);
      return agentId;
    } catch (error) {
      console.warn(`Agent ${agentId} not found, creating new one`);
      localStorage.removeItem(storageKey);
    }
  }
  
  // Create new agent (site_id can be null for global agents)
  const agent = await createAgent({ site_id: siteId, context_type: contextType });
  localStorage.setItem(storageKey, agent.id);
  return agent.id;
};

/**
 * Switch to a different agent
 * @param {number|null} siteId - Site ID (null for global agents)
 * @param {string} contextType - Context type
 * @param {string} agentId - Agent ID to switch to
 */
export const switchAgent = (siteId, contextType, agentId) => {
  const storageKey = siteId ? `agent_${siteId}_${contextType}` : `agent_global_${contextType}`;
  localStorage.setItem(storageKey, agentId);
};

/**
 * Create a new agent (used by "Refresh" button)
 * @param {number|null} siteId - Site ID (null for global agents)
 * @param {string} contextType - Context type
 * @returns {Promise<object>} New agent data
 */
export const createNewAgent = async (siteId, contextType) => {
  const agent = await createAgent({ site_id: siteId, context_type: contextType });
  switchAgent(siteId, contextType, agent.id);
  return agent;
};
