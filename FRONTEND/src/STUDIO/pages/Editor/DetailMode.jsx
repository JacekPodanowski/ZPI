import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';
import AddModuleButton from './AddModuleButton';
import CanvasHeader from './CanvasHeader';

const DetailMode = () => {
  const { devicePreview, site, selectedPageId, enterDetailMode, setSelectedPage } = useNewEditorStore();

  const pages = site?.pages || [];
  const activePageId = selectedPageId || pages[0]?.id || null;

  const handleNavigate = useCallback((pageId) => {
    if (!pageId) return;
    setSelectedPage(pageId);
    enterDetailMode(pageId);
    const scrollContainer = document.querySelector('[data-detail-canvas-scroll="true"]');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [enterDetailMode, setSelectedPage]);

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
      {pages.length > 0 && (
        <CanvasHeader activePageId={activePageId} onNavigate={handleNavigate} />
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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
            p: 3
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
        </Box>

        {/* Properties Panel - Right */}
        <PropertiesPanel />
        
        {/* Floating Add Module Button */}
        <AddModuleButton />
      </Box>
    </Box>
  );
};

export default DetailMode;
