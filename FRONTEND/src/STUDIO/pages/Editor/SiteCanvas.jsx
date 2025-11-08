import React, { useState, useRef, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getModuleDefinition, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';

// Component to render module in real mode and measure its height
const RealModeModule = ({ module, pageId, moduleHeight, unscaledHeight, scaleFactor, realSiteWidth, definition, showOverlay, renderMode }) => {
  const moduleRef = useRef(null);
  const { recordModuleHeight } = useNewEditorStore();
  
  useEffect(() => {
    if (moduleRef.current && renderMode === 'real') {
      // Measure the actual rendered height of the unscaled content
      const contentWrapper = moduleRef.current.querySelector('.module-content-wrapper');
      if (contentWrapper) {
        // Get the height of the first child (the actual ModuleRenderer output)
        const actualContent = contentWrapper.firstChild;
        if (actualContent) {
          const measuredHeight = actualContent.offsetHeight;
          if (measuredHeight && measuredHeight > 0) {
            recordModuleHeight(module.type, measuredHeight);
            console.log(`[RealModeModule] Recorded height for ${module.type}: ${measuredHeight}px`);
          }
        }
      }
    }
  }, [module.type, renderMode, recordModuleHeight]);
  
  return (
    <Box 
      ref={moduleRef}
      sx={{ 
        position: 'relative',
        width: '100%',
        height: `${moduleHeight}px`,
        overflow: 'hidden'
      }}
    >
      <Box
        className="module-content-wrapper"
        sx={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
          width: `${realSiteWidth}px`,
          height: `${unscaledHeight}px`,
          pointerEvents: 'none'
        }}
      >
        <ModuleRenderer module={module} pageId={pageId} />
      </Box>
      {showOverlay && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: definition.color,
            opacity: 0.12,
            pointerEvents: 'none',
            border: `2px solid ${definition.color}`
          }}
        />
      )}
    </Box>
  );
};

