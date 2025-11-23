import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Drawer, useMediaQuery, useTheme as useMuiTheme, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, Tune as TuneIcon, Chat as ChatIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DetailMode = () => {
  const { devicePreview, site, selectedPageId, setSelectedPage, canvasZoom, setCanvasZoom, isDragging, draggedItem } = useNewEditorStore();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const layoutRef = useRef(null);
  const canvasScrollRef = useRef(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false); // AI chat initially collapsed
  const [isAiProcessing, setIsAiProcessing] = useState(false); // Track AI processing state
  const [aiTaskCompleted, setAiTaskCompleted] = useState(false); // Track if task completed
  const isDraggingModule = isDragging && draggedItem?.type === 'module';
  const aiChatRef = useRef(null);

  // Close AI chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiChatRef.current && !aiChatRef.current.contains(event.target) && aiChatOpen) {
        setAiChatOpen(false);
      }
    };

    if (aiChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [aiChatOpen]);

  const pages = site?.pages || [];

  useEffect(() => {
    if (!selectedPageId && pages.length) {
      setSelectedPage(pages[0].id);
    }
  }, [selectedPageId, pages, setSelectedPage]);

  // Handle Ctrl + Scroll zoom
  useEffect(() => {
    const canvasElement = canvasScrollRef.current;
    if (!canvasElement) return;

    const handleWheel = (e) => {
      // Check if Ctrl key is pressed (or Cmd on Mac)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        // Determine zoom direction (negative deltaY = zoom in, positive = zoom out)
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        
        // Calculate new zoom level, clamped between 0.25 and 2
        const newZoom = clamp(canvasZoom + zoomDelta, 0.25, 2);
        
        setCanvasZoom(newZoom);
      }
    };

    // Use capture phase to intercept before Chrome's handler
    canvasElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      canvasElement.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [canvasZoom, setCanvasZoom]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* New Unified Toolbar (Desktop only) */}
      {!isMobile && <Toolbar isDraggingModule={isDraggingModule} mode="detail" />}

      {/* Mobile floating action buttons */}
      {isMobile && (
        <>
          <IconButton
            onClick={() => setLeftPanelOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 80,
              left: 16,
              zIndex: 1200,
              bgcolor: 'rgb(146, 0, 32)',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
              '&:hover': { 
                bgcolor: 'rgb(114, 0, 21)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 28px rgba(146, 0, 32, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <TuneIcon />
          </IconButton>
        </>
      )}

      {/* AI Chat floating button - hidden when chat is open (desktop only) */}
      {!aiChatOpen && !isMobile && (
        <IconButton
          onClick={() => {
            setAiChatOpen(true);
            setAiTaskCompleted(false);
          }}
          disabled={false}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            bgcolor: 'rgb(146, 0, 32)',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
            '&:hover': { 
              bgcolor: 'rgb(114, 0, 21)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 28px rgba(146, 0, 32, 0.5)'
            },
            transition: 'all 0.3s ease',
            '@keyframes checkPulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          {isAiProcessing ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : aiTaskCompleted ? (
            <CheckCircleIcon 
              sx={{ 
                animation: 'checkPulse 0.6s ease-in-out',
                fontSize: 28
              }} 
            />
          ) : (
            <ChatIcon />
          )}
        </IconButton>
      )}

      {/* AI Chat floating button - mobile version (opens drawer) */}
      {isMobile && (
        <IconButton
          onClick={() => {
            setRightPanelOpen(true);
            setAiTaskCompleted(false);
          }}
          disabled={false}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            bgcolor: 'rgb(146, 0, 32)',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
            '&:hover': { 
              bgcolor: 'rgb(114, 0, 21)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 28px rgba(146, 0, 32, 0.5)'
            },
            transition: 'all 0.3s ease',
            '@keyframes checkPulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          {isAiProcessing ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : aiTaskCompleted ? (
            <CheckCircleIcon 
              sx={{ 
                animation: 'checkPulse 0.6s ease-in-out',
                fontSize: 28
              }} 
            />
          ) : (
            <ChatIcon />
          )}
        </IconButton>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden'
        }}
        ref={layoutRef}
      >
        {/* Properties Panel - Mobile Drawer only */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={leftPanelOpen}
            onClose={() => setLeftPanelOpen(false)}
            PaperProps={{
              sx: {
                width: '85%',
                maxWidth: '400px',
                mt: '60px',
                height: 'calc(100% - 60px)'
              }
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={() => setLeftPanelOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <PropertiesPanel placement="left" />
              </Box>
            </Box>
          </Drawer>
        )}

        {/* Canvas - Center */}
        <Box
          ref={canvasScrollRef}
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: devicePreview === 'mobile' ? 'flex-start' : 'center',
            overflow: 'auto',
            bgcolor: 'rgb(228, 229, 218)',
            p: { xs: 1, sm: 2, md: 3 },
            pl: !isMobile ? 'calc(48px + 1rem)' : { xs: 1, sm: 2, md: 3 },
            position: 'relative',
            transition: 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          data-detail-canvas-scroll="true"
        >
          <Box
            sx={{
              width: devicePreview === 'mobile' ? '100%' : '100%',
              maxWidth: devicePreview === 'mobile' ? '375px' : (devicePreview === 'desktop' ? '1440px' : '100%'),
              minHeight: devicePreview === 'mobile' ? 'auto' : '100%',
              bgcolor: 'white',
              borderRadius: devicePreview === 'mobile' ? { xs: '12px', sm: '24px' } : '0',
              overflow: 'visible',
              mb: { xs: 2, md: 3 },
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'top center',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <DetailCanvas />
          </Box>
        </Box>

        {/* AI Chat - Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="right"
            open={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            PaperProps={{
              sx: {
                width: '85%',
                maxWidth: '400px',
                mt: '60px',
                height: 'calc(100% - 60px)'
              }
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 1 }}>
                <IconButton onClick={() => setRightPanelOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <AIChatPanel 
                  onClose={() => setRightPanelOpen(false)}
                  onProcessingChange={setIsAiProcessing}
                  onTaskComplete={(success) => setAiTaskCompleted(success)}
                  mode="detail"
                />
              </Box>
            </Box>
          </Drawer>
        )}
      </Box>

      {/* AI Chat Panel - Desktop Overlay (same as StructureMode) */}
      <Box
        ref={aiChatRef}
        sx={{
          position: 'fixed',
          top: '60px',
          right: 0,
          bottom: 0,
          width: aiChatOpen ? '350px' : '0',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 1100
        }}
      >
        <AIChatPanel 
          onClose={() => setAiChatOpen(false)}
          onProcessingChange={setIsAiProcessing}
          onTaskComplete={(success) => setAiTaskCompleted(success)}
          mode="detail"
        />
      </Box>
    </Box>
  );
};

export default DetailMode;
