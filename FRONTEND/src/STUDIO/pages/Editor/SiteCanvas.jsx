import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getModuleDefinition, MODULE_COLORS, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';

const SiteCanvas = ({ page, renderMode = 'icon', showOverlay = true, isLastPage = false, onModuleDragStart, onModuleDragEnd, onDropHandled, devicePreview = 'desktop' }) => {
  const { addModule, moveModule } = useNewEditorStore();
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const theme = useTheme();

  console.log('[SiteCanvas] Render - page:', page);
  console.log('[SiteCanvas] Render - page.id:', page?.id);
  console.log('[SiteCanvas] Render - modules:', page?.modules);
  console.log('[SiteCanvas] Render - modules count:', page?.modules?.length || 0);
  console.log('[SiteCanvas] Render - renderMode:', renderMode);
  console.log('[SiteCanvas] Render - devicePreview:', devicePreview);

  // Calculate scale factor based on device
  const CANVAS_WIDTH_DESKTOP = 700;
  const CANVAS_WIDTH_MOBILE = 375;
  const REAL_SITE_WIDTH = 1400;
  const REAL_SITE_WIDTH_MOBILE = 375;
  
  const canvasWidth = devicePreview === 'mobile' ? CANVAS_WIDTH_MOBILE : CANVAS_WIDTH_DESKTOP;
  const realSiteWidth = devicePreview === 'mobile' ? REAL_SITE_WIDTH_MOBILE : REAL_SITE_WIDTH;
  const scaleFactor = canvasWidth / realSiteWidth;

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to editor canvas
    console.log('[SiteCanvas] Drag over index:', index);
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    if (e) e.stopPropagation(); // Prevent event from bubbling
    console.log('[SiteCanvas] Drag leave');
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to editor canvas
    console.log('[SiteCanvas] Drop at index:', index);
    
    // Signal that we handled this drop
    if (onDropHandled) onDropHandled();
    
    // IMPORTANT: Signal drag end to reset trash zone
    if (onModuleDragEnd) onModuleDragEnd();
    
    setDragOverIndex(null);
    
    const moduleType = e.dataTransfer.getData('moduleType');
    const draggedModuleId = e.dataTransfer.getData('moduleId');
    const sourcePageId = e.dataTransfer.getData('sourcePageId');
    
    console.log('[SiteCanvas] Drop data:', { moduleType, draggedModuleId, sourcePageId });
    
    // Check if we're moving an existing module
    if (draggedModuleId && sourcePageId) {
      console.log('[SiteCanvas] Moving module from page:', sourcePageId, 'to page:', page.id, 'at index:', index);
      moveModule(sourcePageId, page.id, draggedModuleId, index);
      return;
    }
    
    // Otherwise, we're adding a new module from the toolbar
    if (moduleType) {
      console.log('[SiteCanvas] Adding new module:', moduleType, 'to page:', page.id, 'at index:', index);
      
      const defaultContent = getDefaultModuleContent(moduleType);
      console.log('[SiteCanvas] Default content:', defaultContent);
      
      // Insert module at specific position
      addModule(page.id, {
        type: moduleType,
        content: defaultContent
      }, index);
      
      console.log('[SiteCanvas] Module added successfully');
    } else {
      console.log('[SiteCanvas] No moduleType or moduleId found in dataTransfer');
    }
  };

  const renderIconMode = (module) => {
    const definition = getModuleDefinition(module.type);
    const Icon = definition.icon;
    
    // Calculate height to match scaled real render
    // Typical module height is ~400px, scaled down would be ~200px
    const scaledHeight = 200;
    
    return (
      <Box
        sx={{
          height: `${scaledHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: theme.colors?.surface?.base || 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {showOverlay && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: definition.color,
              opacity: 0.15,
              pointerEvents: 'none'
            }}
          />
        )}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '8px',
            bgcolor: definition.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: theme.colors?.text?.base || 'rgb(30, 30, 30)'
          }}
        >
          {definition.label}
        </Typography>
      </Box>
    );
  };

  const renderRealMode = (module) => {
    const definition = getModuleDefinition(module.type);
    
    return (
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%'
        }}
      >
        <Box
          sx={{
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top left',
            width: `${realSiteWidth}px`,
            pointerEvents: 'none' // Disable interactions in preview
          }}
        >
          <ModuleRenderer module={module} pageId={page.id} />
        </Box>
        {showOverlay && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: definition.color,
              opacity: 0.12,
              pointerEvents: 'none',
              border: `2px solid ${definition.color}`,
              borderRadius: '4px'
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: `${canvasWidth}px`,
        aspectRatio: devicePreview === 'mobile' ? '9/16' : '16/9',
        bgcolor: theme.colors?.surface?.base || 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s ease'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling to editor canvas
      }}
    >
      {/* Drop Zone at Top */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDragOver(e, 0);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          handleDragLeave();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e, 0);
        }}
        sx={{
          height: dragOverIndex === 0 ? '60px' : '20px',
          transition: 'height 0.2s ease',
          bgcolor: dragOverIndex === 0 ? 'rgba(146, 0, 32, 0.1)' : 'transparent',
          borderBottom: dragOverIndex === 0 ? '2px dashed rgb(146, 0, 32)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: dragOverIndex === 0 ? 'rgb(146, 0, 32)' : 'transparent',
          fontSize: '12px',
          fontWeight: 600,
          cursor: dragOverIndex === 0 ? 'copy' : 'default'
        }}
      >
        {dragOverIndex === 0 && 'Drop module here'}
      </Box>

      {/* Modules Stack */}
      <Box 
        sx={{ width: '100%', height: 'calc(100% - 40px)', overflow: 'auto' }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // If not over a specific drop zone, highlight the end
          if (dragOverIndex === null) {
            setDragOverIndex(page.modules.length);
          }
        }}
        onDragLeave={(e) => {
          if (e) e.stopPropagation();
          handleDragLeave();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Drop at the end if not over a specific zone
          handleDrop(e, page.modules.length);
        }}
      >
        {page.modules.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors?.text?.muted || 'rgba(30, 30, 30, 0.3)',
              fontSize: '14px',
              fontWeight: 500,
              border: dragOverIndex === 0 ? '2px dashed rgb(146, 0, 32)' : `2px dashed ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.1)'}`,
              bgcolor: dragOverIndex === 0 ? 'rgba(146, 0, 32, 0.05)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: dragOverIndex === 0 ? 'copy' : 'default'
            }}
          >
            Drag modules here to build your page
          </Box>
        ) : (
          <Stack spacing={0}>
            {page.modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Box
                  draggable
                  onDragStart={(e) => {
                    console.log('[SiteCanvas] Drag start - module:', module.id, 'from page:', page.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('moduleId', module.id);
                    e.dataTransfer.setData('sourcePageId', page.id);
                    
                    // Create a custom drag preview (small rectangle like toolbar modules)
                    const definition = getModuleDefinition(module.type);
                    const Icon = definition.icon;
                    
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
                          <path d="${Icon ? 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z' : 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'}"/>
                        </svg>
                      </div>
                      <span style="
                        font-size: 14px;
                        font-weight: 500;
                        color: rgb(30, 30, 30);
                      ">${definition.label}</span>
                    `;
                    
                    document.body.appendChild(dragPreview);
                    e.dataTransfer.setDragImage(dragPreview, 75, 25);
                    
                    // Clean up after drag starts
                    setTimeout(() => {
                      document.body.removeChild(dragPreview);
                    }, 0);
                    
                    e.stopPropagation();
                    if (onModuleDragStart) onModuleDragStart();
                  }}
                  onDragEnd={(e) => {
                    console.log('[SiteCanvas] Drag end');
                    e.stopPropagation();
                    if (onModuleDragEnd) onModuleDragEnd();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Calculate if we're in top or bottom 50% of module
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseY = e.clientY;
                    const relativeY = mouseY - rect.top;
                    const halfHeight = rect.height / 2;
                    
                    if (relativeY < halfHeight) {
                      // Top 50% - insert before this module
                      setDragOverIndex(index);
                    } else {
                      // Bottom 50% - insert after this module
                      setDragOverIndex(index + 1);
                    }
                  }}
                  sx={{
                    borderBottom: index < page.modules.length - 1 
                      ? `2px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.08)'}` 
                      : 'none',
                    position: 'relative',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    overflow: renderMode === 'real' ? 'hidden' : 'visible',
                    '&:hover': {
                      boxShadow: `inset 0 0 0 2px ${theme.colors?.primary?.base || 'rgb(146, 0, 32)'}`
                    },
                    '&:active': {
                      cursor: 'grabbing',
                      opacity: 0.5
                    }
                  }}
                >
                  {/* Top drop indicator */}
                  {dragOverIndex === index && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        bgcolor: 'rgb(146, 0, 32)',
                        zIndex: 10,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          padding: '4px 12px',
                          bgcolor: 'rgb(146, 0, 32)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }
                      }}
                    />
                  )}
                  
                  {renderMode === 'icon' ? renderIconMode(module) : renderRealMode(module)}
                  
                  {/* Bottom drop indicator */}
                  {dragOverIndex === index + 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        bgcolor: 'rgb(146, 0, 32)',
                        zIndex: 10
                      }}
                    />
                  )}
                </Box>
              </motion.div>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default SiteCanvas;
