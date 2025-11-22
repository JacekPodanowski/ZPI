import apiClient from './apiClient';

/**
 * Checkpoint service for AI undo functionality
 */

/**
 * Create a checkpoint of current site state
 * @param {number} siteId - Site ID
 * @param {string} message - Checkpoint message/description
 * @returns {Promise<{checkpoint_id: string, message: string}>}
 */
export const createCheckpoint = async (siteId, message = 'AI checkpoint') => {
  const response = await apiClient.post(`/sites/${siteId}/checkpoints/`, { message });
  return response.data;
};

/**
 * Restore site to a previous checkpoint
 * @param {number} siteId - Site ID
 * @param {string} checkpointId - Checkpoint ID to restore
 * @returns {Promise<{message: string, site: Object}>}
 */
export const restoreCheckpoint = async (siteId, checkpointId) => {
  const response = await apiClient.post(`/sites/${siteId}/checkpoints/restore/${checkpointId}/`);
  return response.data;
};

/**
 * List all checkpoints for a site
 * @param {number} siteId - Site ID
 * @returns {Promise<{checkpoints: Array<{id: string, timestamp: string, message: string}>}>}
 */
export const listCheckpoints = async (siteId) => {
  const response = await apiClient.get(`/sites/${siteId}/checkpoints/list/`);
  return response.data;
};

/**
 * Create a checkpoint of current BigEvent state
 * @param {number} eventId - Event ID
 * @param {string} message - Checkpoint message/description
 * @returns {Promise<{checkpoint_id: string, message: string}>}
 */
export const createEventCheckpoint = async (eventId, message = 'AI checkpoint') => {
  const response = await apiClient.post(`/big-events/${eventId}/checkpoints/`, { message });
  return response.data;
};

/**
 * Restore BigEvent to a previous checkpoint
 * @param {number} eventId - Event ID
 * @param {string} checkpointId - Checkpoint ID to restore
 * @returns {Promise<{message: string, event: Object}>}
 */
export const restoreEventCheckpoint = async (eventId, checkpointId) => {
  const response = await apiClient.post(`/big-events/${eventId}/checkpoints/restore/${checkpointId}/`);
  return response.data;
};

/**
 * List all checkpoints for a BigEvent
 * @param {number} eventId - Event ID
 * @returns {Promise<{checkpoints: Array<{id: string, timestamp: string, message: string}>}>}
 */
export const listEventCheckpoints = async (eventId) => {
  const response = await apiClient.get(`/big-events/${eventId}/checkpoints/list/`);
  return response.data;
};
