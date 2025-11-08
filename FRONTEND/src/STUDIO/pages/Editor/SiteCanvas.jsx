import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getModuleDefinition, getDefaultModuleContent, buildNavigationContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import { getPreviewTheme } from './siteThemes';

// Component to render module in real mode and measure its height
const RealModeModule = ({
  module,
  pageId,
  definition,
  showOverlay,
  previewTheme,
  devicePreview
}) => {
  const moduleRef = useRef(null);
  const { recordModuleHeight } = useNewEditorStore();

  useEffect(() => {
    if (!moduleRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const measuredHeight = entry?.contentRect?.height;
        if (measuredHeight && measuredHeight > 0) {
          recordModuleHeight(module.type, measuredHeight);
        }
      }
    });

    observer.observe(moduleRef.current);
    return () => observer.disconnect();
  }, [module.type, recordModuleHeight]);

  return (
    <Box
      ref={moduleRef}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'visible'
      }}
    >
      <ModuleRenderer
        module={module}
        pageId={pageId}
        theme={previewTheme}
        devicePreview={devicePreview}
      />
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

const SiteCanvas = ({ page, renderMode = 'icon', showOverlay = true, onDropHandled, devicePreview = 'desktop', onNavigate }) => {
  const {
    addModule,
    moveModule,
    site,
    getModuleHeight,
    setDragging,
    entryPointPageId
  } = useNewEditorStore();
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const {
    text: editorText,
    borders: editorBorders,
    interactive
  } = editorColors;

  console.log('[SiteCanvas] Render - page:', page);
  console.log('[SiteCanvas] Render - page.id:', page?.id);
  console.log('[SiteCanvas] Render - modules:', page?.modules);
  console.log('[SiteCanvas] Render - modules count:', page?.modules?.length || 0);
  console.log('[SiteCanvas] Render - renderMode:', renderMode);
  console.log('[SiteCanvas] Render - devicePreview:', devicePreview);

  const previewTheme = useMemo(
    () => getPreviewTheme(site?.theme),
    [site?.theme]
  );
  const previewColors = useMemo(() => {
    const baseCanvas = previewTheme?.page || previewTheme?.background || '#f8f8f4';
    const surface = previewTheme?.surface || baseCanvas;
    const elevated = previewTheme?.elevated || surface;
    const border = previewTheme?.border || 'rgba(30, 30, 30, 0.12)';
    const divider = previewTheme?.divider || 'rgba(30, 30, 30, 0.08)';
    const textPrimary = previewTheme?.text || 'rgba(30, 30, 30, 0.92)';
    const textMuted = previewTheme?.textMuted || 'rgba(30, 30, 30, 0.6)';
    return {
      canvas: baseCanvas,
      surface,
      elevated,
      border,
      divider,
      textPrimary,
      textMuted
    };
  }, [previewTheme]);

  const dropZoneIdleBg = renderMode === 'icon' ? '#ffffff' : previewColors.canvas;
  const dropZoneHoverBg = renderMode === 'icon'
    ? interactive.subtle
    : 'rgba(146, 0, 32, 0.08)';
  const dropZoneBorder = `2px dotted ${previewColors.border}`;
  const dropZoneActiveBorder = `2px dashed ${previewColors.border}`;

  if (!page) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: editorText.muted
        }}
      >
        Select a page to preview
      </Box>
    );
  }

  // Get navigation config - merge site custom navigation with defaults
  const userNavigationContent = site.navigation?.content || {};
  const navTextFallback = previewTheme?.text || '#101010';
  const navBackgroundFallback = '#ffffff';
  const navigationOverrides = {
    ...userNavigationContent,
    bgColor: userNavigationContent.bgColor && userNavigationContent.bgColor !== 'transparent'
      ? userNavigationContent.bgColor
      : navBackgroundFallback,
    textColor: userNavigationContent.textColor && userNavigationContent.textColor !== 'transparent'
      ? userNavigationContent.textColor
      : navTextFallback,
    activeColor: userNavigationContent.activeColor && userNavigationContent.activeColor !== 'transparent'
      ? userNavigationContent.activeColor
      : navTextFallback
  };
  const navigationPreviewContent = buildNavigationContent(
    site,
    navigationOverrides,
    entryPointPageId,
    page?.id
  );

  // Calculate scale factor based on device (icon mode compression only)
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
  
  const CANVAS_HEIGHT_ICON = devicePreview === 'mobile' ? 667 : 394; // 16:9 aspect ratio height for icon mode
  const CANVAS_HEIGHT_REAL = devicePreview === 'mobile' ? 667 : 900;
  const canvasHeight = renderMode === 'icon' ? CANVAS_HEIGHT_ICON : CANVAS_HEIGHT_REAL;
  const AVAILABLE_HEIGHT = CANVAS_HEIGHT_ICON - (renderMode === 'icon' ? NAVIGATION_HEIGHT_ICON + FOOTER_HEIGHT_ICON : NAVIGATION_HEIGHT_REAL + FOOTER_HEIGHT_REAL);

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

  const handleDrop = (e, fallbackIndex = page.modules.length) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[SiteCanvas] Drop attempt. Fallback index:', fallbackIndex, 'dragOverIndex:', dragOverIndex);

    if (onDropHandled) onDropHandled();

    const moduleType = e.dataTransfer.getData('moduleType');
    const draggedModuleId = e.dataTransfer.getData('moduleId');
    const sourcePageId = e.dataTransfer.getData('sourcePageId');

    const resolvedIndex = (() => {
      if (dragOverIndex !== null && !Number.isNaN(dragOverIndex)) {
        return Math.max(0, Math.min(dragOverIndex, page.modules.length));
      }
      const boundedFallback = Math.max(0, Math.min(fallbackIndex ?? page.modules.length, page.modules.length));
      return boundedFallback;
    })();

    console.log('[SiteCanvas] Drop data:', { moduleType, draggedModuleId, sourcePageId, resolvedIndex });

    setDragging(false);
    setDragOverIndex(null);

    if (draggedModuleId && sourcePageId) {
      moveModule(sourcePageId, page.id, draggedModuleId, resolvedIndex);
      return;
    }

    if (moduleType) {
      const defaultContent = getDefaultModuleContent(moduleType);
      addModule(page.id, {
        type: moduleType,
        content: defaultContent
      }, resolvedIndex);
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
          bgcolor: previewColors.surface,
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
            color: previewColors.textPrimary
          }}
        >
          {definition.label}
        </Typography>
      </Box>
    );
  };

  const renderNavigationIcon = () => {
    const links = navigationPreviewContent.links || [];
    const activePageId = navigationPreviewContent.activePageId;
    const totalLabelLength = links.reduce((sum, link) => sum + (link.label?.length || 0), 0);
    const showOverflowIndicator = links.length > 0 && totalLabelLength > 70;
    const navSurface = navigationPreviewContent.bgColor || previewColors.elevated;
    const surfaceColor = navSurface;
    return (
      <Box
        sx={{
          height: `${NAVIGATION_HEIGHT_ICON}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: navSurface,
          borderBottom: `1px solid ${previewColors.divider}`,
          position: 'relative',
          flexShrink: 0
        }}
      >
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: previewColors.textMuted
          }}
        >
          {navigationPreviewContent.logo?.text || 'Logo'}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            maxWidth: '70%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {links.map((link) => {
              const isActive = link.pageId === activePageId;
              return (
                <Typography
                  key={link.pageId || link.href}
                  onClick={(event) => {
                    if (!onNavigate) return;
                    event.preventDefault();
                    event.stopPropagation();
                    onNavigate(link.pageId);
                  }}
                  sx={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? previewColors.textPrimary : previewColors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    whiteSpace: 'nowrap',
                    cursor: onNavigate ? 'pointer' : 'default'
                  }}
                >
                  {link.label}
                </Typography>
              );
            })}
          </Stack>
          {showOverflowIndicator && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: `linear-gradient(90deg, transparent, ${surfaceColor})`
              }}
            >
              <Typography sx={{ fontSize: '10px', color: previewColors.textMuted }}>…</Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: interactive.focus,
            opacity: 0.4
          }}
        />
      </Box>
    );
  };

  const renderRealMode = (module) => {
    const definition = getModuleDefinition(module.type);
    return (
      <RealModeModule
        module={module}
        pageId={page.id}
        definition={definition}
        showOverlay={showOverlay}
        previewTheme={previewTheme}
        devicePreview={devicePreview}
      />
    );
  };

  const canvasBackground = previewColors.canvas;
  const isIconMode = renderMode === 'icon';

  return (
    <Box
      data-site-canvas="true"
      sx={{
        width: '100%',
        maxWidth: `${canvasWidth}px`,
        ...(isIconMode
          ? { aspectRatio: devicePreview === 'mobile' ? '9/16' : '16/9' }
          : { height: `${canvasHeight}px` }),
        bgcolor: canvasBackground,
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
        <Box sx={{ flexShrink: 0 }}>
          <ModuleRenderer 
            module={{ 
              type: 'navigation', 
              content: navigationPreviewContent 
            }} 
            pageId={page.id}
            theme={previewTheme}
            devicePreview={devicePreview}
            onNavigate={onNavigate}
          />
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
          if (dragOverIndex === null) {
            const defaultIndex = page.modules.length === 0 ? 0 : page.modules.length;
            setDragOverIndex(defaultIndex);
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
              color: editorText.muted,
              fontSize: '14px',
              fontWeight: 500,
              border: `2px dashed ${editorBorders.subtle}`,
              bgcolor: dragOverIndex === 0 ? interactive.subtle : 'transparent',
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
              const isLastModule = index === page.modules.length - 1;
              const showTopIndicator = dragOverIndex === index;
              const showBottomIndicator = isLastModule && dragOverIndex === page.modules.length;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  style={renderMode === 'icon' ? {
                    height: `${moduleHeight}px`,
                    flexShrink: 0
                  } : {
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
                    onDrop={(e) => {
                      handleDrop(e, dragOverIndex ?? index + 1);
                    }}
                    sx={{
                      ...(renderMode === 'icon' ? { height: '100%' } : { width: '100%' }),
                      borderBottom: index < page.modules.length - 1 
                        ? `2px solid ${previewColors.divider}` 
                        : 'none',
                      position: 'relative',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      overflow: renderMode === 'icon' ? 'hidden' : 'visible',
                      '&:hover': {
                        boxShadow: `inset 0 0 0 2px ${interactive.focus}`
                      },
                      '&:active': {
                        cursor: 'grabbing',
                        opacity: 0.5
                      }
                    }}
                  >
                    {(showTopIndicator || showBottomIndicator) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: showTopIndicator ? 0 : 'auto',
                          left: 0,
                          right: 0,
                          bottom: showBottomIndicator ? 0 : 'auto',
                          height: '3px',
                          borderRadius: '999px',
                          bgcolor: interactive.focus,
                          boxShadow: `0 0 8px ${interactive.subtle}`,
                          zIndex: 10
                        }}
                      />
                    )}

                    {renderMode === 'icon' 
                      ? renderIconMode(module, moduleHeight) 
                      : renderRealMode(module)
                    }
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
            bgcolor: dragOverIndex === page.modules.length ? dropZoneHoverBg : dropZoneIdleBg,
            borderTop: dropZoneBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: editorText.muted,
            fontSize: '10px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            cursor: dragOverIndex === page.modules.length ? 'copy' : 'default',
            ...(dragOverIndex === page.modules.length && {
              borderTop: dropZoneActiveBorder,
              color: previewColors.textPrimary
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
