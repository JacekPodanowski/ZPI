import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Typography, Stack, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import { ChevronRight as ChevronRightIcon, RestartAlt as RestartAltIcon } from '@mui/icons-material';
import { processAITask } from '../../../services/aiService';
import apiClient from '../../../services/apiClient';
import useNewEditorStore from '../../store/newEditorStore';

const AIChatPanel = ({ onClose, isProcessing: externalIsProcessing, onProcessingChange }) => {
  const [messages, setMessages] = useState([
    {
      id: 'intro',
      sender: 'ai',
      text: 'Cześć! Jestem Twoim asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessageId, setProcessingMessageId] = useState(null);
  const listRef = useRef(null);
  const pollIntervalRef = useRef(null);
  
  const { site, currentPageId, selectedModuleId } = useNewEditorStore();

  // Sync internal processing state with parent
  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isProcessing);
    }
  }, [isProcessing, onProcessingChange]);

  const handleRefresh = () => {
    // Cancel any ongoing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Reset state
    setMessages([
      {
        id: 'intro',
        sender: 'ai',
        text: 'Cześć! Jestem Twoim asystentem AI. Mogę pomóc Ci edytować stronę. Powiedz mi, co chcesz zmienić!'
      }
    ]);
    setInput('');
    setIsProcessing(false);
    setProcessingMessageId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    // Add user message
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: trimmed }]);
    setInput('');
    setIsProcessing(true);

    const loadingMsgId = `ai-loading-${Date.now()}`;
    setProcessingMessageId(loadingMsgId);

    try {
      // Optimize context: send structure without long mock content
      const optimizedSite = {
        ...site,
        pages: site.pages?.map(page => ({
          ...page,
          modules: page.modules?.map(module => ({
            id: module.id,
            name: module.name,
            type: module.type,
            enabled: module.enabled,
            // Include only essential content fields (remove long descriptions/offers)
            content: module.content ? {
              title: module.content.title,
              subtitle: module.content.subtitle,
              // Don't send full offers array, descriptions etc - only structure
              ...(module.content.offers ? { offersCount: module.content.offers.length } : {})
            } : {}
          }))
        }))
      };
      
      // Determine context: send only relevant page if possible
      let contextData = optimizedSite;
      let contextDescription = 'strukturę strony';
      
      // If user mentions specific page or we're on a specific page
      if (currentPageId && currentPageId !== 'home') {
        const currentPage = site.pages?.find(p => p.id === currentPageId);
        if (currentPage) {
          contextData = { 
            currentPageId,
            currentPageName: currentPage.name,
            structure: optimizedSite 
          };
          contextDescription = `stronę "${currentPage.name}"`;
        }
      }

      // Send to AI and get task_id
      const response = await processAITask(trimmed, contextData);
      const taskId = response.task_id;

      // Add loading message with animation
      setMessages((prev) => [
        ...prev,
        { 
          id: loadingMsgId,
          sender: 'ai', 
          text: 'Myślę',
          isLoading: true,
          taskId  // Store task_id for polling
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
          text: `Wystąpił błąd: ${error.response?.data?.error || error.message || 'Nieznany błąd'}. Spróbuj ponownie.` 
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
            detail: result  // Pass full result object with status, site, explanation, prompt
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
      }
    };

    window.addEventListener('ai-update-received', handleAIUpdate);
    return () => window.removeEventListener('ai-update-received', handleAIUpdate);
  }, [processingMessageId]);

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
        <Typography sx={{ fontSize: '20px', fontWeight: 500 }}>
          Asystent AI
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
          disabled={isProcessing}
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
