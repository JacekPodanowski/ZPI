/**
 * Message persistence helpers for AI chat
 * Saves messages to localStorage when WebSocket disconnects
 */

const MESSAGE_STORAGE_KEY = 'ai_pending_messages';

/**
 * Save a message to localStorage as pending
 * @param {Object} message - Message object with { id, text, agentId, siteId, contextType, timestamp }
 */
export const savePendingMessage = (message) => {
  try {
    const pending = getPendingMessages();
    pending.push({
      ...message,
      status: 'pending',
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(pending));
    console.log('[MessagePersistence] Saved pending message:', message.id);
  } catch (error) {
    console.error('[MessagePersistence] Failed to save pending message:', error);
  }
};

/**
 * Get all pending messages from localStorage
 * @returns {Array} Array of pending messages
 */
export const getPendingMessages = () => {
  try {
    const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[MessagePersistence] Failed to get pending messages:', error);
    return [];
  }
};

/**
 * Remove a message from pending list
 * @param {string} messageId - Message ID to remove
 */
export const removePendingMessage = (messageId) => {
  try {
    const pending = getPendingMessages();
    const filtered = pending.filter(m => m.id !== messageId);
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(filtered));
    console.log('[MessagePersistence] Removed pending message:', messageId);
  } catch (error) {
    console.error('[MessagePersistence] Failed to remove pending message:', error);
  }
};

/**
 * Get pending messages for specific agent
 * @param {string} agentId - Agent ID
 * @returns {Array} Filtered pending messages
 */
export const getPendingMessagesByAgent = (agentId) => {
  const all = getPendingMessages();
  return all.filter(m => m.agentId === agentId);
};

/**
 * Clear all pending messages
 */
export const clearAllPendingMessages = () => {
  try {
    localStorage.removeItem(MESSAGE_STORAGE_KEY);
    console.log('[MessagePersistence] Cleared all pending messages');
  } catch (error) {
    console.error('[MessagePersistence] Failed to clear pending messages:', error);
  }
};

/**
 * Mark message as sent successfully
 * @param {string} messageId - Message ID
 */
export const markMessageAsSent = (messageId) => {
  removePendingMessage(messageId);
};
