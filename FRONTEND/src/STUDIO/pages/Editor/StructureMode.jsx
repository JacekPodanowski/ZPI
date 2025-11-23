import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Stack, IconButton, Typography, ToggleButtonGroup, ToggleButton, InputBase, useMediaQuery, CircularProgress } from '@mui/material';
import { GridView, Visibility, RemoveRedEye, Edit, Chat as ChatIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import Toolbar from './Toolbar';
import SiteCanvas from './SiteCanvas';
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';
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
  const isMobile = useMediaQuery('(max-width:900px)');
  const editorColors = getEditorColorTokens(theme);
  const toggleButtonStyles = {
    '& .MuiToggleButton-root': {
      px: 2,
      py: 0.75,
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'none',
      border: `1px solid ${editorColors.borders.subtle}`,
      bgcolor: editorColors.surfaces.base,
      color: editorColors.text.primary,
      '&.Mui-selected': {
        bgcolor: editorColors.interactive.main,
        color: editorColors.text.inverse,
        '&:hover': {
          bgcolor: editorColors.interactive.hover
        }
      },
      '&:hover': {
        bgcolor: editorColors.surfaces.hover
      }
    }
  };
  
  const [renderMode, setRenderMode] = useState('icon'); // 'icon' | 'real'
  const [dropHandled, setDropHandled] = useState(false);
  const isDraggingModule = isDragging && draggedItem?.type === 'module';
  const [focusedPageId, setFocusedPageId] = useState(() => selectedPageId || entryPointPageId || site?.pages?.[0]?.id || null);
  const [editingPageId, setEditingPageId] = useState(null);
  const [draftPageTitle, setDraftPageTitle] = useState('');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiTaskCompleted, setAiTaskCompleted] = useState(false);
  const titleInputRef = useRef(null);
  const aiChatRef = useRef(null);

  // Close AI chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiChatRef.current && !aiChatRef.current.contains(event.target) && aiChatOpen) {
        setAiChatOpen(false);
      }
    };

    if (aiChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [aiChatOpen]);
  const pages = useMemo(() => site?.pages ?? [], [site?.pages]);

  const BASE_TITLE_PADDING_LEFT = 12;
  const BASE_TITLE_PADDING_RIGHT = 6;
  const BASE_SECTION_GAP = 12;
  const BASE_TITLE_CANVAS_GAP = 4;
  const BASE_ACTION_SPACING = 4;

  const toPx = (value) => `${value}px`;
  const clampSpacing = (value, minimum = 2) => Math.max(value, minimum);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId]); // Only depend on focusedId to avoid infinite loop

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
      {/* New Unified Toolbar */}
      {!isMobile && <Toolbar isDraggingModule={isDraggingModule} />}

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
          pl: !isMobile ? '48px' : 0,
          transition: 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'auto'
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: '100%',
            px: 4,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            pt: 4
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 32,
              zIndex: 5,
              pointerEvents: 'all'
            }}
          >
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
          </Box>

          {/* Focused Page Preview */}
          {focusedPage && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: toPx(BASE_SECTION_GAP),
                pointerEvents: 'all'
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: devicePreview === 'mobile' ? '375px' : '700px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: toPx(BASE_TITLE_CANVAS_GAP),
                  mx: 'auto'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pl: toPx(BASE_TITLE_PADDING_LEFT),
                    pr: toPx(BASE_TITLE_PADDING_RIGHT)
                  }}
                  data-page-id={focusedPage.id}
                >
                  <EditablePageTitle page={focusedPage} variant="focused" />
                  <IconButton
                    onClick={() => enterDetailMode(focusedPage.id)}
                    sx={{
                      color: editorColors.interactive.main,
                      '&:hover': {
                        bgcolor: editorColors.interactive.subtle
                      }
                    }}
                  >
                    <Edit sx={{ fontSize: 20 }} />
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
                const scaledSectionGap = clampSpacing(BASE_SECTION_GAP * scale);
                const scaledTitleCanvasGap = clampSpacing(BASE_TITLE_CANVAS_GAP * scale);
                const scaledTitlePaddingLeft = BASE_TITLE_PADDING_LEFT * scale;
                const scaledTitlePaddingRight = BASE_TITLE_PADDING_RIGHT * scale;
                const actionSpacing = Math.max(0.25, (BASE_ACTION_SPACING * scale) / 8);
                
                return (
                  <Box
                    key={page.id}
                    sx={{
                      width: `${calculatedWidth}px`,
                      flexShrink: 0, // Prevent shrinking
                      display: 'flex',
                      flexDirection: 'column',
                      gap: toPx(scaledSectionGap),
                      mx: 'auto',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pl: toPx(scaledTitlePaddingLeft),
                        pr: toPx(scaledTitlePaddingRight)
                      }}
                      data-page-id={page.id}
                    >
                      <EditablePageTitle page={page} variant="compact" />
                      <Stack direction="row" spacing={actionSpacing} alignItems="center">
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
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Box>

                    <motion.div
                      data-page-id={page.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: relativeIndex * 0.05 }}
                      onClick={() => handleFocusChange(page.id)}
                      style={{
                        cursor: 'pointer',
                        marginTop: 0
                      }}
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

      {/* AI Chat floating button - hidden when chat is open */}
      {!aiChatOpen && (
        <IconButton
          onClick={() => {
            setAiChatOpen(true);
            setAiTaskCompleted(false);
          }}
          disabled={false}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            bgcolor: 'rgb(146, 0, 32)',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
            '&:hover': { 
              bgcolor: 'rgb(114, 0, 21)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 28px rgba(146, 0, 32, 0.5)'
            },
            transition: 'all 0.3s ease',
            '@keyframes checkPulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          {isAiProcessing ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : aiTaskCompleted ? (
            <CheckCircleIcon 
              sx={{ 
                animation: 'checkPulse 0.6s ease-in-out',
                fontSize: 28
              }} 
            />
          ) : (
            <ChatIcon />
          )}
        </IconButton>
      )}

      {/* AI Chat Panel - Singleton instance */}
      <Box
        ref={aiChatRef}
        sx={{
          position: 'fixed',
          top: '60px',
          right: 0,
          bottom: 0,
          width: aiChatOpen ? '350px' : '0',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 1100
        }}
      >
        <AIChatPanel 
          onClose={() => setAiChatOpen(false)}
          onProcessingChange={setIsAiProcessing}
          onTaskComplete={(success) => setAiTaskCompleted(success)}
          mode="structure"
          contextType="studio_editor"
        />
      </Box>
    </Box>
  );
};

export default StructureMode;
