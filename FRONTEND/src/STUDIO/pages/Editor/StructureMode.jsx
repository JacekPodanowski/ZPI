import React, { useState, useEffect } from 'react';
import { Box, Stack, IconButton, Typography, ToggleButtonGroup, ToggleButton, Checkbox, FormControlLabel } from '@mui/material';
import { GridView, Visibility, RemoveRedEye, ArrowDownward, South, Search } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleToolbar from './ModuleToolbar';
import SiteCanvas from './SiteCanvas';
import { getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';

const StructureMode = () => {
  const { 
    site, 
    selectedPageId, 
    enterDetailMode, 
    addPage, 
    setEntryPoint,
    devicePreview 
  } = useNewEditorStore();
  
  const theme = useTheme();
  
  const [showModuleToolbar, setShowModuleToolbar] = useState(true);
  const [renderMode, setRenderMode] = useState('icon'); // 'icon' | 'real'
  const [showOverlay, setShowOverlay] = useState(true);
  const [isDraggingModule, setIsDraggingModule] = useState(false);
  const [dropHandled, setDropHandled] = useState(false);

  // Safety: Reset dragging state on any drag end or drop event
  React.useEffect(() => {
    const handleDragEnd = () => {
      setIsDraggingModule(false);
    };
    
    const handleDrop = () => {
      setIsDraggingModule(false);
    };

    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Get the current page directly from site.pages (reactive)
  const currentPage = site?.pages?.find(p => p.id === selectedPageId) || site?.pages?.[0] || null;

  console.log('[StructureMode] Render - site:', site);
  console.log('[StructureMode] Render - site.pages:', site?.pages);
  console.log('[StructureMode] Render - selectedPageId:', selectedPageId);
  console.log('[StructureMode] Render - currentPage:', currentPage);
  console.log('[StructureMode] Render - currentPage.modules:', currentPage?.modules);

  // Safety check
  if (!site || !site.pages || site.pages.length === 0) {
    console.log('[StructureMode] No pages available');
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(30, 30, 30, 0.4)'
        }}
      >
        <Typography>No pages available. Add a page to get started.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.colors?.background?.base || 'rgb(228, 229, 218)'
      }}
    >
      {/* Module Toolbar */}
      <AnimatePresence>
        {showModuleToolbar && <ModuleToolbar isDraggingModule={isDraggingModule} />}
      </AnimatePresence>

      {/* EDITOR CANVAS - The Whole Background */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          // Don't stop propagation - let children handle it
        }}
        onDrop={(e) => {
          e.preventDefault();
          
          // Only handle drop if no child handled it
          if (dropHandled) {
            setDropHandled(false);
            return;
          }
          
          // Check if we're dropping on the editor canvas (not on a page)
          const moduleType = e.dataTransfer.getData('moduleType');
          const draggedModuleId = e.dataTransfer.getData('moduleId');
          
          // Only create new page if dropping a NEW module from toolbar (not moving existing)
          if (moduleType && !draggedModuleId) {
            console.log('[StructureMode] Drop on Editor Canvas - creating new page with module');
            const moduleTypeName = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
            const newPageId = `page-${Date.now()}`;
            const defaultContent = getDefaultModuleContent(moduleType);
            
            // Create new page with the module
            addPage({
              id: newPageId,
              name: `${moduleTypeName} Page`,
              route: `/${moduleType}`,
              modules: [{
                id: `module-${Date.now()}`,
                type: moduleType,
                content: defaultContent
              }]
            });
          }
        }}
        data-editor-canvas="true"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pl: showModuleToolbar ? '180px' : 0,
          transition: 'padding-left 0.4s ease',
          overflow: 'auto'
        }}
      >
        {/* Canvas Settings */}
        <Box
          sx={{
            width: '100%',
            px: 4,
            pt: 1.5,
            mb: 2,
            pointerEvents: 'all',
            position: 'relative'
          }}
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
        >
          {/* Entry Point Indicator - Centered at Same Height as Settings */}
          {site.pages.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
                zIndex: 10,
                pt: 7
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <RemoveRedEye
                  sx={{
                    fontSize: 30,
                    color: 'rgb(146, 0, 32)'
                  }}
                />
              </motion.div>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgb(146, 0, 32)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                Entry Point
              </Typography>
              
              {/* Animated Arrow pointing down to Home Page */}
              <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
                style={{
                  marginTop: '8px'
                }}
              >
                <South
                  sx={{
                    fontSize: 20,
                    color: 'rgb(146, 0, 32)'
                  }}
                />
              </motion.div>
            </Box>
          )}

          {/* Settings Controls */}
          <Stack direction="row" spacing={3} alignItems="center">
            {/* Render Mode Toggle */}
            <ToggleButtonGroup
              value={renderMode}
              exclusive
              onChange={(e, newMode) => newMode && setRenderMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.75,
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'none',
                  border: '1px solid rgba(30, 30, 30, 0.15)',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  '&.Mui-selected': {
                    bgcolor: 'rgb(146, 0, 32)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgb(114, 0, 21)'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)'
                  }
                }
              }}
            >
              <ToggleButton value="icon">
                <GridView sx={{ fontSize: 16, mr: 0.5 }} />
                Icon Render
              </ToggleButton>
              <ToggleButton value="real">
                <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                Real Render
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Color Overlay Checkbox - Only visible in Real Render mode */}
            {renderMode === 'real' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOverlay}
                    onChange={(e) => setShowOverlay(e.target.checked)}
                    size="small"
                    sx={{
                      color: 'rgb(146, 0, 32)',
                      '&.Mui-checked': {
                        color: 'rgb(146, 0, 32)'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'rgb(30, 30, 30)' }}>
                    Color Overlay
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            )}
          </Stack>
        </Box>

        {/* PAGES CONTAINER - Two Row Layout */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            px: 4,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            pointerEvents: 'none'
          }}
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
        >
          {/* First Row - Home Page (Entry Point) */}
          {site.pages.length > 0 && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                pointerEvents: 'all'
              }}
            >
              {/* Home Page Canvas */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: devicePreview === 'mobile' ? '375px' : '700px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mx: 'auto'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pl: 1
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: theme.colors?.text?.base || 'rgb(30, 30, 30)',
                      textAlign: 'left'
                    }}
                  >
                    Home Page
                  </Typography>
                  
                  <IconButton
                    size="small"
                    onClick={() => enterDetailMode(site.pages[0].id)}
                    sx={{
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        bgcolor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    <Search sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SiteCanvas 
                    page={site.pages[0]} 
                    renderMode={renderMode}
                    showOverlay={renderMode === 'icon' ? true : showOverlay}
                    isLastPage={site.pages.length === 1}
                    onModuleDragStart={() => setIsDraggingModule(true)}
                    onModuleDragEnd={() => setIsDraggingModule(false)}
                    onDropHandled={() => setDropHandled(true)}
                    devicePreview={devicePreview}
                  />
                </motion.div>
              </Box>

              {/* Arrows Pointing Down to Other Pages */}
              {site.pages.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    mt: 2
                  }}
                >
                  {site.pages.slice(1).map((_, idx) => (
                    <ArrowDownward
                      key={idx}
                      sx={{
                        fontSize: 32,
                        color: 'rgb(146, 0, 32)',
                        opacity: 0.6
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Second Row - Other Pages (Dynamically scaled to fit in one row) */}
          {site.pages.length > 1 && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexWrap: 'nowrap', // Don't wrap to prevent third row
                justifyContent: 'center',
                gap: 2,
                pointerEvents: 'all',
                overflow: 'hidden' // Hide overflow if too many pages
              }}
            >
              {site.pages.slice(1).map((page, relativeIndex) => {
                const pageIndex = relativeIndex + 1;
                const otherPagesCount = site.pages.length - 1;
                
                // Dynamic width calculation to fit all pages in one row
                // Max container width ~1400px (allowing for padding), leave gaps
                const maxContainerWidth = 1200;
                const gapSpace = (otherPagesCount - 1) * 16; // 2 * 8px gaps
                const availableWidth = maxContainerWidth - gapSpace;
                const baseWidth = devicePreview === 'mobile' ? 375 : 700;
                const calculatedWidth = Math.min(450, Math.floor(availableWidth / otherPagesCount));
                const scale = calculatedWidth / baseWidth;
                
                // Generate page title based on content
                const getPageTitle = (page) => {
                  if (page.modules.length === 0) return 'New Page';
                  
                  const firstModule = page.modules[0];
                  const moduleType = firstModule.type;
                  const capitalizedType = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
                  return `${capitalizedType} Page`;
                };

                const pageTitle = getPageTitle(page);

                return (
                  <Box
                    key={page.id}
                    sx={{
                      width: `${calculatedWidth}px`,
                      flexShrink: 0, // Prevent shrinking
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mx: 'auto',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pl: 0.5
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: theme.colors?.text?.base || 'rgb(30, 30, 30)',
                          textAlign: 'left'
                        }}
                      >
                        {pageTitle}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={() => enterDetailMode(page.id)}
                        sx={{
                          color: 'rgb(146, 0, 32)',
                          '&:hover': {
                            bgcolor: 'rgba(146, 0, 32, 0.08)'
                          }
                        }}
                      >
                        <Search sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: relativeIndex * 0.05 }}
                    >
                      <Box
                        sx={{
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                          width: devicePreview === 'mobile' ? '375px' : '700px',
                          height: devicePreview === 'mobile' ? 'calc(375px * 16 / 9)' : 'calc(700px * 9 / 16)',
                          mx: 'auto'
                        }}
                      >
                        <SiteCanvas 
                          page={page} 
                          renderMode={renderMode}
                          showOverlay={renderMode === 'icon' ? true : showOverlay}
                          isLastPage={pageIndex === site.pages.length - 1}
                          onModuleDragStart={() => setIsDraggingModule(true)}
                          onModuleDragEnd={() => setIsDraggingModule(false)}
                          onDropHandled={() => setDropHandled(true)}
                          devicePreview={devicePreview}
                        />
                      </Box>
                    </motion.div>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StructureMode;