const SiteCanvas = ({ page, renderMode = 'icon', showOverlay = true, onDropHandled, devicePreview = 'desktop' }) => {
  const { addModule, moveModule, site, getModuleHeight, setDragging } = useNewEditorStore();
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const theme = useTheme();

  console.log('[SiteCanvas] Render - page:', page);
  console.log('[SiteCanvas] Render - page.id:', page?.id);
  console.log('[SiteCanvas] Render - modules:', page?.modules);
  console.log('[SiteCanvas] Render - modules count:', page?.modules?.length || 0);
  console.log('[SiteCanvas] Render - renderMode:', renderMode);
  console.log('[SiteCanvas] Render - devicePreview:', devicePreview);

  // Get navigation config - merge site custom navigation with defaults
  const navigationContent = {
    ...getDefaultModuleContent('navigation'),
    ...(site.navigation?.content || {})
  };

  // Calculate scale factor based on device
  const CANVAS_WIDTH_DESKTOP = 700;
  const CANVAS_WIDTH_MOBILE = 375;
  const REAL_SITE_WIDTH = 1400;
  const REAL_SITE_WIDTH_MOBILE = 375;
  
  const canvasWidth = devicePreview === 'mobile' ? CANVAS_WIDTH_MOBILE : CANVAS_WIDTH_DESKTOP;
  const realSiteWidth = devicePreview === 'mobile' ? REAL_SITE_WIDTH_MOBILE : REAL_SITE_WIDTH;
  const scaleFactor = canvasWidth / realSiteWidth;

  // Calculate total height using default heights from module definitions (with optional measured overrides)
  const totalHeight = page.modules.reduce((sum, module) => {
    const definition = getModuleDefinition(module.type);
    // Use measured height if available, otherwise use default height from definition
    const moduleHeight = getModuleHeight(module.type, definition.defaultHeight);
    return sum + moduleHeight;
  }, 0);

  // Calculate proportional height for each module
  // Get the real navigation height from module definition
  const navigationDefinition = getModuleDefinition('navigation');
  const NAVIGATION_HEIGHT_REAL = navigationDefinition.defaultHeight * scaleFactor; // Scale down to canvas size
  const FOOTER_HEIGHT_REAL = 0; // No footer in real render mode
  
  // Use same navigation height in both modes for consistency
  const NAVIGATION_HEIGHT_ICON = NAVIGATION_HEIGHT_REAL;
  const FOOTER_HEIGHT_ICON = NAVIGATION_HEIGHT_REAL / 2; // Footer only in icon mode
  
  const CANVAS_HEIGHT = devicePreview === 'mobile' ? 667 : 394; // 16:9 aspect ratio height
  const AVAILABLE_HEIGHT = CANVAS_HEIGHT - (renderMode === 'icon' ? NAVIGATION_HEIGHT_ICON + FOOTER_HEIGHT_ICON : NAVIGATION_HEIGHT_REAL + FOOTER_HEIGHT_REAL);

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

  // Always end dragging on successful drop
  setDragging(false);
    
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

  const renderIconMode = (module, moduleHeight) => {
    const definition = getModuleDefinition(module.type);
    const Icon = definition.icon;
    
    return (
      <Box
        sx={{
          height: `${moduleHeight}px`,
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

  const renderNavigationIcon = () => {
    return (
      <Box
        sx={{
          height: `${NAVIGATION_HEIGHT_ICON}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: theme.colors?.surface?.base || 'white',
          borderBottom: `1px solid ${theme.colors?.border?.subtle || 'rgba(0, 0, 0, 0.08)'}`,
          position: 'relative',
          flexShrink: 0
        }}
      >
        <Typography sx={{ fontSize: '11px', fontWeight: 600, opacity: 0.6 }}>Logo</Typography>
        <Typography sx={{ fontSize: '10px', fontWeight: 500, opacity: 0.4 }}>Navigation Links</Typography>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'rgb(146, 0, 32)',
            opacity: 0.4
          }}
        />
      </Box>
    );
  };

  const renderRealMode = (module, moduleHeight) => {
    const definition = getModuleDefinition(module.type);
    
    // Calculate the unscaled height needed to fill the moduleHeight when scaled down
    const unscaledHeight = moduleHeight / scaleFactor;
    
    return (
      <RealModeModule
        module={module}
        pageId={page.id}
        moduleHeight={moduleHeight}
        unscaledHeight={unscaledHeight}
        scaleFactor={scaleFactor}
        realSiteWidth={realSiteWidth}
        definition={definition}
        showOverlay={showOverlay}
        renderMode={renderMode}
      />
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: `${canvasWidth}px`,
        aspectRatio: devicePreview === 'mobile' ? '9/16' : '16/9',
        bgcolor: theme.colors?.surface?.base || 'white',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Navigation - Always at top, non-draggable */}
      {renderMode === 'icon' ? renderNavigationIcon() : (
        <Box sx={{ flexShrink: 0, height: `${NAVIGATION_HEIGHT_REAL}px`, overflow: 'hidden' }}>
          <Box
            sx={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'top left',
              width: `${realSiteWidth}px`,
              height: `${NAVIGATION_HEIGHT_REAL / scaleFactor}px`,
              pointerEvents: 'none'
            }}
          >
            <ModuleRenderer 
              module={{ 
                type: 'navigation', 
                content: navigationContent 
              }} 
              pageId={page.id} 
            />
          </Box>
        </Box>
      )}

      {/* Main Content Area - Scrollable */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          position: 'relative'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (dragOverIndex === null && page.modules.length > 0) {
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
              border: `2px dashed ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.1)'}`,
              bgcolor: dragOverIndex === 0 ? 'rgba(146, 0, 32, 0.05)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: dragOverIndex === 0 ? 'copy' : 'default',
              m: 2
            }}
          >
            Drag modules here to build your page
          </Box>
        ) : (
          <Stack spacing={0} sx={{ height: '100%' }}>
            {page.modules.map((module, index) => {
              const definition = getModuleDefinition(module.type);
              
              // Calculate module height based on default height from definition (with optional measured override)
              const moduleDefaultHeight = getModuleHeight(module.type, definition.defaultHeight);
              const moduleHeight = totalHeight > 0 
                ? (moduleDefaultHeight / totalHeight) * AVAILABLE_HEIGHT 
                : AVAILABLE_HEIGHT / page.modules.length;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  style={{ 
                    height: `${moduleHeight}px`,
                    flexShrink: 0
                  }}
                >
                  <Box
                    draggable
                    onDragStart={(e) => {
                      console.log('[SiteCanvas] Drag start - module:', module.id, 'from page:', page.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('moduleId', module.id);
                      e.dataTransfer.setData('sourcePageId', page.id);
                      
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
                      
                      const Icon = definition.icon;
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
                      e.dataTransfer.setDragImage(dragPreview, 75, 25);
                      
                      setTimeout(() => {
                        document.body.removeChild(dragPreview);
                      }, 0);
                      
                      e.stopPropagation();
                        setDragging(true, {
                          type: 'module',
                          moduleId: module.id,
                          pageId: page.id
                        });
                    }}
                    onDragEnd={(e) => {
                      console.log('[SiteCanvas] Drag end');
                      e.stopPropagation();
                        setDragging(false);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseY = e.clientY;
                      const relativeY = mouseY - rect.top;
                      const halfHeight = rect.height / 2;
                      
                      if (relativeY < halfHeight) {
                        setDragOverIndex(index);
                      } else {
                        setDragOverIndex(index + 1);
                      }
                    }}
                    sx={{
                      height: '100%',
                      borderBottom: index < page.modules.length - 1 
                        ? `2px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.08)'}` 
                        : 'none',
                      position: 'relative',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `inset 0 0 0 2px ${theme.colors?.primary?.base || 'rgb(146, 0, 32)'}`
                      },
                      '&:active': {
                        cursor: 'grabbing',
                        opacity: 0.5
                      }
                    }}
                  >
                    {dragOverIndex === index && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          bgcolor: 'rgb(146, 0, 32)',
                          zIndex: 10
                        }}
                      />
                    )}
                    
                    {renderMode === 'icon' 
                      ? renderIconMode(module, moduleHeight) 
                      : renderRealMode(module, moduleHeight)
                    }
                    
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
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Footer - Always at bottom, non-draggable - Only shown in icon mode */}
      {renderMode === 'icon' && (
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragOver(e, page.modules.length);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            handleDragLeave();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e, page.modules.length);
          }}
          sx={{
            height: `${FOOTER_HEIGHT_ICON}px`,
            flexShrink: 0,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            borderTop: '2px dotted rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(30, 30, 30, 0.3)',
            fontSize: '10px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            cursor: dragOverIndex === page.modules.length ? 'copy' : 'default',
            ...(dragOverIndex === page.modules.length && {
              bgcolor: 'rgba(146, 0, 32, 0.08)',
              borderTop: '2px dashed rgb(146, 0, 32)',
              color: 'rgb(146, 0, 32)'
            })
          }}
        >
          Drop modules here
        </Box>
      )}
    </Box>
  );
};

export default SiteCanvas;
