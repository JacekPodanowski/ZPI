import React, { useRef, useEffect, useMemo } from 'react';
import { Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { Delete } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getPreviewTheme } from './siteThemes';
import AddModuleButton from './AddModuleButton';
import { useToast } from '../../../contexts/ToastContext';

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
  const addToast = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [moduleToDelete, setModuleToDelete] = React.useState(null);
  
  // Subscribe to the pages array so component re-renders when it changes
  const pages = useNewEditorStore(state => state.site.pages);
  const site = useNewEditorStore(state => state.site);
  const devicePreview = useNewEditorStore(state => state.devicePreview);
  const page = pages.find(p => p.id === selectedPageId);

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
    setModuleToDelete(moduleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (moduleToDelete && page) {
      removeModule(page.id, moduleToDelete);
      addToast('Module deleted', { variant: 'success' });
    }
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
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

      {page.modules.length > 0 && (
        <AddModuleButton
          variant="inline"
          insertIndex={0}
          label="Add section above"
          buttonSx={{
            mt: { xs: 0.75, md: 1.5 },
            mb: { xs: 1.25, md: 2 },
            borderStyle: 'dashed'
          }}
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
          Add your first section below to start designing this page.
          <AddModuleButton
            variant="inline"
            insertIndex={0}
            label="Add first section"
            buttonSx={{ mt: { xs: 1.5, md: 2 } }}
          />
        </Box>
      ) : (
        page.modules.map((module, index) => (
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
              label={index === page.modules.length - 1 ? 'Add section below' : 'Add section here'}
              buttonSx={{
                mt: { xs: 1.1, md: 1.75 },
                mb: index === page.modules.length - 1 ? { xs: 2.5, md: 3 } : { xs: 1.1, md: 1.75 }
              }}
            />
          </React.Fragment>
        ))
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Module
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this module? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetailCanvas;
