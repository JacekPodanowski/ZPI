import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Stack, IconButton, Typography, ToggleButtonGroup, ToggleButton, InputBase, Drawer, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { GridView, Visibility, RemoveRedEye, ArrowDownward, South, Search, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleToolbar from './ModuleToolbar';
import SiteCanvas from './SiteCanvas';
import { getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';

const StructureMode = () => {
  const { 
    site, 
    selectedPageId, 
    enterDetailMode, 
    addPage, 
    devicePreview,
    isDragging,
    draggedItem,
    setDragging,
    entryPointPageId,
    setSelectedPage,
    renamePage
  } = useNewEditorStore();
  
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const toggleButtonStyles = {
    bgcolor: editorColors.controls.groupBg,
    borderRadius: '12px',
    p: 0.5,
    display: 'inline-flex',
    gap: 0.5,
    '& .MuiToggleButton-root': {
      textTransform: 'none',
      fontSize: '13px',
      fontWeight: 500,
      border: 'none',
      borderRadius: '8px !important',
      color: editorColors.controls.iconInactive,
      px: 1.25,
      py: 0.75,
      transition: 'all 0.2s ease'
    },
    '& .MuiToggleButton-root:hover': {
      bgcolor: editorColors.controls.groupHoverBg
    },
    '& .MuiToggleButton-root.Mui-selected': {
      color: editorColors.controls.iconActive,
      bgcolor: editorColors.interactive.subtle
    },
    '& .MuiToggleButton-root.Mui-selected:hover': {
      bgcolor: editorColors.interactive.subtle
    }
  };
  
  const [showModuleToolbar, setShowModuleToolbar] = useState(true);
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);
  const [renderMode, setRenderMode] = useState('icon'); // 'icon' | 'real'
  const [dropHandled, setDropHandled] = useState(false);
  const isDraggingModule = isDragging && draggedItem?.type === 'module';
  const [focusedPageId, setFocusedPageId] = useState(() => selectedPageId || entryPointPageId || site?.pages?.[0]?.id || null);
  const [editingPageId, setEditingPageId] = useState(null);
  const [draftPageTitle, setDraftPageTitle] = useState('');
  const titleInputRef = useRef(null);
  const pages = useMemo(() => site?.pages ?? [], [site?.pages]);

  useEffect(() => {
    if (editingPageId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingPageId]);

  const assignTitleInputRef = useCallback((node) => {
    titleInputRef.current = node;
    if (!node || !editingPageId) {
      return;
    }
    const caretPosition = typeof node.value === 'string' ? node.value.length : 0;
    // Use requestAnimationFrame to align with paint cycle and avoid jitter
    const raf = typeof window !== 'undefined' ? window.requestAnimationFrame : null;
    if (raf) {
      raf(() => {
        node.focus();
        try {
          node.setSelectionRange(caretPosition, caretPosition);
        } catch (err) {
          // Ignore setSelectionRange errors on inputs that don't support it
        }
      });
    } else {
      node.focus();
      try {
        node.setSelectionRange(caretPosition, caretPosition);
      } catch (err) {
        // Ignore setSelectionRange errors on inputs that don't support it
      }
    }
  }, [editingPageId]);

  useEffect(() => {
    if (!editingPageId) return;
    if (!pages.some((page) => page.id === editingPageId)) {
      setEditingPageId(null);
      setDraftPageTitle('');
    }
  }, [editingPageId, pages]);
  const focusedPage = useMemo(() => {
    if (!pages.length) return null;
    const directMatch = pages.find((page) => page.id === focusedPageId);
    return directMatch || pages[0];
  }, [pages, focusedPageId]);
  const focusedId = focusedPage?.id ?? null;

  const otherPages = useMemo(() => {
    if (!pages.length) return [];
    return pages.filter((page) => page.id !== focusedId);
  }, [pages, focusedId]);

  console.log('[StructureMode] Render - site:', site);
  console.log('[StructureMode] Render - pages:', pages);
  console.log('[StructureMode] Render - selectedPageId:', selectedPageId);
  console.log('[StructureMode] Render - focusedPageId:', focusedPageId);
  console.log('[StructureMode] Render - focusedPage:', focusedPage);

  useEffect(() => {
    if (!pages.length) {
      if (focusedPageId !== null) {
        setFocusedPageId(null);
      }
      return;
    }

    if (focusedPageId && pages.some((page) => page.id === focusedPageId)) {
      return;
    }

    const fallbackOrder = [selectedPageId, entryPointPageId, pages[0]?.id];
    const nextId = fallbackOrder.find((candidate) => candidate && pages.some((page) => page.id === candidate));

    if (nextId && nextId !== focusedPageId) {
      setFocusedPageId(nextId);
      return;
    }

    if (!focusedPageId && pages[0]?.id) {
      setFocusedPageId(pages[0].id);
    }
  }, [pages, focusedPageId, selectedPageId, entryPointPageId]);

  useEffect(() => {
    if (!selectedPageId || selectedPageId === focusedPageId) return;
    if (!pages.some((page) => page.id === selectedPageId)) return;
    setFocusedPageId(selectedPageId);
  }, [selectedPageId, focusedPageId, pages]);

  useEffect(() => {
    if (!focusedId || selectedPageId === focusedId) return;
    setSelectedPage(focusedId);
  }, [focusedId, selectedPageId, setSelectedPage]);

  const handleFocusChange = useCallback((pageId) => {
    if (!pageId || pageId === focusedPageId) return;
    if (!pages.some((page) => page.id === pageId)) return;

    setFocusedPageId(pageId);
    if (selectedPageId !== pageId) {
      setSelectedPage(pageId);
    }
  }, [pages, focusedPageId, selectedPageId, setSelectedPage]);

  const handleNavigate = useCallback((targetPageId) => {
    if (!targetPageId) return;
    if (!pages.some((page) => page.id === targetPageId)) return;
    handleFocusChange(targetPageId);
  }, [pages, handleFocusChange]);

  const otherPagesCount = otherPages.length;
  const overlayEnabled = renderMode === 'icon';

  const getPageTitle = useCallback((page) => {
    if (!page) return 'New Page';
    if (page.name) return page.name;
    if (!page.modules || page.modules.length === 0) return 'New Page';

    const firstModule = page.modules[0];
    if (!firstModule?.type) return 'New Page';

    const moduleType = firstModule.type;
    const capitalizedType = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
    return `${capitalizedType} Page`;
  }, []);

  const handleStartEditingTitle = useCallback((event, page) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!page) return;
    const initialTitle = page.name && page.name.trim().length > 0
      ? page.name
      : getPageTitle(page);
    setEditingPageId(page.id);
    setDraftPageTitle(initialTitle);
  }, [getPageTitle]);

  const commitTitleEdit = useCallback(() => {
    if (!editingPageId) {
      return;
    }
    const targetPage = pages.find((page) => page.id === editingPageId);
    if (targetPage) {
      const trimmed = draftPageTitle.trim();
      if (trimmed && trimmed !== targetPage.name) {
        renamePage(targetPage.id, trimmed);
      }
    }
    setEditingPageId(null);
    setDraftPageTitle('');
  }, [editingPageId, draftPageTitle, pages, renamePage]);

  const handleTitleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitTitleEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingPageId(null);
      setDraftPageTitle('');
    }
  }, [commitTitleEdit]);

  const EditablePageTitle = ({ page, variant = 'focused' }) => {
    if (!page) return null;
    const isEditing = editingPageId === page.id;
    const typographyBase = variant === 'focused'
      ? { fontSize: '18px', fontWeight: 600 }
      : { fontSize: '13px', fontWeight: 600 };
    const hoverLift = variant === 'focused' ? '-3px' : '-2px';

    const content = (
      <Typography
        sx={{
          ...typographyBase,
          color: editorColors.text.primary,
          textAlign: 'left',
          cursor: 'text',
          transition: 'transform 0.2s ease, color 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          lineHeight: 1.3,
          userSelect: 'text',
          '&:hover': {
            transform: `translateY(${hoverLift})`,
            color: editorColors.interactive.main
          }
        }}
        onClick={(event) => handleStartEditingTitle(event, page)}
      >
        {getPageTitle(page)}
      </Typography>
    );

    return (
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <InputBase
            fullWidth
            inputRef={editingPageId === page.id ? assignTitleInputRef : undefined}
            value={draftPageTitle}
            onChange={(event) => setDraftPageTitle(event.target.value)}
            onBlur={commitTitleEdit}
            onKeyDown={handleTitleKeyDown}
            sx={{
              ...typographyBase,
              width: '100%',
              color: editorColors.text.primary,
              cursor: 'text',
              '& .MuiInputBase-input': {
                padding: 0,
                lineHeight: 1.3,
                minWidth: 0
              }
            }}
          />
        ) : (
          content
        )}
      </Box>
    );
  };

  const markDropHandled = () => {
    setDropHandled(true);
    const raf = typeof window !== 'undefined' ? window.requestAnimationFrame : null;
    if (raf) {
      raf(() => setDropHandled(false));
    } else {
      setTimeout(() => setDropHandled(false), 0);
    }
  };

  // Safety check
  if (!site || !pages.length) {
    console.log('[StructureMode] No pages available');
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: editorColors.text.hint,
          bgcolor: editorColors.backgrounds.canvas
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
        bgcolor: editorColors.backgrounds.page
      }}
    >
      {/* Mobile Module Toolbar Toggle */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileToolbarOpen(true)}
          sx={{
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 1200,
            bgcolor: 'white',
            boxShadow: 3,
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop Module Toolbar Toggle - Show when toolbar is hidden */}
      {!isMobile && !showModuleToolbar && (
        <IconButton
          onClick={() => setShowModuleToolbar(true)}
          sx={{
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 1200,
            bgcolor: 'white',
            boxShadow: 3,
            '&:hover': { bgcolor: 'grey.100' },
            transition: 'all 0.3s ease'
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Module Toolbar */}
      <AnimatePresence>
        {!isMobile && showModuleToolbar && (
          <ModuleToolbar 
            isDraggingModule={isDraggingModule} 
            onClose={() => setShowModuleToolbar(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Module Toolbar Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileToolbarOpen}
          onClose={() => setMobileToolbarOpen(false)}
          PaperProps={{
            sx: {
              width: '280px',
              mt: '60px',
              height: 'calc(100% - 60px)'
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={() => setMobileToolbarOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <ModuleToolbar isDraggingModule={isDraggingModule} />
            </Box>
          </Box>
        </Drawer>
      )}

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
            setDragging(false);
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

          setDragging(false);
        }}
        data-editor-canvas="true"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pl: !isMobile && showModuleToolbar ? '180px' : 0,
          transition: 'padding-left 0.4s ease',
          overflow: 'auto'
        }}
      >
        {/* Canvas Settings */}
        <Box
          sx={{
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            pt: 1.5,
            mb: 2,
            pointerEvents: 'all',
            position: 'relative'
          }}
        >
          {/* Entry Point Indicator - Centered at Same Height as Settings */}
          {focusedPage?.id === entryPointPageId && (
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
                pt: 7,
                pointerEvents: 'none'
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
                    color: editorColors.interactive.main
                  }}
                />
              </motion.div>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: editorColors.interactive.main,
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
                    color: editorColors.interactive.main
                  }}
                />
              </motion.div>
            </Box>
          )}

          {/* Settings Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center">
              <ToggleButtonGroup
                value={renderMode}
                exclusive
                onChange={(e, newMode) => newMode && setRenderMode(newMode)}
                size="small"
                sx={toggleButtonStyles}
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
            </Stack>
          </Box>
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
            gap: 3
          }}
        >
          {/* Focused Page Preview */}
          {focusedPage && (
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
                  data-page-id={focusedPage.id}
                >
                  <EditablePageTitle page={focusedPage} variant="focused" />
                  <IconButton
                    size="small"
                    onClick={() => enterDetailMode(focusedPage.id)}
                    sx={{
                      color: editorColors.interactive.main,
                      '&:hover': {
                        bgcolor: editorColors.interactive.subtle
                      }
                    }}
                  >
                    <Search sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={focusedPage.id}
                    data-page-id={focusedPage.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <SiteCanvas 
                      page={focusedPage} 
                      renderMode={renderMode}
                      showOverlay={overlayEnabled}
                      onDropHandled={markDropHandled}
                      devicePreview={devicePreview}
                      onNavigate={handleNavigate}
                    />
                  </motion.div>
                </AnimatePresence>
              </Box>

              {/* Arrows Pointing Down to Other Pages */}
              {otherPagesCount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    mt: 2
                  }}
                >
                  {otherPages.map((page, idx) => (
                    <ArrowDownward
                      key={page.id}
                      sx={{
                        fontSize: 32,
                        color: editorColors.interactive.main,
                        opacity: 0.6
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Second Row - Other Pages (Dynamically scaled to fit in one row) */}
          {otherPagesCount > 0 && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexWrap: 'nowrap', // Don't wrap to prevent third row
                justifyContent: 'flex-start', // Align to left for scrolling
                gap: 2,
                pointerEvents: 'all',
                overflow: 'auto', // Enable horizontal scroll
                overflowY: 'hidden', // Prevent vertical scroll
                px: 2, // Add padding for scroll area
                pb: 2, // Add bottom padding for scrollbar
                '&::-webkit-scrollbar': {
                  height: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(146, 0, 32, 0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(146, 0, 32, 0.5)'
                  }
                }
              }}
            >
              {otherPages.map((page, relativeIndex) => {
                // Dynamic width calculation to fit all pages in one row
                // Max container width ~1400px (allowing for padding), leave gaps
                const maxContainerWidth = 1200;
                const effectiveCount = Math.max(otherPagesCount, 1);
                const gapSpace = (effectiveCount - 1) * 16; // 2 * 8px gaps
                const availableWidth = maxContainerWidth - gapSpace;
                const baseWidth = devicePreview === 'mobile' ? 375 : 700;
                const calculatedWidth = Math.min(450, Math.floor(availableWidth / effectiveCount));
                const scale = calculatedWidth / baseWidth;
                
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
                      data-page-id={page.id}
                    >
                      <EditablePageTitle page={page} variant="compact" />
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => handleFocusChange(page.id)}
                          sx={{
                            color: editorColors.interactive.main,
                            '&:hover': {
                              bgcolor: editorColors.interactive.subtle
                            }
                          }}
                        >
                          <RemoveRedEye sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => enterDetailMode(page.id)}
                          sx={{
                            color: editorColors.interactive.main,
                            '&:hover': {
                              bgcolor: editorColors.interactive.subtle
                            }
                          }}
                        >
                          <Search sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Box>

                    <motion.div
                      data-page-id={page.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: relativeIndex * 0.05 }}
                      onClick={() => handleFocusChange(page.id)}
                      style={{ cursor: 'pointer' }}
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
                          showOverlay={overlayEnabled}
                          onDropHandled={markDropHandled}
                          devicePreview={devicePreview}
                          onNavigate={handleNavigate}
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
