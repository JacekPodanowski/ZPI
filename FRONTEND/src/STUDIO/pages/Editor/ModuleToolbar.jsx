import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Stack, 
  Typography, 
  IconButton, 
  useMediaQuery, 
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Close, ViewModule } from '@mui/icons-material';
import { getAvailableModules, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import useNewEditorStore from '../../store/newEditorStore';

const EDITOR_TOP_BAR_HEIGHT = 56;

const ModuleToolbar = ({ isDraggingModule = false, onClose }) => {
  const modules = getAvailableModules();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isDarkMode = theme.mode === 'dark';
  const accentColor = theme.colors?.interactive?.default || 'rgb(146, 0, 32)';
  const accentHoverColor = theme.colors?.interactive?.hover || 'rgb(114, 0, 21)';
  const moduleListBg = isDarkMode ? 'rgba(20, 20, 24, 0.94)' : 'rgba(255, 255, 255, 0.9)';
  const moduleListBorder = theme.colors?.border?.subtle || (isDarkMode ? 'rgba(220, 220, 220, 0.08)' : 'rgba(30, 30, 30, 0.06)');
  const moduleListHover = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.04)';
  const selectedBg = isDarkMode ? 'rgba(146, 0, 32, 0.24)' : 'rgba(146, 0, 32, 0.08)';
  const selectedHoverBg = isDarkMode ? 'rgba(146, 0, 32, 0.32)' : 'rgba(146, 0, 32, 0.12)';
  const textPrimary = theme.colors?.text?.base || (isDarkMode ? 'rgba(235, 235, 235, 0.94)' : 'rgb(30, 30, 30)');
  const textMuted = theme.colors?.text?.muted || (isDarkMode ? 'rgba(210, 210, 210, 0.65)' : 'rgba(30, 30, 30, 0.5)');
  const popupBackground = isDarkMode ? 'rgba(28, 28, 32, 0.96)' : 'white';
  const popupBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.08)';
  const popupHeaderBg = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
  const popupText = isDarkMode ? 'rgba(240, 240, 242, 0.95)' : 'rgb(30, 30, 30)';
  const popupMutedText = isDarkMode ? 'rgba(225, 225, 228, 0.75)' : 'rgba(30, 30, 30, 0.7)';
  const { removeModule, addPage, addModule, setDragging, currentPage, site } = useNewEditorStore();
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [popupCenterY, setPopupCenterY] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const hasInitiallyAnimated = useRef(false);
  const toolbarRef = useRef(null);
  const moduleRefs = useRef({});
  
  // Mobile-specific states
  const [selectedModuleForPage, setSelectedModuleForPage] = useState(null);
  const [pageSelectionDialogOpen, setPageSelectionDialogOpen] = useState(false);
  const [touchHoldTimer, setTouchHoldTimer] = useState(null);

  const handleDragStart = (e, moduleType) => {
    console.log('[ModuleToolbar] Drag started:', moduleType);
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedModule(null); // Close popup when dragging
  };

  const handleModuleClick = (e, module) => {
    e.stopPropagation();
    
    const boxElement = e.currentTarget;
    const toolbarElement = toolbarRef.current;
    
    if (boxElement && toolbarElement) {
      const boxRect = boxElement.getBoundingClientRect();
      const toolbarRect = toolbarElement.getBoundingClientRect();
      const scrollTop = toolbarElement.scrollTop || 0;
      
      // Calculate position relative to toolbar, then subtract top bar height
      const moduleCenterY = (boxRect.top - toolbarRect.top) + scrollTop + (boxRect.height / 2) - EDITOR_TOP_BAR_HEIGHT;
      
      setPopupCenterY(moduleCenterY);
    }
    
    setSelectedModule(module);
    setIsFirstRender(false);
  };

  const handleAddModule = (module) => {
    // Add module to current page instead of creating a new page
    if (currentPage) {
      const defaultContent = getDefaultModuleContent(module.type);
      addModule(currentPage.id, {
        type: module.type,
        content: defaultContent
      });
    }
    
    setSelectedModule(null);
    setIsFirstRender(true);
  };

  // Mobile: Add module to specific page or create new page
  const handleAddModuleToPage = (pageId) => {
    if (!selectedModuleForPage) return;
    
    const defaultContent = getDefaultModuleContent(selectedModuleForPage.type);
    
    if (pageId === 'NEW_PAGE') {
      // Create new page with this module
      addPage({
        modules: [{
          type: selectedModuleForPage.type,
          content: defaultContent
        }]
      });
    } else if (pageId) {
      // Add to existing page
      addModule(pageId, {
        type: selectedModuleForPage.type,
        content: defaultContent
      });
    }
    
    setPageSelectionDialogOpen(false);
    setSelectedModuleForPage(null);
    setMobileDrawerOpen(false);
  };

  // Mobile: Handle touch hold to select module
  const handleTouchStart = (module) => {
    const timer = setTimeout(() => {
      setSelectedModuleForPage(module);
      setPageSelectionDialogOpen(true);
    }, 500); // 500ms hold time
    
    setTouchHoldTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchHoldTimer) {
      clearTimeout(touchHoldTimer);
      setTouchHoldTimer(null);
    }
  };

  const handleTrashDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const moduleId = e.dataTransfer.getData('moduleId');
    const sourcePageId = e.dataTransfer.getData('sourcePageId');
    
    if (moduleId && sourcePageId) {
      console.log('[ModuleToolbar] Deleting module:', moduleId, 'from page:', sourcePageId);
      // Reset state immediately before removal
      setIsOverTrash(false);
      // Store will automatically delete empty pages (except home)
      removeModule(sourcePageId, moduleId);
      // Ensure global drag state is cleared once the module is removed
      const raf = typeof window !== 'undefined' ? window.requestAnimationFrame : null;
      if (raf) {
        raf(() => setDragging(false));
      } else {
        setTimeout(() => setDragging(false), 0);
      }
    } else {
      // Fallback guard: clear drag state even if data is missing
      setIsOverTrash(false);
      setDragging(false);
    }
  };

  const handleTrashDragOver = (e) => {
    if (!isDraggingModule) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = (e) => {
    if (!isDraggingModule) return;
    // Only reset if we're actually leaving the trash zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOverTrash(false);
    }
  };

  // Reset isOverTrash when dragging stops
  useEffect(() => {
    if (!isDraggingModule) {
      setIsOverTrash(false);
    }
  }, [isDraggingModule]);

  // Mark as animated after initial render
  useEffect(() => {
    hasInitiallyAnimated.current = true;
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectedModule && !e.target.closest('[data-module-item]') && !e.target.closest('[data-module-popup]')) {
        setSelectedModule(null);
        setIsFirstRender(true);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedModule]);

  // Mobile FAB button
  if (isMobile) {
    const pages = site?.pages || [];
    
    return (
      <>
        {/* Floating Action Button */}
        <IconButton
          onClick={() => setMobileDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 16,
            bgcolor: accentColor,
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
            zIndex: 1100,
            '&:hover': {
              bgcolor: accentHoverColor,
              transform: 'scale(1.08)',
              boxShadow: '0 6px 24px rgba(146, 0, 32, 0.5)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ViewModule sx={{ fontSize: 28 }} />
        </IconButton>

        {/* Mobile Drawer */}
        <Drawer
          anchor="bottom"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              maxHeight: '80vh',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              bgcolor: moduleListBg,
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: textPrimary,
                  letterSpacing: '0.02em'
                }}
              >
                Add Module
              </Typography>
              <IconButton
                onClick={() => setMobileDrawerOpen(false)}
                size="small"
                sx={{
                  color: textMuted,
                  '&:hover': {
                    color: accentColor,
                    bgcolor: 'rgba(146, 0, 32, 0.08)'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Instructions */}
            <Typography
              sx={{
                fontSize: '13px',
                color: textMuted,
                mb: 2,
                textAlign: 'center'
              }}
            >
              Hold to choose page, tap to add to current page
            </Typography>

            {/* Module Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 2,
                maxHeight: 'calc(80vh - 140px)',
                overflowY: 'auto'
              }}
            >
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Box
                    key={module.type}
                    onClick={() => {
                      handleAddModule(module);
                      setMobileDrawerOpen(false);
                    }}
                    onTouchStart={() => handleTouchStart(module)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      p: 2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: moduleListHover
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                        bgcolor: moduleListHover
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        bgcolor: module.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: textPrimary,
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}
                    >
                      {module.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Drawer>

        {/* Page Selection Dialog */}
        <Dialog
          open={pageSelectionDialogOpen}
          onClose={() => {
            setPageSelectionDialogOpen(false);
            setSelectedModuleForPage(null);
          }}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '16px',
              bgcolor: moduleListBg,
              minWidth: '300px',
              maxWidth: '90vw'
            }
          }}
        >
          <DialogTitle sx={{ color: textPrimary, fontWeight: 600, pb: 1 }}>
            Select Page for {selectedModuleForPage?.label}
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ py: 0 }}>
              {/* Option to create new page */}
              <ListItemButton
                onClick={() => handleAddModuleToPage('NEW_PAGE')}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderBottom: `1px solid ${moduleListBorder}`,
                  bgcolor: alpha(accentColor, 0.04),
                  '&:hover': {
                    bgcolor: alpha(accentColor, 0.08)
                  }
                }}
              >
                <ListItemText
                  primary="➕ Create New Page"
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: accentColor
                  }}
                  secondary="Add module to a new page"
                  secondaryTypographyProps={{
                    fontSize: '12px',
                    color: textMuted
                  }}
                />
              </ListItemButton>
              
              {/* Existing pages */}
              {pages.map((page, index) => (
                <ListItemButton
                  key={page.id}
                  onClick={() => handleAddModuleToPage(page.id)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderBottom: `1px solid ${moduleListBorder}`,
                    '&:hover': {
                      bgcolor: moduleListHover
                    },
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemText
                    primary={page.name || `Page ${index + 1}`}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: textPrimary
                    }}
                    secondary={page.id === currentPage?.id ? 'Current page' : ''}
                    secondaryTypographyProps={{
                      fontSize: '12px',
                      color: accentColor,
                      fontWeight: 600
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Box sx={{ p: 2, pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setPageSelectionDialogOpen(false);
                  setSelectedModuleForPage(null);
                }}
                sx={{
                  borderRadius: '8px',
                  color: textPrimary,
                  borderColor: moduleListBorder,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop version
  return (
    <motion.div
      initial={hasInitiallyAnimated.current ? false : { x: -280 }}
      animate={{ x: 0 }}
      exit={hasInitiallyAnimated.current ? false : { x: -280 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '180px',
        zIndex: 10
      }}
    >
      {/* Module List - Always Present */}
      <Box
        ref={toolbarRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: moduleListBg,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${moduleListBorder}`,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1,
          position: 'relative'
        }}
      >
        {/* Header with title and close button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: theme.colors?.text?.muted || 'rgba(30, 30, 30, 0.5)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}
          >
            Modules
          </Typography>
          
          {/* Close button - only visible when onClose prop is provided */}
          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 24,
                height: 24,
                color: 'rgba(30, 30, 30, 0.5)',
                '&:hover': {
                  color: 'rgb(146, 0, 32)',
                  bgcolor: 'rgba(146, 0, 32, 0.08)'
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Stack spacing={0.5}>
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                draggable
                onDragStart={(e) => handleDragStart(e, module.type)}
                data-module-item
              >
                <Box
                  ref={(el) => moduleRefs.current[module.type] = el}
                  onClick={(e) => handleModuleClick(e, module)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    bgcolor: selectedModule?.type === module.type ? selectedBg : 'transparent',
                    '&:hover': {
                      bgcolor: selectedModule?.type === module.type ? selectedHoverBg : moduleListHover,
                      transform: 'translateX(4px)'
                    },
                    '&:active': {
                      cursor: 'grabbing',
                      transform: 'scale(0.95)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      bgcolor: module.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: textPrimary
                    }}
                  >
                    {module.label}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Stack>

        {/* Module Info Popup */}
        <AnimatePresence mode="popLayout">
          {selectedModule && (
            <motion.div
              data-module-popup
              layout
              initial={{ opacity: 0, x: -12, zIndex: 5 }}
              animate={{ opacity: 1, x: 0, zIndex: 100 }}
              exit={{ opacity: 0, x: -8, zIndex: 5 }}
              transition={{ 
                opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                x: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                zIndex: { duration: 0 },
                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }}
              style={{
                position: 'absolute',
                left: 'calc(100% + 16px)',
                top: `${popupCenterY}px`,
                transform: 'translateY(-50%)',
                width: '300px'
              }}
            >
              {/* Main bubble with integrated arrow shape */}
              <Box
                sx={{
                  bgcolor: popupBackground,
                  borderRadius: '10px',
                  boxShadow: isDarkMode ? '0 12px 32px rgba(0, 0, 0, 0.45)' : '0 4px 20px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden',
                  border: `1px solid ${popupBorder}`,
                  position: 'relative',
                  zIndex: 2,
                  maxHeight: '50vh',
                  display: 'flex',
                  flexDirection: 'column',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    bgcolor: popupBackground,
                    border: `1px solid ${popupBorder}`,
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '3px 0 0 0',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.03)',
                    zIndex: 1
                  }
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    bgcolor: popupHeaderBg,
                    borderRadius: '10px 10px 0 0',
                    position: 'relative',
                    zIndex: 3
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '5px',
                      bgcolor: selectedModule.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <selectedModule.icon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                    <Typography
                      sx={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: popupText,
                        flex: 1
                      }}
                    >
                    {selectedModule.label}
                  </Typography>
                  
                    <Typography
                      onClick={() => handleAddModule(selectedModule)}
                      sx={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: accentColor,
                        cursor: 'pointer',
                        flexShrink: 0,
                        '&:hover': {
                          textDecoration: 'underline',
                          color: accentHoverColor
                        }
                      }}
                    >
                    Add
                  </Typography>
                </Box>

                {/* Description */}
                <Box 
                  sx={{ 
                    px: 1.25, 
                    py: 1, 
                    position: 'relative', 
                    zIndex: 3,
                    overflowY: 'auto',
                    flex: 1,
                    maxHeight: 'calc(50vh - 50px)'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      lineHeight: 1.4,
                      color: popupMutedText,
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                      hyphens: 'auto'
                    }}
                  >
                    {selectedModule.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Trash Zone Overlay - Always mounted, visibility controlled by opacity */}
      <motion.div
        animate={{ 
          opacity: isDraggingModule ? 1 : 0,
          pointerEvents: isDraggingModule ? 'auto' : 'none'
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 20
        }}
      >
        <Box
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: isOverTrash 
              ? 'rgba(60, 60, 58, 1)' 
              : 'rgba(80, 80, 78, 1)',
            backdropFilter: 'blur(16px)',
            borderRight: `1px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.12)'}`,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            gap: 1,
            transition: 'background-color 0.2s ease'
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <motion.div
              animate={{ 
                y: isOverTrash ? [0, -10, 0] : 0,
                scale: isOverTrash ? [1, 1.08, 1] : 1
              }}
              transition={{ 
                duration: 1.1,
                repeat: isOverTrash ? Infinity : 0,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              <Delete 
                sx={{ 
                  fontSize: 56, 
                  color: 'rgba(220, 220, 220, 0.7)'
                }} 
              />
            </motion.div>
            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'rgba(220, 220, 220, 0.8)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Drop to delete
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default ModuleToolbar;
