import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Stack, TextField, Button, IconButton, Tooltip, Menu, MenuItem, ListItemText, Divider, Select, FormControl, Chip, Alert } from '@mui/material';
import { ChevronRight as ChevronRightIcon, RestartAlt as RestartAltIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, Undo as UndoIcon, Replay as ReplayIcon, History as HistoryIcon } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';
import useNewEditorStore from '../../store/newEditorStore';
import { buildContextMessage, extractModuleTypes, estimateTokens, formatErrorMessage } from './aiHelpers';
import { getChatHistory, resetChatHistory, processAITaskWithContext, markChatMessagesDeleted } from '../../../services/chatService';
import { getOrCreateAgent, createNewAgent, getAgents, switchAgent } from '../../../services/agentService';
import { listCheckpoints, restoreCheckpoint } from '../../../services/checkpointService';
import { savePendingMessage, getPendingMessagesByAgent, removePendingMessage, markMessageAsSent } from '../../../services/messagePersistence';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

const AIChatPanel = ({ 
  onClose, 
  isProcessing: externalIsProcessing, 
  onProcessingChange, 
  mode = 'detail', 
  contextType = 'studio_editor', 
  onTaskComplete,
  selectedSiteId = null,  // For Events page - external site selection
  availableSites = [],    // For Events page - list of sites
  onSiteChange = null     // For Events page - callback when site changes
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessageId, setProcessingMessageId] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [currentAgentName, setCurrentAgentName] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [checkpointMenuAnchor, setCheckpointMenuAnchor] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const listRef = useRef(null);
  const wsRef = useRef(null);
  const wsReconnectTimeoutRef = useRef(null);
  const pendingTasksRef = useRef(new Map()); // Map<taskId, {loadingMsgId, userMsgId}>
  const isRevertingRef = useRef(false);  // Prevent reload during revert
  
  const showToast = useToast();
  const { user } = useAuth();
  
  const { site, siteId, currentPageId, selectedModuleId } = useNewEditorStore();

  // Determine which site to use: selectedSiteId (Events) or site from editor
  const activeSite = selectedSiteId 
    ? { id: selectedSiteId, name: availableSites.find(s => s.id === selectedSiteId)?.name || 'Wybrana strona' }
    : site;
  
  const activeSiteId = selectedSiteId || siteId;

  console.log('[AI] Active site ID:', activeSiteId, 'selectedSiteId:', selectedSiteId, 'siteId:', siteId);

  // Load or create agent on mount
  useEffect(() => {
    const initializeAgent = async () => {
      // For studio_editor, allow initialization even without site (global agent)
      // For other contexts, require site
      const canInitialize = contextType === 'studio_editor' || activeSiteId;
      
      if (!canInitialize || historyLoaded || isRevertingRef.current) return;

      console.log('[AI] Initializing agent for site:', activeSiteId || 'global', 'context:', contextType);

      try {
        // Use site ID if available, regardless of context type
        // Only fall back to null for studio_editor when no site is selected
        const siteIdToUse = activeSiteId || null;
        const agentId = await getOrCreateAgent(siteIdToUse, contextType);
        console.log('[AI] Agent ID:', agentId);
        setCurrentAgentId(agentId);

        // Load history for this agent
        await loadAgentHistory(agentId);

        // Load all available agents
        await loadAvailableAgents();

        setHistoryLoaded(true);
        console.log('[AI] Agent initialization complete');
      } catch (error) {
        console.error('[AI] Failed to initialize agent:', error);
        setHistoryLoaded(true);
      }
    };

    initializeAgent();
  }, [activeSiteId, contextType, historyLoaded]);

  const loadAgentHistory = async (agentId) => {
    try {
      const data = await getChatHistory({ agent_id: agentId, limit: 20 });

      if (data.agent) {
        setCurrentAgentName(data.agent.name);
      }

      if (data.messages && data.messages.length > 0) {
        const historyMessages = data.messages.flatMap(msg => [
          { 
            id: `user-history-${msg.id}`, 
            sender: 'user', 
            text: msg.user_message,
            db_message_id: msg.id  // Store DB ID for reverting
          },
          { 
            id: `ai-history-${msg.id}`, 
            sender: 'ai', 
            text: msg.ai_response,
            db_message_id: msg.id,  // Same DB ID for the pair
            eventId: msg.related_event_id  // Restore event ID from database
          }
        ]);

        setMessages([
          { id: 'intro', sender: 'ai', text: 'Cześć! Jestem Twoim asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!' },
          ...historyMessages
        ]);
      } else {
        setMessages([
          { id: 'intro', sender: 'ai', text: 'Cześć! Jestem Twoim asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load agent history:', error);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      const data = await getAgents({ site_id: activeSiteId, context_type: contextType });
      setAvailableAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  // Load checkpoints when site changes
  useEffect(() => {
    const loadCheckpoints = async () => {
      if (!activeSiteId) return;
      
      try {
        const data = await listCheckpoints(activeSiteId);
        setCheckpoints(data.checkpoints || []);
      } catch (error) {
        console.error('Failed to load checkpoints:', error);
      }
    };
    
    loadCheckpoints();
  }, [activeSiteId]);

  // Load pending messages when agent changes
  useEffect(() => {
    if (!currentAgentId) return;
    
    const pending = getPendingMessagesByAgent(currentAgentId);
    setPendingMessages(pending);
    
    if (pending.length > 0) {
      console.log(`[AI] Found ${pending.length} pending messages for agent ${currentAgentId}`);
    }
  }, [currentAgentId]);

  const handleRestoreCheckpoint = async (checkpointId) => {
    setCheckpointMenuAnchor(null);
    
    if (!activeSiteId) return;
    
    try {
      const response = await restoreCheckpoint(activeSiteId, checkpointId);
      
      // Dispatch event to reload site in editor
      window.dispatchEvent(new CustomEvent('ai-site-updated', {
        detail: response
      }));
      
      setMessages(prev => [
        ...prev,
        { 
          id: `ai-restore-${Date.now()}`, 
          sender: 'ai', 
          text: '✓ Cofnięto zmiany do poprzedniego stanu' 
        }
      ]);
      
      // Reload checkpoints
      const data = await listCheckpoints(activeSiteId);
      setCheckpoints(data.checkpoints || []);
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      setMessages(prev => [
        ...prev,
        { 
          id: `ai-error-${Date.now()}`, 
          sender: 'ai', 
          text: `✗ Nie udało się cofnąć zmian: ${formatErrorMessage(error)}` 
        }
      ]);
    }
  };

  const handleRetryPendingMessage = async (pendingMsg) => {
    // Remove from pending list
    removePendingMessage(pendingMsg.id);
    setPendingMessages(prev => prev.filter(m => m.id !== pendingMsg.id));
    
    // Retry sending
    await sendMessage(pendingMsg.text, currentAgentId);
  };

  const handleRevertToMessage = async (messageId) => {
    console.log('[AI] ========== REVERT TO MESSAGE ==========');
    
    // Set reverting flag to prevent history reload
    isRevertingRef.current = true;
    
    // Find the clicked message
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const clickedMessage = messages[messageIndex];
    
    if (messageIndex === -1 || !clickedMessage) {
      console.error('[AI] Message not found:', messageId);
      return;
    }
    
    console.log('[AI] Clicked message:', clickedMessage);
    console.log('[AI] Message index:', messageIndex);
    
    // Set the message text back to input field
    if (clickedMessage.sender === 'user') {
      setInput(clickedMessage.text);
      console.log('[AI] ✓ Set input to:', clickedMessage.text);
    }
    
    // Remove all messages from this point forward (including this one)
    const messagesBeforeClick = messages.slice(0, messageIndex);
    console.log('[AI] Keeping', messagesBeforeClick.length, 'messages before clicked message');
    
    // Find the DB message ID to mark as deleted
    const dbMessageId = clickedMessage.db_message_id;
    
    if (!dbMessageId) {
      console.log('[AI] No DB message ID - this is a local-only message, just updating UI');
      setMessages(messagesBeforeClick);
      return;
    }
    
    console.log('[AI] DB message ID:', dbMessageId);
    
    // Mark messages as deleted in database (for all contexts)
    try {
      console.log('[AI] Step 1: Marking messages as deleted...');
      
      await markChatMessagesDeleted({
        agent_id: currentAgentId,
        message_id: dbMessageId
      });
      console.log('[AI] ✓ Messages marked as deleted in database');
    } catch (error) {
      console.error('[AI] ✗ Failed to mark messages as deleted:', error);
      // Continue anyway - at least update UI
    }
    
    // For editor context, also restore checkpoint
    if (activeSiteId && contextType === 'studio_editor') {
      try {
        
        // Step 2: Get checkpoints
        console.log('[AI] Step 2: Getting checkpoints...');
        const data = await listCheckpoints(activeSiteId);
        const allCheckpoints = data.checkpoints || [];
        
        console.log(`[AI] Found ${allCheckpoints.length} checkpoints`);
        console.log('[AI] Checkpoints:', allCheckpoints.map((cp, i) => ({ 
          index: i, 
          message: cp.message?.substring(0, 50), 
          timestamp: cp.timestamp 
        })));
        
        if (allCheckpoints.length > 0) {
          // Count how many user messages with db_message_id are from this point forward (inclusive)
          const userMessagesFromHere = messages
            .slice(messageIndex)
            .filter(m => m.sender === 'user' && m.db_message_id)
            .length;
          
          console.log(`[AI] User messages from clicked point forward: ${userMessagesFromHere}`);
          
          // Checkpoints are sorted newest first (index 0 = latest)
          // We want checkpoint that was BEFORE this user message
          // If we're reverting 1 user message, we want checkpoint at index 0 (the one created before it)
          const checkpointIndex = userMessagesFromHere - 1;
          
          console.log(`[AI] Calculated checkpoint index: ${checkpointIndex}`);
          
          if (checkpointIndex >= 0 && checkpointIndex < allCheckpoints.length) {
            const checkpointToRestore = allCheckpoints[checkpointIndex];
            
            console.log(`[AI] Step 3: Restoring checkpoint [${checkpointIndex}]: ${checkpointToRestore.message?.substring(0, 50)}...`);
            
            // Restore checkpoint
            const restoreResponse = await restoreCheckpoint(activeSiteId, checkpointToRestore.id);
            console.log('[AI] ✓ Checkpoint restored:', restoreResponse);
            
            // Step 4: Force reload site data from server
            console.log('[AI] Step 4: Reloading site data from server...');
            const siteResponse = await apiClient.get(`/sites/${activeSiteId}/`);
            const updatedSite = siteResponse.data;
            
            console.log('[AI] ✓ Site data reloaded');
            console.log('[AI] Step 5: Dispatching ai-site-updated event...');
            
            // Dispatch event to update editor with fresh data
            window.dispatchEvent(new CustomEvent('ai-site-updated', {
              detail: {
                status: 'success',
                site: updatedSite.template_config,
                explanation: 'Przywrócono poprzedni stan'
              }
            }));
            
            console.log('[AI] ✓ Event dispatched successfully');
            
            // Step 6: Update UI - remove messages from clicked point forward
            setMessages(messagesBeforeClick);
            
            // Show success toast
            showToast('Cofnięto zmiany. Możesz teraz napisać nową wiadomość.', { variant: 'success' });
            
            console.log('[AI] ✓ UI updated');
            
            // Step 7: Reload checkpoints list
            const updatedData = await listCheckpoints(activeSiteId);
            setCheckpoints(updatedData.checkpoints || []);
            console.log('[AI] ✓ Checkpoints reloaded');
            
            // Clear any processing state
            setIsProcessing(false);
            setProcessingMessageId(null);
            
            // Clear reverting flag after a short delay
            setTimeout(() => {
              isRevertingRef.current = false;
            }, 100);
            
            console.log('[AI] ========== REVERT COMPLETE ==========');
            return;
          } else {
            console.error(`[AI] ✗ No checkpoint available at index ${checkpointIndex}`);
          }
        } else {
          console.error('[AI] ✗ No checkpoints available');
        }
      } catch (error) {
        console.error('[AI] ✗ Failed during revert:', error);
        console.error('[AI] Error details:', error.response?.data || error.message);
        
        // Clear reverting flag on error
        isRevertingRef.current = false;
        
        setMessages(prev => [
          ...prev,
          {
            id: `ai-error-${Date.now()}`,
            sender: 'ai',
            text: `✗ Nie udało się przywrócić: ${error.response?.data?.error || error.message}`
          }
        ]);
        return;
      }
    }
    
    // Fallback: Just remove messages locally (for non-editor contexts or if restore failed)
    console.log('[AI] Fallback: updating UI only (no checkpoints for this context)');
    console.log('[AI] Context type:', contextType);
    console.log('[AI] Messages to check:', messages.length);
    console.log('[AI] Message index:', messageIndex);
    
    // For studio_events, delete any events that were created in the reverted messages
    if (contextType === 'studio_events') {
      console.log('[AI] This is studio_events context - checking for events to delete');
      const revertedMessages = messages.slice(messageIndex);
      console.log('[AI] Reverted messages:', revertedMessages.length);
      console.log('[AI] Reverted messages details:', revertedMessages.map(m => ({
        id: m.id,
        sender: m.sender,
        eventId: m.eventId,
        text: m.text?.substring(0, 50)
      })));
      
      const eventIdsToDelete = revertedMessages
        .filter(msg => msg.sender === 'ai' && msg.eventId)
        .map(msg => msg.eventId);
      
      console.log('[AI] Event IDs to delete:', eventIdsToDelete);
      
      if (eventIdsToDelete.length > 0) {
        console.log('[AI] Deleting events created in reverted messages:', eventIdsToDelete);
        
        // Delete each event
        for (const eventId of eventIdsToDelete) {
          try {
            console.log(`[AI] Attempting to delete event ${eventId}...`);
            await apiClient.delete(`/big-events/${eventId}/`);
            console.log(`[AI] ✓ Deleted event ${eventId}`);
          } catch (error) {
            console.error(`[AI] ✗ Failed to delete event ${eventId}:`, error);
          }
        }
        
        // Dispatch event to refresh Events page
        console.log('[AI] Dispatching big-event-deleted event');
        window.dispatchEvent(new CustomEvent('big-event-deleted'));
      } else {
        console.log('[AI] No events to delete');
      }
    } else {
      console.log('[AI] Not studio_events context, skipping event deletion');
    }
    
    setMessages(messagesBeforeClick);
    
    // Show success toast for non-editor contexts
    if (contextType !== 'studio_editor') {
      showToast('Cofnięto zmiany. Możesz teraz napisać nową wiadomość.', { variant: 'success' });
    }
    
    // Clear any processing state
    setIsProcessing(false);
    setProcessingMessageId(null);
    
    // Clear reverting flag after a short delay
    setTimeout(() => {
      isRevertingRef.current = false;
    }, 100);
    
    console.log('[AI] ========== REVERT COMPLETE (fallback) ==========');
  };

  // Sync internal processing state with parent
  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isProcessing);
    }
  }, [isProcessing, onProcessingChange]);

  const handleRefresh = async () => {
    // Cancel any ongoing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      // Use site ID if available, null for global agents
      const siteIdToUse = activeSite?.id || null;
      
      // Create new agent
      const newAgent = await createNewAgent(siteIdToUse, contextType);
      setCurrentAgentId(newAgent.id);
      setCurrentAgentName(newAgent.name);

      // Reset messages
      setMessages([
        { id: 'intro', sender: 'ai', text: 'Cześć! Jestem Twoim nowym asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!' }
      ]);

      setInput('');
      setIsProcessing(false);
      setProcessingMessageId(null);

      // Reload agents list
      await loadAvailableAgents();
    } catch (error) {
      console.error('Failed to create new agent:', error);
    }
  };

  const handleReset = async () => {
    if (!currentAgentId) return;

    try {
      await resetChatHistory({ agent_id: currentAgentId });

      // Clear messages
      setMessages([
        { id: 'intro', sender: 'ai', text: 'Cześć! Jestem Twoim asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!' }
      ]);
    } catch (error) {
      console.error('Failed to reset chat history:', error);
    }
  };

  const handleAgentSwitch = async (agentId) => {
    setAgentMenuAnchor(null);

    if (agentId === currentAgentId) return;

    // Switch agent in localStorage (use site ID if available, null otherwise)
    const siteIdToUse = activeSite?.id || null;
    switchAgent(siteIdToUse, contextType, agentId);
    setCurrentAgentId(agentId);

    // Load new agent's history
    await loadAgentHistory(agentId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    // If no agent yet, create one now
    if (!currentAgentId) {
      try {
        console.log('[AI] No agent ID, creating one...');
        // Use site ID if available, regardless of context
        const siteIdToUse = activeSite?.id || null;
        
        if (!siteIdToUse && contextType !== 'studio_editor') {
          console.error('[AI] No site ID for context:', contextType);
          setMessages((prev) => [
            ...prev,
            { 
              id: `ai-error-${Date.now()}`, 
              sender: 'ai', 
              text: 'Wybierz stronę, aby kontynuować.' 
            }
          ]);
          return;
        }
        
        const agentId = await getOrCreateAgent(siteIdToUse, contextType);
        setCurrentAgentId(agentId);
        console.log('[AI] Agent created:', agentId);
        
        // Now proceed with the message
        await sendMessage(trimmed, agentId);
      } catch (error) {
        console.error('[AI] Failed to create agent:', error);
        setMessages((prev) => [
          ...prev,
          { 
            id: `ai-error-${Date.now()}`, 
            sender: 'ai', 
            text: `Nie mogę utworzyć asystenta: ${formatErrorMessage(error)}` 
          }
        ]);
      }
      return;
    }

    await sendMessage(trimmed, currentAgentId);
  };

  const sendMessage = async (messageText, agentId) => {
    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: messageText }]);
    setInput('');
    setIsProcessing(true);

    const loadingMsgId = `ai-loading-${Date.now()}`;
    setProcessingMessageId(loadingMsgId);

    // Create pending message object
    const pendingMsg = {
      id: userMsgId,
      text: messageText,
      agentId: agentId,
      siteId: activeSite?.id,
      contextType: contextType,
      timestamp: new Date().toISOString()
    };

    // Save as pending immediately (will be removed when we get response)
    savePendingMessage(pendingMsg);
    console.log('[AI] Saved message as pending:', userMsgId);

    try {
      // Extract mentioned module types for logging
      const mentionedModules = extractModuleTypes(messageText);
      
      // Build context with full site structure + context_type, site_id, and agent_id
      const contextData = buildContextMessage(mode, activeSite, currentPageId);
      contextData.context_type = contextType;
      contextData.site_id = activeSiteId;
      contextData.agent_id = agentId; // Add agent ID
      
      // Log for debugging
      const tokenEstimate = estimateTokens(JSON.stringify(contextData));
      console.log(`[AI] Sending context: ~${tokenEstimate} tokens, mentioned modules:`, mentionedModules);
      console.log(`[AI] Context type: ${contextType}, Site ID: ${activeSiteId}, Agent ID: ${agentId}`);

      // Send to AI and get task_id
      const response = await processAITaskWithContext(messageText, activeSite, contextData);
      const taskId = response.task_id;

      console.log('[AI] Message sent, task ID:', taskId);

      // Add loading message with animation
      setMessages((prev) => [
        ...prev,
        { 
          id: loadingMsgId,
          sender: 'ai', 
          text: 'Myślę',
          isLoading: true,
          taskId,
          userMsgId // Store reference to user message for cleanup
        }
      ]);

      // Register task for WebSocket response
      pendingTasksRef.current.set(taskId, { loadingMsgId, userMsgId });
      console.log('[AI] Task registered for WebSocket:', taskId);

    } catch (error) {
      console.error('AI task failed:', error);
      
      // Message is already saved as pending, so just show error
      // Keep it in pending list for retry
      setPendingMessages(prev => [...prev, pendingMsg]);
      
      setMessages((prev) => [
        ...prev,
        { 
          id: `ai-error-${Date.now()}`, 
          sender: 'ai', 
          text: `❌ Nie udało się wysłać wiadomości. Kliknij na nią powyżej, aby spróbować ponownie.` 
        }
      ]);
      
      setProcessingMessageId(null);
      setIsProcessing(false);
    }
  };

  // WebSocket connection for real-time AI updates
  const connectWebSocket = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) return;

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const backendHost = API_BASE.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '');
    const wsProtocol = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${backendHost}/ws/ai-updates/${user.id}/`;

    console.log('[AI WebSocket] Connecting to:', wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[AI WebSocket] Connected');
    };

    socket.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        console.log('[AI WebSocket] Received:', result.status, result.task_id);
        handleAIResult(result);
      } catch (error) {
        console.error('[AI WebSocket] Parse error:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('[AI WebSocket] Error:', error);
    };

    socket.onclose = (event) => {
      console.log('[AI WebSocket] Closed, code:', event.code);
      wsRef.current = null;
      // Reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        wsReconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };

    wsRef.current = socket;
  }, [user?.id]);

  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsReconnectTimeoutRef.current) {
        clearTimeout(wsReconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [connectWebSocket]);

  // Handle AI result from WebSocket
  const handleAIResult = useCallback(async (result) => {
    const taskId = result.task_id;
    const pendingTask = pendingTasksRef.current.get(taskId);
    
    if (!pendingTask) {
      console.log('[AI WebSocket] No pending task for:', taskId);
      return;
    }

    const { loadingMsgId, userMsgId } = pendingTask;
    pendingTasksRef.current.delete(taskId);

    // Remove message from pending list (got response)
    if (userMsgId) {
      removePendingMessage(userMsgId);
      setPendingMessages(prev => prev.filter(m => m.id !== userMsgId));
      console.log('[AI] Removed message from pending:', userMsgId);
    }

    // Handle clarification - AI asks for more details
    if (result.status === 'clarification') {
      // Update user message with DB ID if available
      if (result.chat_history_id && userMsgId) {
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === userMsgId
              ? { ...msg, db_message_id: result.chat_history_id }
              : msg
          )
        );
      }

      setMessages((prev) => 
        prev.map(msg => 
          msg.id === loadingMsgId
            ? { 
                ...msg, 
                text: result.question,
                isLoading: false,
                sender: 'ai'
              }
            : msg
        )
      );
      setProcessingMessageId(null);
      setIsProcessing(false);
      return;
    }

    // Handle API call - AI provides instructions for API operation
    if (result.status === 'api_call') {
      console.log('[AI] Executing API call:', result.endpoint, result.method);
      
      // Update user message with DB ID if available
      if (result.chat_history_id && userMsgId) {
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === userMsgId
              ? { ...msg, db_message_id: result.chat_history_id }
              : msg
          )
        );
      }
      
      // Automatically execute the API call
      try {
        const apiResponse = await apiClient({
          method: result.method.toLowerCase(),
          url: result.endpoint,
          data: result.body
        });
        
        console.log('[AI] API call successful:', apiResponse.data);
        
        // If event was created/updated, save event_id to ChatHistory
        if (result.chat_history_id && apiResponse.data.id) {
          try {
            await apiClient.patch(`/chat/history/${result.chat_history_id}/`, {
              related_event_id: apiResponse.data.id
            });
            console.log(`[AI] ✓ Saved event ID ${apiResponse.data.id} to chat history`);
          } catch (error) {
            console.error('[AI] Failed to save event ID to chat history:', error);
          }
        }
        
        // Determine operation type from method
        const operationType = result.method.toUpperCase() === 'POST' ? 'Utworzono' : 'Zaktualizowano';
        const operationVerb = result.method.toUpperCase() === 'POST' ? 'dodane' : 'zaktualizowane';
        
        const successMessage = `✓ ${result.explanation}\n\n**${operationType} wydarzenie:**\n- ID: ${apiResponse.data.id}\n- Tytuł: ${apiResponse.data.title}\n- Data: ${apiResponse.data.start_date}${apiResponse.data.end_date ? ` - ${apiResponse.data.end_date}` : ''}\n\nWydarzenie zostało ${operationVerb} w Twoim kalendarzu!`;
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === loadingMsgId
              ? { 
                  ...msg, 
                  text: successMessage,
                  isLoading: false,
                  sender: 'ai',
                  eventId: apiResponse.data.id
                }
              : msg
          )
        );
        
        // Dispatch event to refresh Events page
        window.dispatchEvent(new CustomEvent('big-event-created', {
          detail: apiResponse.data
        }));
        
      } catch (apiError) {
        console.error('[AI] API call failed:', apiError);
        
        const errorMessage = `✗ Nie udało się utworzyć wydarzenia.\n\n**Błąd:** ${apiError.response?.data?.detail || apiError.message}\n\n**Instrukcje do ręcznego dodania:**\n\`\`\`json\n${JSON.stringify(result.body, null, 2)}\n\`\`\`\n\nEndpoint: ${result.method} ${result.endpoint}`;
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === loadingMsgId
              ? { 
                  ...msg, 
                  text: errorMessage,
                  isLoading: false,
                  sender: 'ai'
                }
              : msg
          )
        );
      }
      
      setProcessingMessageId(null);
      setIsProcessing(false);
      return;
    }
    
    // Update user message with DB ID if available (for success status)
    if (result.status === 'success' && result.chat_history_id && userMsgId) {
      setMessages((prev) =>
        prev.map(msg =>
          msg.id === userMsgId
            ? { ...msg, db_message_id: result.chat_history_id }
            : msg
        )
      );
      console.log('[AI] Updated user message with DB ID:', result.chat_history_id);
    }

    // Handle error status
    if (result.status === 'error') {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === loadingMsgId
            ? { ...msg, text: `✗ ${result.error || 'Błąd przetwarzania'}`, isLoading: false }
            : msg
        )
      );
      setProcessingMessageId(null);
      setIsProcessing(false);
      return;
    }

    // Dispatch custom event for editor update
    window.dispatchEvent(new CustomEvent('ai-update-received', {
      detail: { 
        status: result.status, 
        explanation: result.explanation || result.error,
        site: result.site
      }
    }));

    // If success, also update the site in editor
    if (result.status === 'success' && result.site) {
      // This will be handled by NewEditorPage's event listener
      window.dispatchEvent(new CustomEvent('ai-site-updated', {
        detail: result
      }));
    }

    // Update loading message with success
    setMessages((prev) => 
      prev.map(msg => 
        msg.id === loadingMsgId
          ? { 
              ...msg, 
              text: `✓ ${result.explanation || 'Zmiany wprowadzone pomyślnie'}`,
              isLoading: false
            }
          : msg
      )
    );
    setProcessingMessageId(null);
    setIsProcessing(false);
  }, []);

  // Listen for AI updates via custom event (fallback for WebSocket)
  useEffect(() => {
    const handleAIUpdate = (event) => {
      const { status, explanation } = event.detail;
      
      if (processingMessageId) {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === processingMessageId
              ? { 
                  ...msg, 
                  text: status === 'success' 
                    ? `✓ Gotowe! ${explanation || 'Zmiany zostały wprowadzone.'}` 
                    : `✗ Błąd: ${explanation}`,
                  isLoading: false
                }
              : msg
          )
        );
        setProcessingMessageId(null);
        setIsProcessing(false);
        
        // Notify parent that task is complete (success or error)
        if (onTaskComplete) {
          onTaskComplete(status === 'success');
        }
      }
    };

    window.addEventListener('ai-update-received', handleAIUpdate);
    return () => window.removeEventListener('ai-update-received', handleAIUpdate);
  }, [processingMessageId, onTaskComplete]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const groupedMessages = useMemo(() => messages, [messages]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(12, 12, 12, 0.85)',
        color: 'rgb(220, 220, 220)',
        borderLeft: '1px solid rgba(220, 220, 220, 0.12)'
      }}
    >
      {/* Site Selector (for Events page) */}
      {availableSites.length > 0 && onSiteChange && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid rgba(220, 220, 220, 0.12)',
            bgcolor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography sx={{ fontSize: '12px', mb: 1, opacity: 0.7 }}>
            Wybierz stronę:
          </Typography>
          <Select
            value={selectedSiteId || ''}
            onChange={(e) => {
              const newSite = availableSites.find(s => s.id === parseInt(e.target.value));
              if (newSite && onSiteChange) {
                onSiteChange(newSite);
                // Reset agent when changing site
                setHistoryLoaded(false);
                setCurrentAgentId(null);
                setMessages([]);
              }
            }}
            size="small"
            fullWidth
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgb(220, 220, 220)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.12)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.24)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(146, 0, 32)'
              },
              '& .MuiSelect-icon': {
                color: 'rgb(220, 220, 220)'
              }
            }}
          >
            {availableSites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid rgba(220, 220, 220, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 500 }}>
            Asystent AI
          </Typography>
          {currentAgentName && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setAgentMenuAnchor(e.currentTarget)}
                sx={{
                  color: 'rgb(220, 220, 220)',
                  '&:hover': {
                    bgcolor: 'rgba(220, 220, 220, 0.1)'
                  }
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
              <Menu
                anchorEl={agentMenuAnchor}
                open={Boolean(agentMenuAnchor)}
                onClose={() => setAgentMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgb(12, 12, 12)',
                    color: 'rgb(220, 220, 220)',
                    border: '1px solid rgba(220, 220, 220, 0.12)'
                  }
                }}
              >
                <MenuItem disabled>
                  <ListItemText
                    primary="Wybierz asystenta"
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </MenuItem>
                <Divider sx={{ bgcolor: 'rgba(220, 220, 220, 0.12)' }} />
                {availableAgents.map((agent) => (
                  <MenuItem
                    key={agent.id}
                    selected={agent.id === currentAgentId}
                    onClick={() => handleAgentSwitch(agent.id)}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'rgba(146, 0, 32, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(146, 0, 32, 0.3)'
                        }
                      }
                    }}
                  >
                    <ListItemText
                      primary={agent.name}
                      secondary={`${agent.message_count} wiadomości`}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {checkpoints.length > 0 && contextType === 'studio_editor' && (
            <>
              <Tooltip title="Cofnij zmiany AI">
                <IconButton
                  onClick={(e) => setCheckpointMenuAnchor(e.currentTarget)}
                  disabled={isProcessing}
                  sx={{
                    color: 'rgb(220, 220, 220)',
                    '&:hover': {
                      bgcolor: 'rgba(220, 220, 220, 0.1)'
                    },
                    '&:disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  <UndoIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={checkpointMenuAnchor}
                open={Boolean(checkpointMenuAnchor)}
                onClose={() => setCheckpointMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgb(12, 12, 12)',
                    color: 'rgb(220, 220, 220)',
                    border: '1px solid rgba(220, 220, 220, 0.12)',
                    maxHeight: '400px'
                  }
                }}
              >
                <MenuItem disabled>
                  <ListItemText
                    primary="Wybierz punkt przywracania"
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </MenuItem>
                <Divider sx={{ bgcolor: 'rgba(220, 220, 220, 0.12)' }} />
                {checkpoints.map((checkpoint) => (
                  <MenuItem
                    key={checkpoint.id}
                    onClick={() => handleRestoreCheckpoint(checkpoint.id)}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      '&:hover': {
                        bgcolor: 'rgba(146, 0, 32, 0.2)'
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
                      {new Date(checkpoint.timestamp).toLocaleString('pl-PL')}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', opacity: 0.7, mt: 0.5 }}>
                      {checkpoint.message}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <Tooltip title="Utwórz nowego asystenta">
            <IconButton
              onClick={handleRefresh}
              disabled={isProcessing}
              sx={{
                color: 'rgb(220, 220, 220)',
                '&:hover': {
                  bgcolor: 'rgba(220, 220, 220, 0.1)'
                },
                '&:disabled': {
                  opacity: 0.5
                },
                '@keyframes spinLeft': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(-360deg)' }
                },
                '&:hover:not(:disabled)': {
                  animation: 'spinLeft 0.6s ease-in-out'
                }
              }}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Wyczyść historię tego asystenta">
            <IconButton
              onClick={handleReset}
              disabled={isProcessing}
              sx={{
                color: 'rgb(220, 220, 220)',
                '&:hover': {
                  bgcolor: 'rgba(220, 220, 220, 0.1)'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{
                color: 'rgb(220, 220, 220)',
                '&:hover': {
                  bgcolor: 'rgba(220, 220, 220, 0.1)'
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {pendingMessages.length > 0 && (
          <Alert 
            severity="warning" 
            sx={{ 
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              color: 'rgb(220, 220, 220)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              '& .MuiAlert-icon': {
                color: 'rgb(255, 152, 0)'
              }
            }}
          >
            Masz {pendingMessages.length} niewysłanych wiadomości. Kliknij na nie, aby wysłać ponownie.
          </Alert>
        )}
        
        {pendingMessages.map((pendingMsg) => (
          <Stack
            key={`pending-${pendingMsg.id}`}
            alignItems="flex-end"
          >
            <Box
              onClick={() => handleRetryPendingMessage(pendingMsg)}
              sx={{
                maxWidth: '92%',
                px: 2,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                bgcolor: 'rgba(255, 152, 0, 0.3)',
                border: '2px dashed rgba(255, 152, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.4)'
                }
              }}
            >
              <ReplayIcon sx={{ fontSize: '16px' }} />
              <span>{pendingMsg.text}</span>
              <Chip 
                label="Niewysłane" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255, 152, 0, 0.8)',
                  color: 'rgb(12, 12, 12)',
                  fontSize: '10px',
                  height: '18px'
                }} 
              />
            </Box>
          </Stack>
        ))}
        
        {groupedMessages.map((message, index) => (
          <Stack
            key={message.id}
            alignItems={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            sx={{ position: 'relative', width: '100%' }}
          >
            <Box
              sx={{
                maxWidth: '92%',
                px: 2,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                bgcolor: message.sender === 'user'
                  ? 'rgba(146, 0, 32, 0.85)'
                  : message.isLoading 
                    ? 'transparent'
                    : 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                position: 'relative',
                '&:hover .revert-button': {
                  opacity: 1
                }
              }}
            >
              <span>{message.text}</span>
              {message.isLoading && (
                <Box
                  component="span"
                  sx={{
                    '@keyframes dots': {
                      '0%, 20%': { content: '"."' },
                      '40%': { content: '".."' },
                      '60%, 100%': { content: '"..."' }
                    },
                    '&::after': {
                      content: '"."',
                      animation: 'dots 1.5s infinite'
                    }
                  }}
                />
              )}
              {message.sender === 'user' && !message.isLoading && index > 0 && (
                <Tooltip title="Cofnij do tego momentu" placement="right">
                  <IconButton
                    className="revert-button"
                    size="small"
                    onClick={() => handleRevertToMessage(message.id)}
                    sx={{
                      position: 'absolute',
                      left: '-40px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: 'rgb(220, 220, 220)',
                      bgcolor: 'rgba(12, 12, 12, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(146, 0, 32, 0.8)'
                      }
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: '18px' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Stack>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(220, 220, 220, 0.12)',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          placeholder="Napisz co chcesz zmienić..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          disabled={isProcessing}
          variant="outlined"
          size="small"
          fullWidth
          multiline
          minRows={1}
          InputProps={{
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.12)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.24)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(146, 0, 32)'
              },
              '& .MuiInputBase-input': {
                color: 'rgb(220, 220, 220)',
                fontFamily: 'inherit',
                fontSize: '0.95rem'
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(220, 220, 220, 0.6)',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isProcessing || !input.trim()}
          sx={{
            bgcolor: 'rgb(146, 0, 32)',
            '&:hover': {
              bgcolor: 'rgb(114, 0, 21)'
            },
            '&:disabled': {
              bgcolor: 'rgba(146, 0, 32, 0.5)'
            },
            whiteSpace: 'nowrap'
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default AIChatPanel;
