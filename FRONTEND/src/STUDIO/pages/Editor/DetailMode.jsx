import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Drawer, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Menu as MenuIcon, Tune as TuneIcon, Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';
import MockAIChatPanel from './MockAIChatPanel';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DetailMode = () => {
  const { devicePreview, site, selectedPageId, setSelectedPage } = useNewEditorStore();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const layoutRef = useRef(null);
  const dragSide = useRef(null);
  const [leftWidth, setLeftWidth] = useState(0.15); // 15%
  const [rightWidth, setRightWidth] = useState(0.15); // 15%
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
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
              bottom: 200,
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
          <IconButton
            onClick={() => setRightPanelOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 200,
              right: 16,
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
            <ChatIcon />
          </IconButton>
        </>
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
              boxShadow: devicePreview === 'mobile'
                ? '0 20px 60px rgba(0, 0, 0, 0.2)'
                : 'none',
              overflow: 'visible',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              mb: { xs: 2, md: 3 }
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
                <MockAIChatPanel />
              </Box>
            </Box>
          </Drawer>
        ) : (
          <Box
            sx={{
              flex: `0 0 ${rightWidth * 100}%`,
              minWidth: '240px',
              maxWidth: '35%',
              height: '100%',
              display: 'flex',
              position: 'relative'
            }}
          >
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
            <MockAIChatPanel />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DetailMode;
