import React, { useRef, useEffect, useMemo } from 'react';
import { Box, IconButton, Tooltip, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Delete } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getPreviewTheme } from './siteThemes';
import AddModuleButton from './AddModuleButton';

// Wrapper component to measure module heights
const MeasuredModule = ({ module, pageId, isSelected, onDelete, previewTheme, devicePreview }) => {
  const moduleRef = useRef(null);
  const { recordModuleHeight, selectModule } = useNewEditorStore();
  
  useEffect(() => {
    if (moduleRef.current) {
      // Use ResizeObserver to measure the actual rendered height
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          if (height > 0) {
            recordModuleHeight(module.type, height);
            console.log(`[DetailCanvas] Measured ${module.type} height: ${height}px`);
          }
        }
      });
      
      observer.observe(moduleRef.current);
      
      return () => observer.disconnect();
    }
  }, [module.type, recordModuleHeight]);
  
  return (
    <Box
      id={`module-${module.id}`}
      ref={moduleRef}
      onClick={() => selectModule(module.id)}
      sx={{
        position: 'relative',
        outline: isSelected 
          ? '3px solid rgb(146, 0, 32)' 
          : 'none',
        outlineOffset: '-3px',
        transition: 'outline 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          outline: isSelected 
            ? '3px solid rgb(146, 0, 32)'
            : '2px solid rgba(146, 0, 32, 0.3)',
          '& .delete-button': {
            opacity: { xs: 1, md: 0.95 }
          }
        }
      }}
    >
      <ModuleRenderer
        module={module}
        pageId={pageId}
        theme={previewTheme}
        devicePreview={devicePreview}
      />
      
      {/* Delete Button - appears when module is selected or on hover */}
      {isSelected && (
        <Tooltip title="Delete Section" placement="left">
          <IconButton
            className="delete-button"
            onClick={onDelete}
            sx={{
              position: 'absolute',
              top: { xs: 8, md: 12 },
              right: { xs: 8, md: 12 },
              bgcolor: 'rgba(146, 0, 32, 0.95)',
              color: 'white',
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              opacity: { xs: 0.9, md: 0 },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'rgb(114, 0, 21)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.4)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
            size="small"
          >
            <Delete sx={{ fontSize: { xs: 18, md: 20 } }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const DetailCanvas = () => {
  const { selectedModuleId, selectedPageId, removeModule } = useNewEditorStore();
  
  // Subscribe to the pages array so component re-renders when it changes
  const pages = useNewEditorStore(state => state.site.pages);
  const site = useNewEditorStore(state => state.site);
  const devicePreview = useNewEditorStore(state => state.devicePreview);
  const page = pages.find(p => p.id === selectedPageId);
  const muiTheme = useMuiTheme();
  const isPhoneViewport = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const previewTheme = useMemo(
    () => getPreviewTheme(site?.theme),
    [site?.theme]
  );
  
  console.log('🖼️ DetailCanvas - Render:', {
    selectedPageId,
    pageFound: !!page,
    moduleCount: page?.modules.length,
    moduleIds: page?.modules.map(m => m.id)
  });

  const handleDeleteModule = (moduleId, e) => {
    e.stopPropagation(); // Prevent triggering module selection
    if (window.confirm('Are you sure you want to delete this module?')) {
      removeModule(page.id, moduleId);
    }
  };

  if (!page) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(30, 30, 30, 0.3)',
          fontSize: '14px'
        }}
      >
        No page selected
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <ModuleRenderer
          module={{
            id: 'navigation-preview',
            type: 'navigation',
            content: site?.navigation?.content || {}
          }}
          pageId={page.id}
          theme={previewTheme}
          devicePreview={devicePreview}
        />
      </Box>

      {isPhoneViewport && page.modules.length > 0 && (
        <AddModuleButton
          variant="inline"
          insertIndex={0}
          label="Add section at top"
          buttonSx={{ mt: 1, mb: 1.5 }}
        />
      )}

      {page.modules.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'rgba(30, 30, 30, 0.35)',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Add modules from Structure Mode
          {isPhoneViewport && (
            <AddModuleButton
              variant="inline"
              insertIndex={0}
              label="Add first section"
              buttonSx={{ mt: 2 }}
            />
          )}
        </Box>
      ) : (
        page.modules.map((module, index) => (
          isPhoneViewport ? (
            <React.Fragment key={module.id}>
              <MeasuredModule
                module={module}
                pageId={page.id}
                isSelected={selectedModuleId === module.id}
                onDelete={(e) => handleDeleteModule(module.id, e)}
                previewTheme={previewTheme}
                devicePreview={devicePreview}
              />
              <AddModuleButton
                variant="inline"
                insertIndex={index + 1}
                label="Add section here"
                buttonSx={{
                  mt: 1.25,
                  mb: index === page.modules.length - 1 ? 2.5 : 1.25
                }}
              />
            </React.Fragment>
          ) : (
            <MeasuredModule
              key={module.id}
              module={module}
              pageId={page.id}
              isSelected={selectedModuleId === module.id}
              onDelete={(e) => handleDeleteModule(module.id, e)}
              previewTheme={previewTheme}
              devicePreview={devicePreview}
            />
          )
        ))
      )}
    </Box>
  );
};

export default DetailCanvas;
