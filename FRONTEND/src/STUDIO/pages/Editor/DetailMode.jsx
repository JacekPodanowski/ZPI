import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';
import AddModuleButton from './AddModuleButton';
import MockAIChatPanel from './MockAIChatPanel';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DetailMode = () => {
  const { devicePreview, site, selectedPageId, setSelectedPage } = useNewEditorStore();
  const layoutRef = useRef(null);
  const dragSide = useRef(null);
  const [leftWidth, setLeftWidth] = useState(0.15); // 15%
  const [rightWidth, setRightWidth] = useState(0.15); // 15%
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
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden'
        }}
        ref={layoutRef}
      >
        {/* Properties Panel - Left */}
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
            p: 3,
            position: 'relative'
          }}
          data-detail-canvas-scroll="true"
        >
          <Box
            sx={{
              width: devicePreview === 'mobile' ? '375px' : '100%',
              maxWidth: devicePreview === 'desktop' ? '1440px' : '375px',
              minHeight: devicePreview === 'mobile' ? 'auto' : '100%',
              bgcolor: 'white',
              borderRadius: devicePreview === 'mobile' ? '24px' : '0',
              boxShadow: devicePreview === 'mobile'
                ? '0 20px 60px rgba(0, 0, 0, 0.2)'
                : 'none',
              overflow: 'visible',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              mb: 3
            }}
          >
            <DetailCanvas />
          </Box>
          <AddModuleButton positioning="absolute" />
        </Box>

        {/* AI Chat - Right */}
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
      </Box>
    </Box>
  );
};

export default DetailMode;
