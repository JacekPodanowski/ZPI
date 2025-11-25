import React, { useRef, useEffect, useMemo } from 'react';
import { Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { Delete, Tune as TuneIcon, Image as ImageIcon } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import useImageSearchStore from '../../store/imageSearchStore';
import ModuleRenderer from './ModuleRenderer';
import { getPreviewTheme } from './siteThemes';
import { useToast } from '../../../contexts/ToastContext';
import { getDefaultModuleContent, getModuleDefinition } from './moduleDefinitions';
import ContextMenu from './ContextMenu';

// Wrapper component to measure module heights
const MeasuredModule = ({ module, pageId, isSelected, onDelete, onContextMenu, previewTheme, devicePreview }) => {
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
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Wykryj typ elementu na którym kliknięto
        const target = e.target;
        let targetType = 'module';
        let targetData = module;
        
        // Sprawdź czy kliknięto na edytowalny tekst
        const editableText = target.closest('[data-editable-text="true"]');
        if (editableText) {
          targetType = 'text';
          targetData = { module, textElement: editableText };
        }
        
        // Sprawdź czy kliknięto na edytowalny obraz
        const editableImage = target.closest('[data-editable-image="true"]');
        if (editableImage) {
          targetType = 'image';
          const elementId = editableImage.getAttribute('data-element-id');
          targetData = { module, imageElement: editableImage, elementId };
        }
        
        selectModule(module.id); // Zaznacz moduł
        if (onContextMenu) {
          onContextMenu(e, targetData, targetType);
        }
      }}
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
  const { selectedModuleId, selectedPageId, removeModule, addModule, moveModule, setDragging, selectModule } = useNewEditorStore();
  const addToast = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [moduleToDelete, setModuleToDelete] = React.useState(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = React.useState(false);
  const [dragOverIndex, setDragOverIndex] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState({ 
    open: false, 
    position: { x: 0, y: 0 }, 
    target: null, 
    targetType: null,
    moduleId: null
  });
  const setActiveImageElement = useImageSearchStore((state) => state.setActiveElement);
  const openImageModal = useImageSearchStore((state) => state.openModal);
  
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

  const handleContextMenu = (e, target, targetType) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Wyciągnij moduleId z target (może być bezpośrednio module lub obiekt z module)
    const moduleId = target?.module?.id || target?.id || null;
    
    // Use pageX/pageY which are relative to the entire document, not viewport
    // This prevents toolbar width from offsetting the menu position
    setContextMenu({
      open: true,
      position: { x: e.clientX, y: e.clientY },
      target,
      targetType,
      moduleId
    });
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
                  onContextMenu={handleContextMenu}
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

      {/* Context Menu */}
      <ContextMenu
        open={contextMenu.open}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, open: false })}
        title={
          contextMenu.targetType === 'text'
            ? 'Tekst'
            : contextMenu.targetType === 'image'
            ? 'Obraz'
            : contextMenu.target?.type
            ? getModuleDefinition(contextMenu.target.type)?.label || 'Moduł'
            : contextMenu.target?.module?.type
            ? getModuleDefinition(contextMenu.target.module.type)?.label || 'Moduł'
            : 'Moduł'
        }
        options={(() => {
          if (contextMenu.targetType === 'module' && contextMenu.target) {
            return [
              {
                label: 'Usuń',
                icon: <Delete sx={{ fontSize: 18 }} />,
                onClick: () => {
                  if (contextMenu.moduleId && page) {
                    removeModule(page.id, contextMenu.moduleId);
                    addToast('Module deleted', { variant: 'success' });
                  }
                },
                color: '#d32f2f'
              },
              {
                label: 'Ustawienia',
                icon: <TuneIcon sx={{ fontSize: 18 }} />,
                onClick: () => {
                  selectModule(contextMenu.moduleId);
                }
              }
            ];
          } else if (contextMenu.targetType === 'text') {
            return [
              {
                label: 'Usuń',
                icon: <Delete sx={{ fontSize: 18 }} />,
                onClick: () => {
                  if (contextMenu.moduleId && page) {
                    removeModule(page.id, contextMenu.moduleId);
                    addToast('Module deleted', { variant: 'success' });
                  }
                },
                color: '#d32f2f'
              },
              {
                label: 'Ustawienia',
                icon: <TuneIcon sx={{ fontSize: 18 }} />,
                onClick: () => {
                  selectModule(contextMenu.moduleId);
                }
              }
            ];
          } else if (contextMenu.targetType === 'image' && contextMenu.target) {
            return [
              {
                label: 'Zmień obraz',
                icon: <ImageIcon sx={{ fontSize: 18 }} />,
                onClick: () => {
                  const elementId = contextMenu.target.elementId;
                  if (elementId) {
                    localStorage.setItem('selectedImageElement', elementId);
                    window.dispatchEvent(new Event('imageSelectionChange'));
                    setActiveImageElement(elementId, 'single');
                    openImageModal();
                  }
                  selectModule(contextMenu.moduleId);
                }
              }
            ];
          }
          return [];
        })()}
      />
    </Box>
  );
};

export default DetailCanvas;
