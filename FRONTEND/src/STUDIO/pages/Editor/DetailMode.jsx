import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Drawer, useMediaQuery, useTheme as useMuiTheme, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, Tune as TuneIcon, Chat as ChatIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DetailMode = () => {
  const { devicePreview, site, selectedPageId, setSelectedPage, canvasZoom } = useNewEditorStore();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const layoutRef = useRef(null);
  const dragSide = useRef(null);
  const [leftWidth, setLeftWidth] = useState(0.15); // 15%
  const [rightWidth, setRightWidth] = useState(0.15); // 15%
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false); // AI chat initially collapsed
  const [isAiProcessing, setIsAiProcessing] = useState(false); // Track AI processing state
  const [aiTaskCompleted, setAiTaskCompleted] = useState(false); // Track if task completed
  const MIN_PANEL = 0.1;
  const MAX_PANEL = 0.35;
  const MIN_CENTER = 0.4;

  const pages = site?.pages || [];

  useEffect(() => {
    if (!selectedPageId && pages.length) {
      setSelectedPage(pages[0].id);
    }
  }, [selectedPageId, pages, setSelectedPage]);

  const startDragging = useCallback((side) => (event) => {
    event.preventDefault();
    dragSide.current = side;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragSide.current || !layoutRef.current) return;

      const rect = layoutRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      if (totalWidth === 0) return;

      if (dragSide.current === 'left') {
        const proposed = clamp((event.clientX - rect.left) / totalWidth, MIN_PANEL, MAX_PANEL);
        const centerShare = 1 - proposed - rightWidth;
        if (centerShare >= MIN_CENTER) {
          setLeftWidth(proposed);
        } else {
          const adjusted = 1 - rightWidth - MIN_CENTER;
          setLeftWidth(clamp(adjusted, MIN_PANEL, MAX_PANEL));
        }
      } else if (dragSide.current === 'right') {
        const proposed = clamp((rect.right - event.clientX) / totalWidth, MIN_PANEL, MAX_PANEL);
        const centerShare = 1 - leftWidth - proposed;
        if (centerShare >= MIN_CENTER) {
          setRightWidth(proposed);
        } else {
          const adjusted = 1 - leftWidth - MIN_CENTER;
          setRightWidth(clamp(adjusted, MIN_PANEL, MAX_PANEL));
        }
      }
    };

    const handlePointerUp = () => {
      if (!dragSide.current) return;
      dragSide.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [leftWidth, rightWidth]);

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

      {/* AI Chat floating button - both desktop and mobile (hidden when open on desktop) */}
      {(!aiChatOpen || isMobile) && (
        <IconButton
          onClick={() => {
            if (isMobile) {
              setRightPanelOpen(true);
            } else {
              // Just open the existing chat - don't create a new one
              setAiChatOpen(true);
            }
            // Clear completed state when opening
            setAiTaskCompleted(false);
          }}
          disabled={false} // Always allow opening the chat
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
        {/* Properties Panel - Left (Desktop only in layout, Mobile as Drawer) */}
        {isMobile ? (
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
        ) : (
          <Box
            sx={{
              flex: `0 0 ${leftWidth * 100}%`,
              minWidth: '220px',
              maxWidth: '35%',
              height: '100%',
              display: 'flex',
              position: 'relative'
            }}
          >
            <PropertiesPanel placement="left" />
            <Box
              onPointerDown={startDragging('left')}
              sx={{
                position: 'absolute',
                top: 0,
                right: -3,
                width: '6px',
                height: '100%',
                cursor: 'col-resize',
                zIndex: 20,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: '0 1px',
                  borderRadius: '4px',
                  background: 'rgba(30, 30, 30, 0.12)'
                }
              }}
            />
          </Box>
        )}

        {/* Canvas - Center */}
        <Box
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
            position: 'relative'
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

        {/* AI Chat - Right (Desktop only in layout, Mobile as Drawer) */}
        {isMobile ? (
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
        ) : (
          // Singleton instance - always rendered but conditionally displayed
          <Box
            sx={{
              flex: aiChatOpen ? `0 0 ${rightWidth * 100}%` : '0 0 0',
              minWidth: aiChatOpen ? '290px' : '0',
              maxWidth: aiChatOpen ? '35%' : '0',
              height: '100%',
              display: 'flex',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {aiChatOpen && (
              <Box
                onPointerDown={startDragging('right')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: -3,
                  width: '6px',
                  height: '100%',
                  cursor: 'col-resize',
                  zIndex: 20,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 1px',
                    borderRadius: '4px',
                    background: 'rgba(30, 30, 30, 0.12)'
                  }
                }}
              />
            )}
            <AIChatPanel 
              onClose={() => setAiChatOpen(false)}
              onProcessingChange={setIsAiProcessing}
              onTaskComplete={(success) => setAiTaskCompleted(success)}
              mode="detail"
              contextType="studio_editor"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DetailMode;
