import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Typography, Stack, TextField, Button, IconButton, Tooltip, Menu, MenuItem, ListItemText, Divider, Select, FormControl } from '@mui/material';
import { ChevronRight as ChevronRightIcon, RestartAlt as RestartAltIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';
import useNewEditorStore from '../../store/newEditorStore';
import { buildContextMessage, extractModuleTypes, estimateTokens, formatErrorMessage } from './aiHelpers';
import { getChatHistory, resetChatHistory, processAITaskWithContext } from '../../../services/chatService';
import { getOrCreateAgent, createNewAgent, getAgents, switchAgent } from '../../../services/agentService';

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
  const listRef = useRef(null);
  const pollIntervalRef = useRef(null);
  
  const { site, currentPageId, selectedModuleId } = useNewEditorStore();

  // Determine which site to use: selectedSiteId (Events) or site from editor
  const activeSite = selectedSiteId 
    ? { id: selectedSiteId, name: availableSites.find(s => s.id === selectedSiteId)?.name || 'Wybrana strona' }
    : site;

  console.log('[AI] Active site:', activeSite, 'selectedSiteId:', selectedSiteId, 'site:', site?.id);

  // Load or create agent on mount
  useEffect(() => {
    const initializeAgent = async () => {
      // For studio_editor, allow initialization even without site (global agent)
      // For other contexts, require site
      const canInitialize = contextType === 'studio_editor' || activeSite?.id;
      
      if (!canInitialize || historyLoaded) return;

      console.log('[AI] Initializing agent for site:', activeSite?.id || 'global', 'context:', contextType);

      try {
        // Use site ID if available, regardless of context type
        // Only fall back to null for studio_editor when no site is selected
        const siteIdToUse = activeSite?.id || null;
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
  }, [activeSite?.id, contextType, historyLoaded]);

  const loadAgentHistory = async (agentId) => {
    try {
      const data = await getChatHistory({ agent_id: agentId, limit: 20 });

      if (data.agent) {
        setCurrentAgentName(data.agent.name);
      }

      if (data.messages && data.messages.length > 0) {
        const historyMessages = data.messages.flatMap(msg => [
          { id: `user-history-${msg.id}`, sender: 'user', text: msg.user_message },
          { id: `ai-history-${msg.id}`, sender: 'ai', text: msg.ai_response }
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
      const data = await getAgents({ site_id: activeSite.id, context_type: contextType });
      setAvailableAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
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
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: messageText }]);
    setInput('');
    setIsProcessing(true);

    const loadingMsgId = `ai-loading-${Date.now()}`;
    setProcessingMessageId(loadingMsgId);

    try {
      // Extract mentioned module types for logging
      const mentionedModules = extractModuleTypes(messageText);
      
      // Build context with full site structure + context_type, site_id, and agent_id
      const contextData = buildContextMessage(mode, activeSite, currentPageId);
      contextData.context_type = contextType;
      contextData.site_id = activeSite?.id;
      contextData.agent_id = agentId; // Add agent ID
      
      // Log for debugging
      const tokenEstimate = estimateTokens(JSON.stringify(contextData));
      console.log(`[AI] Sending context: ~${tokenEstimate} tokens, mentioned modules:`, mentionedModules);
      console.log(`[AI] Context type: ${contextType}, Site ID: ${activeSite?.id}, Agent ID: ${agentId}`);

      // Send to AI and get task_id
      const response = await processAITaskWithContext(messageText, activeSite, contextData);
      const taskId = response.task_id;

      // Add loading message with animation
      setMessages((prev) => [
        ...prev,
        { 
          id: loadingMsgId,
          sender: 'ai', 
          text: 'Myślę',
          isLoading: true,
          taskId
        }
      ]);

      // Start polling for result
      pollForResult(taskId, loadingMsgId);

    } catch (error) {
      console.error('AI task failed:', error);
      setProcessingMessageId(null);
      setMessages((prev) => [
        ...prev,
        { 
          id: `ai-error-${Date.now()}`, 
          sender: 'ai', 
          text: `Wystąpił błąd: ${formatErrorMessage(error)}. Spróbuj ponownie.` 
        }
      ]);
      setIsProcessing(false);
    }
  };

  const pollForResult = async (taskId, loadingMsgId) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Use apiClient which handles auth automatically
        const response = await apiClient.get(`/ai-task/${taskId}/poll/`);
        const result = response.data;

        if (result.status === 'pending') {
          return; // Keep polling
        }

        // Got result - stop polling
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;

        // Handle clarification - AI asks for more details
        if (result.status === 'clarification') {
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
          
          // Automatically execute the API call
          try {
            const apiResponse = await apiClient({
              method: result.method.toLowerCase(),
              url: result.endpoint,
              data: result.body
            });
            
            console.log('[AI] API call successful:', apiResponse.data);
            
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
                      eventId: apiResponse.data.id  // Store event ID for history context
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
        
        // Dispatch custom event (same as WebSocket did)
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

      } catch (error) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        console.error('Polling error:', error);
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === loadingMsgId
              ? { ...msg, text: '✗ Błąd połączenia', isLoading: false }
              : msg
          )
        );
        setProcessingMessageId(null);
        setIsProcessing(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Listen for AI updates via custom event
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
        {groupedMessages.map((message) => (
          <Stack
            key={message.id}
            alignItems={message.sender === 'user' ? 'flex-end' : 'flex-start'}
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
                gap: 1
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
          disabled={isProcessing}
          variant="outlined"
          size="small"
          fullWidth
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
              input: {
                color: 'rgb(220, 220, 220)'
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
