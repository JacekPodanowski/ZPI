import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Close } from '@mui/icons-material';
import { getAvailableModules, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import useNewEditorStore from '../../store/newEditorStore';

const ModuleToolbar = ({ isDraggingModule = false }) => {
  const modules = getAvailableModules();
  const theme = useTheme();
  const { removeModule, addPage } = useNewEditorStore();
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [popupCenterY, setPopupCenterY] = useState(16);
  const [popupTop, setPopupTop] = useState(16);
  const [popupReady, setPopupReady] = useState(false);
  const hasInitiallyAnimated = useRef(false);
  const toolbarRef = useRef(null);
  const popupRef = useRef(null);

  const handleDragStart = (e, moduleType) => {
    console.log('[ModuleToolbar] Drag started:', moduleType);
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedModule(null); // Close popup when dragging
  };

  const handleModuleClick = (e, module) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const moduleCenter = rect.top + (rect.height / 2);
    const container = toolbarRef.current;

    if (container) {
      let offset = 0;
      let node = e.currentTarget;

      while (node && node !== container) {
        offset += node.offsetTop || 0;
        node = node.offsetParent;
      }

      const moduleCenterOffset = offset + (e.currentTarget.offsetHeight / 2);
      setPopupTop(moduleCenterOffset);
      setPopupCenterY(moduleCenterOffset);
    } else {
      setPopupTop(moduleCenter);
      setPopupCenterY(moduleCenter);
    }
    setPopupReady(false);
    setSelectedModule(module);
  };

  const handleAddModule = (module) => {
    const moduleTypeName = module.label;
    const newPageId = `page-${Date.now()}`;
    const newModuleId = `module-${Date.now()}`;
    const defaultContent = getDefaultModuleContent(module.type);
    
    addPage({
      id: newPageId,
      name: `${moduleTypeName} Page`,
      route: `/${module.type}`,
      modules: [{
        id: newModuleId,
        type: module.type,
        content: defaultContent
      }]
    });
    
    setSelectedModule(null);
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
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedModule]);

  useEffect(() => {
    if (!selectedModule) return;

    const updatePopupPosition = () => {
      const popupHeight = popupRef.current?.offsetHeight || 0;
      const newTop = Math.max(8, popupCenterY - (popupHeight / 2));
      setPopupTop(newTop);
      setPopupReady(true);
    };

    const frameId = requestAnimationFrame(updatePopupPosition);
    window.addEventListener('resize', updatePopupPosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [selectedModule, popupCenterY]);

  return (
    <motion.div
      initial={hasInitiallyAnimated.current ? false : { x: -280 }}
      animate={{ x: 0 }}
      exit={hasInitiallyAnimated.current ? false : { x: -280 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '180px',
        zIndex: 10
      }}
    >
      <AnimatePresence mode="wait">
        {isDraggingModule ? (
          <motion.div
            key="trash-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <Box
              onDragOver={handleTrashDragOver}
              onDragLeave={handleTrashDragLeave}
              onDrop={handleTrashDrop}
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: isOverTrash ? 'rgba(146, 0, 32, 0.95)' : 'rgba(146, 0, 32, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRight: `1px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.06)'}`,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                gap: 1,
                transition: 'all 0.3s ease',
                transform: isOverTrash ? 'scale(1.02)' : 'scale(1)'
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
                    y: isOverTrash ? [0, -8, 0] : 0
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: isOverTrash ? Infinity : 0,
                    repeatType: 'loop',
                    ease: 'easeInOut'
                  }}
                >
                  <Delete 
                    sx={{ 
                      fontSize: 64, 
                      color: 'white'
                    }} 
                  />
                </motion.div>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}
                >
                  DROP TO DELETE
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="module-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <Box
              ref={toolbarRef}
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: theme.colors?.surface?.overlay || 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRight: `1px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.06)'}`,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                gap: 1,
                position: 'relative'
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: theme.colors?.text?.muted || 'rgba(30, 30, 30, 0.5)',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  mb: 1,
                  px: 1
                }}
              >
                Modules
              </Typography>

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
                        bgcolor: selectedModule?.type === module.type ? 'rgba(146, 0, 32, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: selectedModule?.type === module.type ? 'rgba(146, 0, 32, 0.12)' : theme.colors?.surface?.hover || 'rgba(30, 30, 30, 0.04)',
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
                          color: theme.colors?.text?.base || 'rgb(30, 30, 30)'
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
              <AnimatePresence>
                {selectedModule && (
                  <motion.div
                    data-module-popup
                    initial={{ opacity: 0 }}
                    animate={{ opacity: popupReady ? 1 : 0, x: popupReady ? 0 : -20 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    ref={popupRef}
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 16px)',
                      top: `${popupTop}px`,
                      width: '300px',
                      zIndex: 100
                    }}
                  >
                    {/* Main bubble with integrated arrow shape */}
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                        overflow: 'visible',
                        border: '1px solid rgba(30, 30, 30, 0.08)',
                        position: 'relative',
                        zIndex: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: '-10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          bgcolor: 'white',
                          border: '1px solid rgba(30, 30, 30, 0.08)',
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
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
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
                            color: 'rgb(30, 30, 30)',
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
                            color: 'rgb(146, 0, 32)',
                            cursor: 'pointer',
                            flexShrink: 0,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Add
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Box sx={{ px: 1.25, py: 1, position: 'relative', zIndex: 3 }}>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            lineHeight: 1.4,
                            color: 'rgba(30, 30, 30, 0.7)',
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModuleToolbar;
