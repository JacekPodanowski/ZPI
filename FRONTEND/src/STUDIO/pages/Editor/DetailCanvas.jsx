import React, { useRef, useEffect, useMemo } from 'react';
import { Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { Delete } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getPreviewTheme } from './siteThemes';
import { useToast } from '../../../contexts/ToastContext';
import { getDefaultModuleContent, getModuleDefinition } from './moduleDefinitions';

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
  
  const handleModuleClick = (e) => {
    // Don't select module if clicking on editable text
    if (e.target.closest('[data-editable-text="true"]')) {
      return;
    }
    selectModule(module.id);
  };

  return (
    <Box
      id={`module-${module.id}`}
      ref={moduleRef}
      onClick={handleModuleClick}
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
  const { selectedModuleId, selectedPageId, removeModule, addModule, moveModule, setDragging } = useNewEditorStore();
  const addToast = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [moduleToDelete, setModuleToDelete] = React.useState(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = React.useState(false);
  const [dragOverIndex, setDragOverIndex] = React.useState(null);
  
  // Subscribe to the pages array so component re-renders when it changes
  const pages = useNewEditorStore(state => state.site?.pages || []);
  const site = useNewEditorStore(state => state.site);
  const devicePreview = useNewEditorStore(state => state.devicePreview);
  const page = pages.find(p => p.id === selectedPageId);

  const resolveDropIndex = (fallbackIndex) => {
    if (!page) return 0;
    if (dragOverIndex !== null && !Number.isNaN(dragOverIndex)) {
      return Math.max(0, Math.min(dragOverIndex, page.modules.length));
    }
    const safeFallback = typeof fallbackIndex === 'number' ? fallbackIndex : page.modules.length;
    return Math.max(0, Math.min(safeFallback, page.modules.length));
  };

  const handleDropAtIndex = (event, fallbackIndex) => {
    if (!page) return;
    const payload = getDragPayload(event);
    if (!payload.moduleType && !payload.moduleId) return;

    event.preventDefault();
    event.stopPropagation();

    const targetIndex = resolveDropIndex(fallbackIndex);

    setIsCanvasDragOver(false);
    setDragOverIndex(null);

    if (payload.moduleId && payload.sourcePageId) {
      moveModule(payload.sourcePageId, page.id, payload.moduleId, targetIndex);
    } else if (payload.moduleType) {
      const defaultContent = getDefaultModuleContent(payload.moduleType);
      addModule(page.id, {
        type: payload.moduleType,
        content: defaultContent
      }, targetIndex);
    }

    setDragging(false);
  };

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

  const getDragPayload = (event) => {
    const dragState = useNewEditorStore.getState().draggedItem;
    let moduleType = dragState?.moduleType || null;
    let moduleId = dragState?.moduleId || null;
    let sourcePageId = dragState?.pageId || dragState?.sourcePageId || null;

    if (event?.dataTransfer) {
      try {
        moduleType = event.dataTransfer.getData('moduleType') || moduleType;
        moduleId = event.dataTransfer.getData('moduleId') || moduleId;
        sourcePageId = event.dataTransfer.getData('sourcePageId') || sourcePageId;
      } catch (err) {
        // ignore
      }
    }

    return { moduleType, moduleId, sourcePageId };
  };

  const handleCanvasDragOver = (event) => {
    if (!page) return;
    const { moduleType, moduleId } = getDragPayload(event);
    if (!moduleType && !moduleId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = moduleId ? 'move' : 'copy';
    setIsCanvasDragOver(true);
    setDragOverIndex(page.modules.length);
  };

  const handleCanvasDragLeave = (event) => {
    if (!isCanvasDragOver) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsCanvasDragOver(false);
    setDragOverIndex(null);
  };

  const handleCanvasDrop = (event) => {
    handleDropAtIndex(event, dragOverIndex ?? page?.modules.length ?? 0);
  };

  const handleModuleDragStart = (event, module) => {
    if (!page) return;
    const definition = getModuleDefinition(module.type);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('moduleId', module.id);
    event.dataTransfer.setData('sourcePageId', page.id);

    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    dragPreview.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: ${definition.color};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        <svg style="width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
        </svg>
      </div>
      <span style="
        font-size: 14px;
        font-weight: 500;
        color: rgb(30, 30, 30);
      ">${definition.label}</span>
    `;

    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 75, 25);
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);

    event.stopPropagation();
    setDragging(true, {
      type: 'module',
      moduleId: module.id,
      pageId: page.id,
      source: 'canvas'
    });
  };

  const handleModuleDragEnd = () => {
    setDragging(false);
    setIsCanvasDragOver(false);
    setDragOverIndex(null);
  };

  const handleModuleDragOver = (event, index) => {
    const payload = getDragPayload(event);
    if (!payload.moduleType && !payload.moduleId) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const halfHeight = rect.height / 2;
    setDragOverIndex(relativeY < halfHeight ? index : index + 1);
    setIsCanvasDragOver(true);
  };

  const handleModuleDrop = (event, index) => {
    handleDropAtIndex(event, dragOverIndex ?? index + 1);
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
        minHeight: '100%',
        transition: 'background-color 0.2s ease',
        backgroundColor: isCanvasDragOver ? 'rgba(146, 0, 32, 0.03)' : 'transparent'
      }}
      onDragOver={handleCanvasDragOver}
      onDragEnter={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
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
            fontWeight: 500,
            border: '1px dashed rgba(146, 0, 32, 0.4)',
            borderRadius: '16px'
          }}
        >
          Drag a module from the toolbar to start building this page.
        </Box>
      ) : (
        page.modules.map((module, index) => {
          const showTopIndicator = dragOverIndex === index;
          const showBottomIndicator = dragOverIndex === index + 1;

          return (
            <React.Fragment key={module.id}>
              <Box
                draggable
                onDragStart={(e) => handleModuleDragStart(e, module)}
                onDragEnd={handleModuleDragEnd}
                onDragOver={(e) => handleModuleDragOver(e, index)}
                onDragEnter={(e) => handleModuleDragOver(e, index)}
                onDrop={(e) => handleModuleDrop(e, index)}
                sx={{
                  position: 'relative',
                  '&::before': showTopIndicator ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: '2px',
                    backgroundColor: 'rgba(146, 0, 32, 0.7)',
                    boxShadow: '0 0 14px rgba(146, 0, 32, 0.6)',
                    zIndex: 3,
                    pointerEvents: 'none'
                  } : undefined,
                  '&::after': showBottomIndicator ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '2px',
                    backgroundColor: 'rgba(146, 0, 32, 0.7)',
                    boxShadow: '0 0 14px rgba(146, 0, 32, 0.6)',
                    zIndex: 3,
                    pointerEvents: 'none'
                  } : undefined
                }}
              >
                <MeasuredModule
                  module={module}
                  pageId={page.id}
                  isSelected={selectedModuleId === module.id}
                  onDelete={(e) => handleDeleteModule(module.id, e)}
                  previewTheme={previewTheme}
                  devicePreview={devicePreview}
                />
              </Box>
            </React.Fragment>
          );
        })
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
