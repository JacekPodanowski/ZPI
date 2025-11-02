import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from '@mui/icons-material';
import { getAvailableModules } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import useNewEditorStore from '../../store/newEditorStore';

const ModuleToolbar = ({ isDraggingModule = false }) => {
  const modules = getAvailableModules();
  const theme = useTheme();
  const { removeModule } = useNewEditorStore();
  const [isOverTrash, setIsOverTrash] = useState(false);
  const hasInitiallyAnimated = useRef(false);

  const handleDragStart = (e, moduleType) => {
    console.log('[ModuleToolbar] Drag started:', moduleType);
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
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
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: theme.colors?.surface?.overlay || 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRight: `1px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.06)'}`,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                gap: 1
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
                    >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: '8px',
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        bgcolor: 'transparent',
                        '&:hover': {
                          bgcolor: theme.colors?.surface?.hover || 'rgba(30, 30, 30, 0.04)',
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
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModuleToolbar;
